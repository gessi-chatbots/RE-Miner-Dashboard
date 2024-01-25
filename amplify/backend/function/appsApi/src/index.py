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
    return jsonify(data=client.scan(TableName=TABLE))

@app.route(BASE_ROUTE, methods=['POST'])
def create_apps():
    request_json = request.get_json()
    client.put_item(TableName=TABLE, Item={
        'id': {'S': str(uuid4())},
        'name': {'S': request_json.get("app_name")},
        'description': {'S': request_json.get("description")},
        'summary': {'S': request_json.get("summary")},
        'release_date': {'S': request_json.get("release_date")},
        'version': {'I': request_json.get("version")}
    })
    return jsonify(message="item created")

def handler(event, context):
  print('received event:')
  print(event)

  return awsgi.response(app, event, context)
