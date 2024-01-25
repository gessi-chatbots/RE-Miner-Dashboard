import json
import boto3

def handler(event, context):
    database = boto3.resource('dynamodb')
    table = database.Table('users-dev')
    user_id = event['request']['userAttributes']['sub']
    email = event['request']['userAttributes']['email']
    name = event['request']['userAttributes']['name']
    family_name = event['request']['userAttributes']['family_name']

    table.put_item(
        Item={
            'user_id': user_id,
            'email': email,
            'name': name,
            'family_name': family_name
        }
    )

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('User created in DB')
    }
