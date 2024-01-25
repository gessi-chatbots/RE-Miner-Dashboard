import json
import awsgi
import boto3
from flask_cors import CORS
from flask import Flask, jsonify, request
from uuid import uuid4

app = Flask(__name__)
CORS(app)
BASE_ROUTE = "/apps"
client = boto3.client("dynamodb")
TABLE = "applications-dev"

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
