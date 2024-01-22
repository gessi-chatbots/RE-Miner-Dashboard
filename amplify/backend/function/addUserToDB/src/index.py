import json
import boto3

def handler(event, context):
    database = boto3.resource('dynamodb')
    table = database.Table('users-dev')

    table.put_item(
        Item={
            'email': event['request']['userAttributes']['email']
        }
    )

    return event
