"""
Business: API для управления историей чатов пользователей
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    user_email = event.get('headers', {}).get('X-User-Email') or event.get('headers', {}).get('x-user-email')
    
    if not user_email:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'User email required'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            chat_id = query_params.get('chat_id')
            
            if chat_id:
                cursor.execute(
                    "SELECT * FROM t_p55547046_creative_ai_hub.chat_history WHERE user_email = %s AND chat_id = %s",
                    (user_email, chat_id)
                )
                chat = cursor.fetchone()
                if chat:
                    chat['created_at'] = chat['created_at'].isoformat() if chat.get('created_at') else None
                    chat['updated_at'] = chat['updated_at'].isoformat() if chat.get('updated_at') else None
                    result = {'success': True, 'chat': dict(chat)}
                else:
                    result = {'success': False, 'error': 'Chat not found'}
            else:
                cursor.execute(
                    "SELECT id, chat_id, chat_title, service_name, updated_at FROM t_p55547046_creative_ai_hub.chat_history WHERE user_email = %s ORDER BY updated_at DESC LIMIT 50",
                    (user_email,)
                )
                chats = cursor.fetchall()
                for chat in chats:
                    chat['updated_at'] = chat['updated_at'].isoformat() if chat.get('updated_at') else None
                result = {'success': True, 'chats': [dict(c) for c in chats]}
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            chat_id = body_data.get('chat_id')
            chat_title = body_data.get('chat_title')
            service_id = body_data.get('service_id')
            service_name = body_data.get('service_name')
            messages = body_data.get('messages', [])
            
            if not all([chat_id, chat_title, service_id is not None, service_name]):
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Missing required fields'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """INSERT INTO t_p55547046_creative_ai_hub.chat_history 
                   (user_email, chat_id, chat_title, service_id, service_name, messages, created_at, updated_at)
                   VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                   ON CONFLICT (chat_id) DO UPDATE SET
                   chat_title = EXCLUDED.chat_title,
                   messages = EXCLUDED.messages,
                   updated_at = NOW()
                   RETURNING id""",
                (user_email, chat_id, chat_title, service_id, service_name, json.dumps(messages))
            )
            result_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'id': result_id}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            chat_id = query_params.get('chat_id')
            
            if not chat_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'chat_id required'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "DELETE FROM t_p55547046_creative_ai_hub.chat_history WHERE user_email = %s AND chat_id = %s",
                (user_email, chat_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()
