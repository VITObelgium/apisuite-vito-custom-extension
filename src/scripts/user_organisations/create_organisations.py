import json
import os

import pika as pika
import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()


def get_keycloak_token():
    resp = requests.post(f'{os.getenv("KEYCLOAK_AUTH_URL")}/realms/terrascope/protocol/openid-connect/token', data={
        'grant_type': 'client_credentials',
        'client_id': os.getenv("KEYCLOAK_CLIENT_ID"),
        'client_secret': os.getenv("KEYCLOAK_CLIENT_SECRET")
    })
    return resp.json()['access_token']


def get_keycloak_users(token):
    resp = requests.get(f'{os.getenv("KEYCLOAK_AUTH_URL")}/admin/realms/terrascope/users?max=20000', headers={
        'Authorization': f'Bearer {token}'
    })
    return resp.json()


def get_marketplace_user(uid):
    resp = requests.get(f'{os.getenv("APISUITE_URL")}/users/{uid}?oidc=true', headers={
        'Authorization': f'Bearer {os.getenv("APISUITE_TOKEN")}'
    })
    return resp.json() if resp.status_code == 200 else None


def get_db_connection():
    return psycopg2.connect(os.getenv("DB_URI"))


def close_db_connection(db):
    db.close()


def get_user_organisation_count(conn, uid):
    count = 0
    cur = conn.cursor()
    cur.execute(f'SELECT * FROM public.user_organization WHERE user_id = {uid}')
    row = cur.fetchone()
    while row is not None:
        count += 1
        row = cur.fetchone()
    cur.close()
    return count


def get_message_queue_connection():
    credentials = pika.PlainCredentials(os.getenv("MQ_USERNAME"), os.getenv("MQ_PASSWORD"))
    return pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672, '/', credentials))


def get_message_queue_channel(connection):
    channel = connection.channel()
    channel.queue_declare(queue='custom-ext-apps-local-python')
    return channel


def close_message_queue_connection(connection):
    connection.close()


def create_user_organisation(channel, uid):
    channel.basic_publish(exchange=os.getenv("MQ_EXCHANGE"),
                          routing_key='python.user.create_org',
                          body=json.dumps({
                              'user_id': uid
                          }))


token = get_keycloak_token()
users = get_keycloak_users(token)

db = get_db_connection()
mq = get_message_queue_connection()
channel = get_message_queue_channel(mq)

for user in users:
    marketplace_user = get_marketplace_user(user['id'])
    if marketplace_user:
        count = get_user_organisation_count(db, marketplace_user['id'])
        if count == 0:
            print(f'Creating new organisation for {user["username"]}')
            create_user_organisation(channel, marketplace_user['id'])
    else:
        print(f'User {user["username"]} {user["id"]} does not exist!')

close_db_connection(db)
close_message_queue_connection(mq)
