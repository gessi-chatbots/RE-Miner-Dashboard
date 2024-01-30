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
BASE_ROUTE = "/apps"
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
def update_app():
    print("[PUT]: Update an app data")
    user_id = request.args.get('user_id')
    app_id =  request.args.get('app_id')
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    elif app_id is None:
        return jsonify({"error": "app_id is required in the request"}), 400
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    app = json.loads(request.get_json())
    app_updated = {
        'M': {
            'id': {'S': app.get('id')},
            'app_name': {'S': app.get("app_name")},
            'description': {'S': app.get("description", "N/A")},
            'summary': {'S': app.get("summary", "N/A")},
            'release_date': {'S': app.get("release_date", "N/A")},
            'version': {'S': app.get('version', "N/A")}
        }
    }
    app_index = None
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for index, app_item in enumerate(apps):
            if app_item.get('M', {}).get('id', {}).get('S') == app_id:
                app_index = index
                break

    if app_index is not None:   
        response = client.update_item(
            TableName=TABLE,
            Key={
                'user_id': {'S': user_id}
            },
            UpdateExpression=f'SET apps[{app_index}] = :updated_app',
            ExpressionAttributeValues={
                ':updated_app': app_updated
            }
        )
        print(response)
        return jsonify({"message": "App updated successfully"}), 200
    else:
        return jsonify({"message": "App not found"}), 404


  
    
@app.route(BASE_ROUTE, methods=['POST'])
def create_apps():
    print("[POST]: Create new Apps")
    apps_json = json.loads(request.get_json())
    user_id = request.args.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    
    apps = apps_json.get("apps", [])
    print(f"apps to create: {apps}")
    for new_app in apps:
        app_reviews = new_app.get("reviews", [])
        reviews_list = []
        for review in app_reviews:
            review_dict = {
                'M': {
                    'id': {'S': review.get('id')}, 
                    'review': {'S': review.get("review")},
                    'score': {'N': str(review.get("score", 0))},
                    'date': {'S': review.get("date", "N/A")},
                    'features': {'L': []},
                    'sentiments': {'L': []}
                }
            }
            reviews_list.append(review_dict) 
        app_item = {
            'M': {
                'id': {'S': str(uuid.uuid4())},
                'app_name': {'S': new_app.get("app_name")},
                'description': {'S': new_app.get("description", "N/A")},
                'summary': {'S': new_app.get("summary", "N/A")},
                'release_date': {'S': new_app.get("release_date", "N/A")},
                'version': {'S': new_app.get('version', "N/A")},
                'reviews': {'L': reviews_list}
            }
        }
        print(f"new app to be created with reviews {app_item}")
        try:
            client.update_item(
                TableName=TABLE,
                Key={
                    'user_id': {'S': user_id}
                },
                UpdateExpression='SET apps = list_append(apps, :app_item)',
                ExpressionAttributeValues={
                    ':app_item': {'L': [app_item]}
                }
            )
        except ClientError as e:
            if e.response['Error']['Code'] == 'ValidationException':
                # no app list exists for that user, we create a new one
                client.update_item(
                    TableName=TABLE,
                        Key={
                            'user_id': {'S': user_id}
                        },
                        UpdateExpression='SET apps = :app_list',
                        ExpressionAttributeValues={
                            ':app_list': {'L': [app_item]}
                        }
                )
    return jsonify({"message": "App/s created successfully"}), 200


@app.route(BASE_ROUTE, methods=['GET'])
def list_apps():
    print("[GET]: All apps from user")
    user_id = request.args.get('user_id')
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 4))
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    
    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    app_data_list = []
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        for app_item in apps[start_index:end_index]:
            app_data = {
                'id': app_item.get('M', {}).get('id', {}).get('S', None),
                'app_name': app_item.get('M', {}).get('app_name', {}).get('S', None),
                'description': app_item.get('M', {}).get('description', {}).get('S', None),
                'summary': app_item.get('M', {}).get('summary', {}).get('S', None),
                'release_date': app_item.get('M', {}).get('release_date', {}).get('S', None),
                'version': app_item.get('M', {}).get('version', {}).get('S', 0)
            }
            app_data_list.append(app_data)
    
    total_app_qty = len(item.get('apps', {}).get('L', []))
    total_pages = ceil(total_app_qty / page_size)    
    print(app_data_list)
    print(total_pages)
    print(total_app_qty)
    return jsonify({
        'apps': app_data_list,
        'total_pages': total_pages
    })
@app.route(BASE_ROUTE, methods=['DELETE'])
def delete_app():
    print("[DELETE]: Delete an App")
    user_id = request.args.get('user_id')
    app_id = request.args.get("app_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    elif app_id is None:
        return jsonify({"error": "app_id is required in the request"}), 400

    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    new_apps = []
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        print(f"Apps before deletion: {apps}")
        for app in apps:
            id = app.get('M', {}).get('app_name', {}).get('id', {}).get('S', None),
            if id is not None and app_id in app.get('M').get('id').get('S'):
                apps.remove(app)
                break
        new_apps.extend(apps)
    print(f"Apps after deletion: {new_apps}")

    update_expression = 'SET apps = :app_list'
    expression_attribute_values = {}

    if new_apps:
        expression_attribute_values[':app_list'] = {'L': new_apps}
    else:
        expression_attribute_values[':app_list'] = {'L': []}
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
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }

    return flask_response
