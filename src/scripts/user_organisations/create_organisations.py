import json

import pika as pika
import psycopg2
import requests

KEYCLOAK_AUTH_URL = 'https://sso-int.vgt.vito.be/auth'
KEYCLOAK_CLIENT_ID = 'mep-etl'
KEYCLOAK_CLIENT_SECRET = '0441ca84-f92a-40b0-aa18-ad1d695dfeea'

APISUITE_URL = 'https://apisuite-dev.terrascope.be'
APISUITE_TOKEN = '2_16cfc749f97033c143fa3f93151fd2a5697bbef3'

DB_URI = 'postgres://mep_apisuite_dev:api567$Z@postgresqldmzdev.services.rscloud.vito.be:5432/mep_apisuite_dev?sslmode=disable'

MQ_USERNAME = 'apisuite'
MQ_PASSWORD = '5155ef6534cc7ed732288166e02aadd5'
MQ_EXCHANGE = 'apisuite_events_dev'


def get_keycloak_token():
    resp = requests.post(f'{KEYCLOAK_AUTH_URL}/realms/terrascope/protocol/openid-connect/token', data={
        'grant_type': 'client_credentials',
        'client_id': KEYCLOAK_CLIENT_ID,
        'client_secret': KEYCLOAK_CLIENT_SECRET
    })
    return resp.json()['access_token']


def get_keycloak_users(token):
    resp = requests.get(f'{KEYCLOAK_AUTH_URL}/admin/realms/terrascope/users?max=20000', headers={
        'Authorization': f'Bearer {token}'
    })
    return resp.json()


def get_marketplace_user(uid):
    resp = requests.get(f'{APISUITE_URL}/users/{uid}?oidc=true', headers={
        'Authorization': f'Bearer {APISUITE_TOKEN}'
    })
    return resp.json() if resp.status_code == 200 else None


def get_db_connection():
    return psycopg2.connect(DB_URI)


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
    credentials = pika.PlainCredentials(MQ_USERNAME, MQ_PASSWORD)
    return pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672, '/', credentials))


def get_message_queue_channel(connection):
    channel = connection.channel()
    channel.queue_declare(queue='custom-ext-apps-local-python')
    return channel


def close_message_queue_connection(connection):
    connection.close()


def create_user_organisation(channel, uid):
    channel.basic_publish(exchange=MQ_EXCHANGE,
                          routing_key='python.user.create_org',
                          body=json.dumps({
                              'user_id': uid
                          }))


db = get_db_connection()
mq = get_message_queue_connection()
channel = get_message_queue_channel(mq)

token = get_keycloak_token()
users = get_keycloak_users(token)

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
