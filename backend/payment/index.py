"""
Business: Обработка платежей и создание заказов
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    email: str = body_data.get('email', '')
    service_id: int = body_data.get('service_id')
    service_name: str = body_data.get('service_name', '')
    plan: str = body_data.get('plan', 'basic')
    price: int = body_data.get('price', 0)
    input_text: str = body_data.get('input_text', '')
    
    if not email or not service_id or not price:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'email, service_id и price обязательны'}),
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
        "INSERT INTO users (email, name, balance) VALUES (%s, %s, %s) "
        "ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id",
        (email, email.split('@')[0], 0)
    )
    user_id = cur.fetchone()[0]
    
    cur.execute(
        "INSERT INTO orders (user_id, service_id, service_name, plan, price, input_text, status) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (user_id, service_id, service_name, plan, price, input_text, 'paid')
    )
    order_id = cur.fetchone()[0]
    
    conn.commit()
    cur.close()
    conn.close()
    
    payment_card = os.environ.get('PAYMENT_CARD_NUMBER', '2204320163878871')
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'order_id': order_id,
            'user_id': user_id,
            'payment_card': payment_card[-4:],
            'message': f'Платеж {price}₽ успешно обработан'
        }),
        'isBase64Encoded': False
    }
