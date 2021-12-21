import json
import os

import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()


def create_billing_organisation(org_id, credits):
    resp = requests.post(f'{os.getenv("APISUITE_BILLING_URL")}/organizations', data={
        'id': org_id,
        'credits': credits
    }, headers={
        'Authorization': f'Bearer {os.getenv("APISUITE_TOKEN")}'
    })
    return resp.json() if resp.status_code == 201 else None


def update_user_billing_org(user_id, org_id):
    resp = requests.put(f'{os.getenv("APISUITE_BILLING_URL")}/users/{user_id}/organizations/{org_id}', headers={
        'Authorization': f'Bearer {os.getenv("APISUITE_TOKEN")}'
    })
    return True if resp.status_code == 204 else False


def get_db_connection(uri):
    return psycopg2.connect(uri)


def close_db_connection(db):
    db.close()


def get_marketplace_organisations(conn):
    results = list()
    cur = conn.cursor()
    cur.execute(f'SELECT user_id, org_id FROM public.user_organization WHERE current_org = true')
    row = cur.fetchone()
    while row is not None:
        results.append(row)
        row = cur.fetchone()
    cur.close()
    return results


def does_billing_organisation_exist(conn, org_id):
    cur = conn.cursor()
    cur.execute(f'SELECT * FROM public.organizations WHERE id={org_id}')
    row = cur.fetchone()
    cur.close()
    return row is not None


db = get_db_connection(os.getenv("DB_URI"))
db_billing = get_db_connection(os.getenv("DB_BILLING_URI"))

orgs = get_marketplace_organisations(db)
print(f'Found {len(orgs)} in the database')

for org in orgs:
    user_id, org_id = org

    # Creating the billing organisation
    if not does_billing_organisation_exist(db_billing, org_id):
        print(f'Creating new billing organisation {org_id} for user {user_id}')
        result = create_billing_organisation(org_id, int(os.getenv("BILLING_ORG_CREDITS")))
        if not result:
            print(f'Could not create billing organisation {org_id} - {json.dumps(result)}')

    # Linking the organisation as the current billing organisation
    result = update_user_billing_org(user_id, org_id)
    if not result:
        print(f'Could not assign billing organisation {org_id} to user {user_id}- {json.dumps(result)}')

close_db_connection(db)
close_db_connection(db_billing)
