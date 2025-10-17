'''
Business: Get user orders history with AI results
Args: event with httpMethod, queryStringParameters (email)
      context with request_id
Returns: HTTP response with list of orders
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        
        cur.execute(
            """
            SELECT o.id, o.service_name, o.plan, o.input_text, o.ai_result, o.status, o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE u.email = %s AND o.status != 'test'
            ORDER BY o.created_at DESC
            LIMIT 100
            """,
            (email,)
        )
        
        orders_data = cur.fetchall()
        cur.close()
        conn.close()
        
        orders = []
        for order in orders_data:
            orders.append({
                'id': order[0],
                'service_name': order[1],
                'plan': order[2],
                'input_text': order[3],
                'ai_result': order[4],
                'status': order[5],
                'created_at': str(order[6])
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'orders': orders}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
