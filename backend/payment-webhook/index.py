'''
Business: Receive payment notifications from banks and auto-credit tokens
Args: event with httpMethod, body (transaction data from bank)
      context with request_id
Returns: HTTP response confirming receipt
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime
import re

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def extract_transaction_id(message: str) -> str:
    match = re.search(r'ID:(\w+)', message)
    if match:
        return match.group(1)
    return ''

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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        amount = body_data.get('amount', 0)
        message = body_data.get('message', '')
        sender = body_data.get('sender', '')
        
        transaction_id = extract_transaction_id(message)
        
        if not transaction_id or amount <= 0:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid webhook data'}),
                'isBase64Encoded': False
            }
        
        credit_packages = {
            500: 10,
            2000: 55,
            3500: 115,
            15000: 600
        }
        
        tokens_to_add = credit_packages.get(amount, 0)
        
        if tokens_to_add == 0:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'ignored', 'reason': 'Unknown package'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT user_email FROM payment_transactions WHERE transaction_id = %s",
            (transaction_id,)
        )
        result = cur.fetchone()
        
        if result:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': 'already_processed'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "SELECT email FROM users LIMIT 1"
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        email = user[0]
        
        cur.execute(
            "UPDATE users SET credits = credits + %s WHERE email = %s",
            (tokens_to_add, email)
        )
        
        cur.execute(
            """
            INSERT INTO payment_transactions (transaction_id, user_email, amount, tokens_added, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (transaction_id, email, amount, tokens_to_add, datetime.now())
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'success',
                'tokens_added': tokens_to_add,
                'user_email': email
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
