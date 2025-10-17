'''
Business: Purchase credits and manage user balance
Args: event with httpMethod, body (email, credits_amount)
      context with request_id
Returns: HTTP response with payment info and updated balance
'''

import json
import os
import psycopg2
from typing import Dict, Any

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
        
        cur.execute("SELECT credits FROM users WHERE email = %s", (email,))
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        credits = result[0] if result else 0
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'credits': credits}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        email = body_data.get('email', '')
        credits_to_buy = body_data.get('credits', 0)
        
        if not email or credits_to_buy <= 0:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Email and credits amount required'}),
                'isBase64Encoded': False
            }
        
        price_per_credit = 50
        total_price = credits_to_buy * price_per_credit
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "UPDATE users SET credits = credits + %s WHERE email = %s RETURNING credits",
            (credits_to_buy, email)
        )
        new_balance = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        payment_url = 'https://www.ozon.ru/my/pay'
        payment_card = '2204320163878871'
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'credits_purchased': credits_to_buy,
                'total_price': total_price,
                'new_balance': new_balance,
                'payment_url': payment_url,
                'payment_card': payment_card,
                'message': f'Куплено {credits_to_buy} кредитов за {total_price}₽'
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }