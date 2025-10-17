"""
Business: Получение данных профиля пользователя и истории заказов
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict
"""

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    email: str = params.get('email', '')
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'email обязателен'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'База данных не настроена'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id, email, name, balance, created_at FROM users WHERE email = %s",
        (email,)
    )
    user_row = cur.fetchone()
    
    if not user_row:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Пользователь не найден'}),
            'isBase64Encoded': False
        }
    
    user_id = user_row[0]
    user = {
        'id': user_row[0],
        'email': user_row[1],
        'name': user_row[2],
        'balance': user_row[3],
        'created_at': str(user_row[4])
    }
    
    cur.execute(
        "SELECT id, service_id, service_name, plan, price, input_text, result, status, created_at "
        "FROM orders WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
        (user_id,)
    )
    
    orders = []
    for row in cur.fetchall():
        orders.append({
            'id': row[0],
            'service_id': row[1],
            'service_name': row[2],
            'plan': row[3],
            'price': row[4],
            'input_text': row[5],
            'result': row[6],
            'status': row[7],
            'created_at': str(row[8])
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'user': user,
            'orders': orders,
            'total_orders': len(orders)
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }
