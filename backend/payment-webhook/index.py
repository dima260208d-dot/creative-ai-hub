'''
Business: Receive YooKassa webhooks and credit tokens automatically
Args: event with httpMethod, body (YooKassa notification)
      context with request_id
Returns: HTTP 200 response
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        notification_type = body_data.get('event')
        payment_object = body_data.get('object', {})
        
        if notification_type != 'payment.succeeded':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ignored'}),
                'isBase64Encoded': False
            }
        
        payment_id = payment_object.get('id')
        payment_status = payment_object.get('status')
        amount_value = float(payment_object.get('amount', {}).get('value', 0))
        metadata = payment_object.get('metadata', {})
        email = metadata.get('email', '')
        
        if payment_status != 'succeeded' or not email:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'invalid'}),
                'isBase64Encoded': False
            }
        
        amount_int = int(amount_value)
        
        credit_packages = {
            99: 10,
            399: 60,
            699: 125,
            2999: 650
        }
        
        tokens_to_add = credit_packages.get(amount_int, 0)
        
        if tokens_to_add == 0:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'unknown_package'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id FROM payment_transactions WHERE transaction_id = %s",
            (payment_id,)
        )
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'already_processed'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "UPDATE users SET credits = credits + %s WHERE email = %s RETURNING credits",
            (tokens_to_add, email)
        )
        result = cur.fetchone()
        
        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'user_not_found'}),
                'isBase64Encoded': False
            }
        
        new_balance = result[0]
        
        cur.execute(
            """
            INSERT INTO payment_transactions (transaction_id, user_email, amount, tokens_added, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (payment_id, email, amount_int, tokens_to_add, datetime.now())
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'status': 'success',
                'tokens_added': tokens_to_add,
                'new_balance': new_balance
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'error', 'message': str(e)}),
            'isBase64Encoded': False
        }
