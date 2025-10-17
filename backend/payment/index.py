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
    credits_cost: int = body_data.get('credits_cost', 1)
    
    if not email or not service_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'email и service_id обязательны'}),
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
        "ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id, credits",
        (email, email.split('@')[0], 0)
    )
    user_data = cur.fetchone()
    user_id = user_data[0]
    user_credits = user_data[1] if user_data[1] else 0
    
    if user_credits < credits_cost:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Недостаточно кредитов. У вас: {user_credits}, нужно: {credits_cost}'
            }),
            'isBase64Encoded': False
        }
    
    cur.execute(
        "UPDATE users SET credits = credits - %s WHERE id = %s",
        (credits_cost, user_id)
    )
    
    ai_result = f"AI-результат для запроса: {input_text}\n\nВаш контент успешно сгенерирован! 🚀\n\nСервис: {service_name}\nПлан: {plan}"
    
    cur.execute(
        "INSERT INTO orders (user_id, service_id, service_name, plan, price, input_text, status, ai_result) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (user_id, service_id, service_name, plan, 0, input_text, 'completed', ai_result)
    )
    order_id = cur.fetchone()[0]
    
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
            'order_id': order_id,
            'user_id': user_id,
            'credits_used': credits_cost,
            'credits_remaining': user_credits - credits_cost,
            'ai_result': ai_result,
            'message': f'Заказ выполнен! Использовано {credits_cost} кредитов'
        }),
        'isBase64Encoded': False
    }