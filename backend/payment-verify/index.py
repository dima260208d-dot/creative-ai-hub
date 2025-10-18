'''
Business: Verify payment and credit AI tokens automatically
Args: event with httpMethod, body (email, amount, transaction_id)
      context with request_id
Returns: HTTP response with verification status and updated balance
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
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        email = body_data.get('email', '')
        amount = body_data.get('amount', 0)
        transaction_id = body_data.get('transaction_id', '')
        
        if not email or amount <= 0:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Email and amount required'}),
                'isBase64Encoded': False
            }
        
        credit_packages = {
            99: 10,
            399: 60,
            699: 125,
            2999: 650
        }
        
        tokens_to_add = credit_packages.get(amount, 0)
        
        if tokens_to_add == 0:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid payment amount'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id FROM payment_transactions WHERE transaction_id = %s",
            (transaction_id,)
        )
        existing = cur.fetchone()
        
        if existing:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Payment already processed'}),
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
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        new_balance = result[0]
        
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
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'tokens_added': tokens_to_add,
                'new_balance': new_balance,
                'message': f'Начислено {tokens_to_add} AI-токенов'
            }),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        email = params.get('email', '')
        
        if not email:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Email required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            """
            SELECT transaction_id, amount, tokens_added, created_at
            FROM payment_transactions
            WHERE user_email = %s
            ORDER BY created_at DESC
            LIMIT 10
            """,
            (email,)
        )
        
        transactions = cur.fetchall()
        
        cur.close()
        conn.close()
        
        transactions_list = []
        for t in transactions:
            transactions_list.append({
                'transaction_id': t[0],
                'amount': t[1],
                'tokens_added': t[2],
                'created_at': str(t[3])
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'transactions': transactions_list
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }