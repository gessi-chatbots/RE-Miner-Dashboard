import json
import awsgi
import boto3
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

@app.route(BASE_ROUTE, methods=['PUT'])
def update_review():
    print("[PUT]: Update a review data")
    user_id = request.args.get('user_id')
    review_id =  request.args.get('review_id')
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    elif review_id is None:
        return jsonify({"error": "app_id is required in the request"}), 400
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    app = json.loads(request.get_json())
    review_updated = {
        'M': {
            'id': {'S': app.get('id')},
            'review': {'S': app.get("review")},
            'score': {'S': app.get("score")},
            'date': {'S': app.get("at")}
        }
    }
    app_index = None
    review_index = None
    break_all_loops = False
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_i, app_item in enumerate(apps):
            reviews = app_item.get('reviews', {}).get('L', [])
            for review_i, review_item in enumerate(reviews):
                    review_details = review_item.get('M', {})
                    review_item_id = review_details.get('id', {}).get('S', None)
                    if review_item_id is not None and review_item_id == review_id:
                        app_index = app_i
                        review_index = review_i
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
        print(response)
        return jsonify({"message": "Review updated successfully"}), 200
    else:
        return jsonify({"message": "Review not found"}), 404


  
    
@app.route(BASE_ROUTE, methods=['POST'])
def create_apps():
    print("[POST]: Create new reviews")
    reviews_json = json.loads(request.get_json())
    user_id = request.args.get("user_id")
    app_id = request.args.get("app_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    
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
        reviews = reviews_json.get("reviews", [])
        for review in reviews:
            review_item = {
                'M': {
                    'id': {'S': review.get("review_id")},
                    'review': {'S': review.get("app_name")},
                    'score': {'N': review.get("score")},
                    'date': {'S': review.get("at")},
                    'features': {'L': []}
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
        return jsonify({"message": "App/s created successfully"}), 200
    else: 
        return jsonify({"message": "Reviews' App not found"}), 404
    

@app.route(BASE_ROUTE, methods=['GET'])
def list_reviews():
    print("[GET]: All reviews from user")
    user_id = request.args.get('user_id')
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 4))
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    
    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    review_data_list = []
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            reviews = app_item.get('M',{}).get('reviews', {}).get('L', [])
            for review_item in reviews:
                review_data = {
                    'app_id': app_item.get('M', {}).get('id', {}).get('S', None),
                    'app_name':  app_item.get('M', {}).get('app_name', {}).get('S', None),
                    'id': review_item.get('M', {}).get('id', {}).get('S', None),
                    'review': review_item.get('M', {}).get('review', {}).get('S', None),
                    'date': review_item.get('M', {}).get('date', {}).get('S', None),
                    'score': review_item.get('M', {}).get('score', {}).get('N', 0)
                }
                review_data_list.append(review_data)
                end_index -= 1
                if end_index == 0:
                    break
            if end_index == 0:
                break
        if end_index == 0:
            break     
    total_reviews_qty = 0
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps:
            total_reviews_qty += len(app_item.get('M', {}).get('reviews', {}).get('L', []))

    total_pages = ceil(total_reviews_qty / page_size)    

    return jsonify({
        'reviews': review_data_list,
        'total_pages': total_pages
    })

@app.route(BASE_ROUTE, methods=['DELETE'])
def delete_review():
    print("[DELETE]: Delete an App")
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
            print(app_item_id)
            if app_item_id == app_id:
                reviews = app_item.get('M',{}).get('reviews', {}).get('L', [])
                for review_item in reviews:
                    review_item_id = review_item.get('M', {}).get('id', {}).get('S', None)
                    if review_item_id is not None and review_item_id in review_item.get('M').get('id').get('S'):
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
    return jsonify({"message": "App deleted successfully"}), 200

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
