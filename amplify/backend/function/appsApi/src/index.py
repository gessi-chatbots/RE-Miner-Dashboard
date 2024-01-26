import json
import awsgi
import boto3
from boto3.dynamodb.conditions import Key

from flask_cors import CORS
from flask import Flask, jsonify, request
from uuid import uuid4
from datetime import datetime

app = Flask(__name__)
CORS(app)
BASE_ROUTE = "/apps"
client = boto3.client("dynamodb")
TABLE = "applications-dev"


@app.route(BASE_ROUTE, methods=['POST'])
def create_apps():
    print("[POST]: Create new Apps")
    request_json = json.loads(request.get_json())
    print(request_json)
    user_id = request_json.get("user_id")
    if user_id is None:
        return jsonify({"error": "user_id is required in the request"}), 400
    response = client.query(
        TableName="users-dev",
        KeyConditionExpression='user_id = :user_id',
        ExpressionAttributeValues={
            ':user_id': {'S': user_id}
        }
    )
    items = response.get('Items', [])
    if not items:
        return jsonify({"error": f"User with user_id {user_id} not found"}), 404

    apps = request_json.get("apps", [])
    print(f"Apps in JSON: {apps}")
    for app_entry in apps:
        app_name = app_entry.get("app_name")
        print(f"New app {app_name}")
        existing_app = None
        apps_database_list = items[0]['apps']['L']
        for app_db in apps_database_list:
            if 'M' in app_db:
                app_db_details = app_db['M']
                app_db_name_field = app_db_details.get('app_name', {}).get('S', None)
                if app_db_name_field:
                    print(app_db_name_field)
            if existing_app:
                break


        # Construct the application item to be inserted or updated
        app_item = {
            'M': {
                'app_name': {'S': app_entry.get("app_name")},
                'description': {'S': app_entry.get("description")},
                'summary': {'S': app_entry.get("summary")},
                'release_date': {'S': app_entry.get("release_date")},
            }
        }
        print(app_item)
        # Update the item in DynamoDB
        client.update_item(
            TableName="users-dev",
            Key={
                'user_id': {'S': user_id}
            },
            UpdateExpression='SET apps = list_append(apps, :app_item)',
            ExpressionAttributeValues={
                ':app_item': {'L': [app_item]}
            }
        )
        print("OK")
    return jsonify({"message": "Items created/updated successfully"}), 200


@app.route(BASE_ROUTE, methods=['GET'])
def list_apps():
    print("[GET]: All apps request")
    # Retrieve data from DynamoDB
    response = client.scan(TableName=TABLE)
    items = response.get('Items', [])
    # Map DynamoDB items to the AppData dictionary structure
    app_data_list = []
    for item in items:
        app_data_list.append({
            'id': item.get('id', {}).get('S', None),
            'name': item.get('name', {}).get('S', None),
            'description': item.get('description', {}).get('S', None),
            'summary': item.get('summary', {}).get('S', None),
            'release_date': item.get('release_date', {}).get('S', None),
            'version': int(item.get('version', {}).get('N', 0))  # Assuming default version is 0 if not present
        })
    print(app_data_list)
    return jsonify(app_data_list)

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
