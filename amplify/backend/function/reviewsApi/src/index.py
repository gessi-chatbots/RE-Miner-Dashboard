import json
import awsgi
import boto3
import urllib3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from math import ceil
from flask_cors import CORS
from flask import Flask, jsonify, request
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)
BASE_ROUTE = "/reviews"
client = boto3.client("dynamodb")
TABLE = "users-dev"

def split_sentences(text):
    punctuation_marks = ['.', '!', '?']
    sentences = [sentence.strip() for sentence in text.split('.') if sentence]
    
    for mark in punctuation_marks[1:]:
        sentences = [sent.strip() + mark if sent.endswith(mark) else sent for sent in sentences]

    return sentences

def get_user_items(user_id): 
    response = client.query(
        TableName=TABLE,
        KeyConditionExpression='user_id = :user_id',
        ExpressionAttributeValues={
            ':user_id': {'S': user_id}
        }
    )
    items = response.get('Items', [])
    return items

@app.route(BASE_ROUTE, methods=['DELETE'])
def delete_review():
    print("[DELETE]: Delete a review")
    user_id = request.args.get('user_id')
    app_id = request.args.get("app_id")
    review_id = request.args.get("review_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    elif app_id is None:
        return jsonify({"error": "app_id is required in the request"}), 400
    elif review_id is None:
        return jsonify({"error": "review_id is required in the request"}), 400
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    new_app_reviews = []
    app_index = None
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item_index, app_item in enumerate(apps):
            app_item_id = app_item.get('M', {}).get('id', {}).get('S', None)
            if app_item_id == app_id:
                reviews = app_item.get('M',{}).get('reviews', {}).get('L', [])
                for review_item in reviews:
                    review_item_id = review_item.get('M', {}).get('id', {}).get('S', None)
                    if review_item_id is not None and review_id == review_item_id:
                        reviews.remove(review_item)
                        app_index = app_item_index
                        break
                new_app_reviews.extend(reviews)
    if app_index is None:
        return jsonify({"error": f"App with app_id {app_id} not found for user {user_id}"}), 404
    update_expression = f'SET apps[{app_index}].reviews = :review_list'
    expression_attribute_values = {}
    if new_app_reviews:
        expression_attribute_values[':review_list'] = {'L': new_app_reviews}
    else:
        expression_attribute_values[':review_list'] = {'L': []}
    client.update_item(
        TableName=TABLE,
        Key={
            'user_id': {'S': user_id}
        },
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_attribute_values
    )
    return jsonify({"message": "Review deleted successfully"}), 200

@app.route(BASE_ROUTE, methods=['PUT'])
def update_review():
    print("[PUT]: Update a review data")
    user_id = request.args.get('user_id')
    review_id = request.args.get('review_id')
    app_id = request.args.get('app_id')
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    elif app_id is None: 
        return jsonify({"error": "app_id is required in the request"}), 400
    elif review_id is None: 
        return jsonify({"error": "review_id is required in the request"}), 400
    
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    review = json.loads(request.get_json())
    review_updated = {
        'M': {
            'id': {'S': review.get('id')},
            'review': {'S': review.get("review")},
            'score': {'N': str(review.get("score"))},
            'date': {'S': review.get("date")},
            'features': {'L': []},
            'sentiments': {'L': []},
            'analyzed': {'BOOL', review.get('analyzed')}
        }
    }

    app_index = None
    review_index = None
    break_all_loops = False
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_i, app_item in enumerate(apps):
            reviews = app_item.get('M',{}).get('reviews', {}).get('L', [])
            for review_i, review_item in enumerate(reviews):
                    review_item_details = review_item.get('M', {})
                    review_item_id = review_item_details.get('id', {}).get('S', None)
                    if review_item_id is not None and review_item_id == review_id:
                        app_index = app_i
                        review_index = review_i
                        review_updated.get('M').update({'features': review_item_details.get('features')})
                        review_updated.get('M').update({'sentiments': review_item_details.get('sentiments')})
                        break_all_loops = True
                        break
            if break_all_loops:
                break
        if break_all_loops:
            break

    if app_index is not None and review_index is not None:
        response = client.update_item(
            TableName=TABLE,
            Key={
                'user_id': {'S': user_id}
            },
            UpdateExpression=f'SET apps[{app_index}].reviews[{review_index}] = :updated_review',
            ExpressionAttributeValues={
                ':updated_review': review_updated
            }
        )
        return jsonify({"message": "Review updated successfully"}), 200
    else:
        return jsonify({"message": "Review not found"}), 404 

@app.route(BASE_ROUTE, methods=['POST'])
def create_reviews():
    print("[POST]: Create a new Review")

    try:
        review_json = json.loads(request.get_json())
    except json.JSONDecodeError as e:
        return jsonify({"error": "Malformed JSON in the request body"}), 400

    user_id = request.args.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400

    app_id = request.args.get("app_id")
    if app_id is None:
        return jsonify({"error": "app_id is required in the request"}), 400

    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404

    app_index = None
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for index, app_item in enumerate(apps):
            if app_item.get('M', {}).get('id', {}).get('S') == app_id:
                app_index = index
                break

    if app_index is not None:
        sentiment_list = []
        review_text = review_json.get("review").get("review")
        sentences = split_sentences(review_text)        
        for sentence in sentences:
            if sentence:

                sentiment_dict = {
                    'M': {
                        #'sentiment': {'S': random.choice(['Happiness', 'Sadness', 'Anger', 'Surprise', 'Fear', 'Disgust'])},
                        'sentiment': {'S': 'Not relevant'},
                        'sentence': {'S': sentence.strip()}
                    }
                }
            sentiment_list.append(sentiment_dict)

        '''
        feature_list = []
        features = ['Feature1', 'Feature2', 'Feature3', 'Feature4', 'Feature5', 'Feature6', 'Feature7', 'Feature8', 'Feature9', 'Feature10', 'Feature11', 'Feature12', 'Feature13', 'Feature14', 'Feature15']
        for i in range(random.randint(1, 3)):
            feature_dict = {
                'M': {
                    'feature': {'S': random.choice(features)}
                }
            }
            feature_list.append(feature_dict)
        '''
        review_item = {
                'M': {
                    'id': {'S': review_json.get("review").get("id")},
                    'review': {'S': review_json.get("review").get("review")},
                    'score': {'N': review_json.get("review").get("score")},
                    'date': {'S': review_json.get("review").get("date")},
                    'analyzed': {'BOOL': False},
                    'features': {'L': []},
                    'sentiments': {'L': sentiment_list}
            }
        }
        try:
            client.update_item(
                TableName=TABLE,
                Key={
                    'user_id': {'S': user_id}
                },
                UpdateExpression=f'SET apps[{app_index}].reviews = list_append(reviews, :review_item)',
                ExpressionAttributeValues={
                    ':review_item': {'L': [review_item]}
                }
            )
        except ClientError as e:
            if e.response['Error']['Code'] == 'ValidationException':
                # no review list exists for that app, we create a new one
                client.update_item(
                    TableName=TABLE,
                    Key={
                        'user_id': {'S': user_id}
                    },
                    UpdateExpression=f'SET apps[{app_index}].reviews = :review_list',
                    ExpressionAttributeValues={
                        ':review_list': {'L': [review_item]}
                    }
                )
        return jsonify({"message": "Reviews/s created successfully"}), 200
    else: 
        return jsonify({"message": "Reviews' App not found"}), 404

@app.route(BASE_ROUTE + '/review/<string:reviewId>', methods=['GET'])
def get_user_review(reviewId):
    print("[GET]: Review from user")
    user_id = request.args.get('user_id')

    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    
    review = None
    review_found = False
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            reviews = app_item.get('M', {}).get('reviews', {}).get('L', [])
            for review_item in reviews:
                if review_item.get('M', {}).get('id', {}).get('S') == reviewId:
                    sentiment_list = []
                    for sentiment in review_item.get('M', {}).get('sentiments', {}).get('L', []):
                        sentiment_data = {
                            'sentiment': sentiment.get('M').get('sentiment').get('S'),
                            'sentence': sentiment.get('M').get('sentence').get('S')
                        }
                        sentiment_list.append(sentiment_data)
                    feature_list = []
                    for feature in review_item.get('M').get('features').get('L'):
                        feature_list.append(feature.get('S'))
                    review_data = {
                        'app_id': app_item.get('M', {}).get('id', {}).get('S', None),
                        'app_name':  app_item.get('M', {}).get('app_name', {}).get('S', None),
                        'id': review_item.get('M', {}).get('id', {}).get('S', None),
                        'review': review_item.get('M', {}).get('review', {}).get('S', None),
                        'date': review_item.get('M', {}).get('date', {}).get('S', None),
                        'score': review_item.get('M', {}).get('score', {}).get('N', 0),
                        'analyzed': review_item.get('M',{}).get('analyzed', {}).get('BOOL'),
                        'sentiments': sentiment_list,
                        'features': feature_list
                    }
                    review = review_data
                    review_found = True
                    break
            if review_found:
                break
        if review_found:
            break

    return jsonify({
        'review': review
    })

@app.route(BASE_ROUTE, methods=['GET'])
def list_paginated_reviews():
    print("[GET]: All reviews from user")
    user_id = request.args.get('user_id')
    
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 8))
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    
    elements_to_skip = (page - 1) * page_size
    num_elements = page_size
    review_data_list = []


    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            reviews = app_item.get('M', {}).get('reviews', {}).get('L', [])
            for review_item in reviews:
                if elements_to_skip > 0:
                    elements_to_skip -= 1
                    continue
                sentiment_list = []
                for sentiment in review_item.get('M', {}).get('sentiments', {}).get('L', []):
                    sentiment_data = {
                        'sentiment': sentiment.get('M').get('sentiment').get('S'),
                        'sentence': sentiment.get('M').get('sentence').get('S')
                    }
                    sentiment_list.append(sentiment_data)
                feature_list = []
                for feature in review_item.get('M').get('features',[]).get('L'):
                    feature_list.append(feature.get('S'))
                review_data = {
                    'app_id': app_item.get('M', {}).get('id', {}).get('S', None),
                    'app_name':  app_item.get('M', {}).get('app_name', {}).get('S', None),
                    'id': review_item.get('M', {}).get('id', {}).get('S', None),
                    'review': review_item.get('M', {}).get('review', {}).get('S', None),
                    'date': review_item.get('M', {}).get('date', {}).get('S', None),
                    'score': review_item.get('M', {}).get('score', {}).get('N', 0),
                    'sentiments': sentiment_list,
                    'features': feature_list,
                    'analyzed': review_item.get('M',{}).get('analyzed', {}).get('BOOL')
                }
                review_data_list.append(review_data)
                num_elements -= 1

                if num_elements == 0:
                    break
            if num_elements == 0:
                break
        if num_elements == 0:
            break

    total_reviews_qty = 0
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            total_reviews_qty += len(app_item.get('M', {}).get('reviews', {}).get('L', []))
    total_pages = ceil(total_reviews_qty / page_size)
    print(review_data_list)
    return jsonify({
        'reviews': review_data_list,
        'total_pages': total_pages
    })

@app.route(BASE_ROUTE + '/detailed', methods=['GET'])
def list_detailed_reviews():
    print("[GET]: All detailed reviews from user")
    user_id = request.args.get('user_id')
    
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 

    review_data_list = []

    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            reviews = app_item.get('M', {}).get('reviews', {}).get('L', [])
            for review_item in reviews:
                sentiment_list = []
                for sentiment in review_item.get('M', {}).get('sentiments', {}).get('L', []):
                    sentiment_data = {
                        'sentiment': sentiment.get('M').get('sentiment').get('S'),
                        'sentence': sentiment.get('M').get('sentence').get('S')
                    }
                    sentiment_list.append(sentiment_data)
                feature_list = []
                for feature in review_item.get('M').get('features',[]).get('L'):
                    feature_list.append(feature.get('S'))
                review_data = {
                    'app_id': app_item.get('M', {}).get('id', {}).get('S', None),
                    'app_name':  app_item.get('M', {}).get('app_name', {}).get('S', None),
                    'id': review_item.get('M', {}).get('id', {}).get('S', None),
                    'review': review_item.get('M', {}).get('review', {}).get('S', None),
                    'date': review_item.get('M', {}).get('date', {}).get('S', None),
                    'score': review_item.get('M', {}).get('score', {}).get('N', 0),
                    'analyzed': review_item.get('M',{}).get('analyzed', {}).get('BOOL'),
                    'sentiments': sentiment_list,
                    'features': feature_list
                }
                review_data_list.append(review_data)

    return jsonify({
        'reviews': review_data_list,
    })

@app.route(BASE_ROUTE + '/detailed/app', methods=['GET'])
def list_detailed_reviews_app():
    print("[GET]: All detailed reviews of an app from user")
    user_id = request.args.get('user_id')
    app_id = request.args.get('app_id')

    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 

    review_data_list = []

    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            if app_id == app_item.get('M').get('id').get('S'):
                reviews = app_item.get('M', {}).get('reviews', {}).get('L', [])
                for review_item in reviews:
                    sentiment_list = []
                    for sentiment in review_item.get('M', {}).get('sentiments', {}).get('L', []):
                        sentiment_data = {
                            'sentiment': sentiment.get('M').get('sentiment').get('S'),
                            'sentence': sentiment.get('M').get('sentence').get('S')
                        }
                        sentiment_list.append(sentiment_data)
                    feature_list = []
                    for feature in review_item.get('M').get('features',[]).get('L'):
                        feature_list.append(feature.get('S'))
                    review_data = {
                        'app_id': app_item.get('M', {}).get('id', {}).get('S', None),
                        'app_name':  app_item.get('M', {}).get('app_name', {}).get('S', None),
                        'id': review_item.get('M', {}).get('id', {}).get('S', None),
                        'review': review_item.get('M', {}).get('review', {}).get('S', None),
                        'date': review_item.get('M', {}).get('date', {}).get('S', None),
                        'score': review_item.get('M', {}).get('score', {}).get('N', 0),
                        'analyzed': review_item.get('M',{}).get('analyzed', {}).get('BOOL'),
                        'sentiments': sentiment_list,
                        'features': feature_list
                    }
                    review_data_list.append(review_data)
    print(review_data_list)
    return jsonify({
        'reviews': review_data_list,
    })

@app.route(BASE_ROUTE + '/analyze', methods=['POST'])
def analyze_reviews(): 
    print("[POST]: Analyze Review")
    user_id = request.args.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 

    body = json.loads(request.get_json())

    feature_extraction = body.get('featureExtraction')
    feature_model = None
    sentiment_extraction = body.get('sentimentExtraction')
    sentiment_model = None
    if feature_extraction is not None:
        feature_model = body.get('featureModel')
        if feature_model is None: 
            return jsonify({"error": "Feature extraction selected but no model requested"}), 400
    
    if sentiment_extraction is not None: 
        sentiment_model = body.get('sentimentModel')
        if sentiment_model is None: 
            return jsonify({"error": "Sentiment extraction selected but no model requested"}), 400

    reviews = body.get('reviews')
    if reviews is None: 
        return jsonify({"error": "No reviews selected for processing"}), 400
    
    app_index = None
    review_index = None
    break_all_loops = False
    for review in reviews:
        review_updated = {
            'M': {
                'id': {'S': review.get('id')},
                'review': {'S': review.get("review")},
                'score': {'N': str(review.get("score"))},
                'date': {'S': review.get("date")},
                'features': {'L': []},
                'sentiments': {'L': []},
                'analyzed': {'BOOL': True}
            }
        }
        for sentiment in review.get('sentiments'):
            sentence = sentiment.get('sentence')
            analysis = analyze_reviews_for_sentence(sentiment_model, feature_model, sentence)
            if analysis:
                emotions = analysis[0]['text']['emotions']
                features = analysis[0]['text']['features']
                print(f"emotions in analysis: {emotions}")
                print(f"features in analysis: {features}")
                feature_list = [{'S': feature} for feature in features]
                emotion_list = []
                if len(emotions) == 0:
                    emotion_list = [{'M': {'sentence': {'S': sentence}, 'sentiment': {'S': "Not relevant"}}}]
                else: 
                    for emotion in emotions:
                        emotion_element = {
                            'M': {
                                'sentence': {'S': sentence},
                                'sentiment': {'S': emotion}
                            }
                        }
                        emotion_list.append(emotion_element)
                review_updated['M']['features']['L'].extend(feature_list)
                review_updated['M']['sentiments']['L'].extend(emotion_list)

        for item in items:
            apps = item.get('apps', {}).get('L', [])
            for app_i, app_item in enumerate(apps):
                reviews = app_item.get('M',{}).get('reviews', {}).get('L', [])
                for review_i, review_item in enumerate(reviews):
                    review_item_details = review_item.get('M', {})
                    review_item_id = review_item_details.get('id', {}).get('S', None)
                    if review_item_id is not None and review_item_id == review.get('id'):
                        app_index = app_i
                        review_index = review_i
                        # review_updated['M']['features']['L'].extend(review_item_details.get('features', {}).get('L', []))
                        # review_updated['M']['sentiments']['L'].extend(review_item_details.get('sentiments', {}).get('L', []))
                        break_all_loops = True
                        break
                if break_all_loops:
                    break
            if break_all_loops:
                break
    print(f"review updated: {review_updated}")
    if app_index is not None and review_index is not None:
        response = client.update_item(
            TableName=TABLE,
            Key={
                'user_id': {'S': user_id}
            },
            UpdateExpression=f'SET apps[{app_index}].reviews[{review_index}] = :updated_review',
            ExpressionAttributeValues={
                ':updated_review': review_updated
            }
        )
        waiter = client.get_waiter('table_exists')
        waiter.wait(
            TableName=TABLE,
            WaiterConfig={
                'Delay': 5,
                'MaxAttempts': 20
            }
        )
        return jsonify({"message": "Review updated successfully"}), 200
    return jsonify({"success": "ok"}), 200


def analyze_reviews_for_sentence(sentiment_model, feature_model, sentence):
    try:
        http = urllib3.PoolManager()
        endpoint_url = ""
        url = "https://4da1-79-157-114-161.ngrok-free.app"
        if sentiment_model != "" and feature_model != "":
            print(f"feature model: {feature_model}, sentiment model: {sentiment_model}")
            endpoint_url = f"{url}/analyze-reviews?model_emotion={sentiment_model}&model_features={feature_model}"
        elif sentiment_model != "" and feature_model == "":
            print(f"sentiment model: {sentiment_model}")
            endpoint_url = f"{url}/analyze-reviews?model_emotion={sentiment_model}"
        elif feature_model != None and sentiment_model == "":
            print(f"feature model: {feature_model}")
            endpoint_url = f"{url}/analyze-reviews?model_features={feature_model}"
        
        print(f"endpoint url: {endpoint_url}")
        payload = {
            "text": [
                {
                    "id": "1",  # api compulsory, useless for us
                    'text': sentence
                }
            ]
        }

        encoded_data = json.dumps(payload).encode('utf-8')

        response = http.request('POST', endpoint_url, body=encoded_data, headers={'Content-Type': 'application/json'})

        if response.status == 200:
            response_data = json.loads(response.data.decode('utf-8'))
            print(response_data)
            return response_data
        else:
            print(f"Analyze-reviews for sentence '{sentence}' failed. Status code: {response.status}, Message: {response.data}")
    except Exception as e:
        print(f"Analyze-reviews for sentence '{sentence}' failed. Error: {str(e)}")

def handler(event, context):
    print('[Apps API]: Received Event')
    print(event)
    flask_response = awsgi.response(app, event, context)

    flask_response['headers'] = {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
    }

    return flask_response
