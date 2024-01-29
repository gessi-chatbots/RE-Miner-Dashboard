import json
import awsgi
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

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
    
    
@app.route(BASE_ROUTE, methods=['POST'])
def create_apps():
    print("[POST]: Create new Apps")
    request_json = json.loads(request.get_json())
    user_id = request_json.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    
    apps = request_json.get("apps", [])
    for app_entry in apps:
        app_name = app_entry.get("app_name")
        print(f"New app {app_name}")
        app_item = {
            'M': {
                'id': {'S': str(uuid.uuid4())},
                'app_name': {'S': app_entry.get("app_name")},
                'description': {'S': app_entry.get("description")},
                'summary': {'S': app_entry.get("summary")},
                'release_date': {'S': app_entry.get("release_date")},
                'reviews': {'L': []}
            }
        }
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
    items = get_user_items(user_id)
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404 
    app_data_list = []
    for item in items:
        apps = item.get('apps', {}).get('L', [])
        print(f"apps: {apps}")
        for app_item in apps:
            print(f"app item: {app_item}")
            app_data = {
                'id': app_item.get('M', {}).get('id', {}).get('S', None),
                'app_name': app_item.get('M', {}).get('app_name', {}).get('S', None),
                'description': app_item.get('M', {}).get('description', {}).get('S', None),
                'summary': app_item.get('M', {}).get('summary', {}).get('S', None),
                'release_date': app_item.get('M', {}).get('release_date', {}).get('S', None),
                'version': int(app_item.get('M', {}).get('version', {}).get('N', 0))
            }
            app_data_list.append(app_data)
    print(app_data_list)
    return jsonify(app_data_list)

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
