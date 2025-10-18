'''
Business: Get user AI generation history from orders table
Args: event with queryStringParameters.email
Returns: JSON with user's generation history (service_name, input_text, result, created_at, tokens_used)
'''

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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    email = params.get('email', '').strip()
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Email is required'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id FROM users WHERE email = %s",
        (email,)
    )
    user_row = cursor.fetchone()
    
    if not user_row:
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'history': []}),
            'isBase64Encoded': False
        }
    
    user_id = user_row[0]
    
    cursor.execute(
        """
        SELECT id, service_name, input_text, ai_result, created_at, price
        FROM orders
        WHERE user_id = %s AND status = 'completed' AND ai_result IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 100
        """,
        (user_id,)
    )
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            'id': str(row[0]),
            'service_name': row[1],
            'input_text': row[2] or '',
            'result': row[3] or '',
            'created_at': row[4].isoformat() if row[4] else '',
            'tokens_used': row[5] or 0
        })
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'history': history}),
        'isBase64Encoded': False
    }
