'''
Business: User authentication and authorization with role-based access
Args: event with httpMethod, body (email/password), queryStringParameters
      context with request_id
Returns: HTTP response with user data and role
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        email = body_data.get('email', '')
        password = body_data.get('password', '')
        action = body_data.get('action', 'login')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if action == 'register':
            cur.execute(
                "INSERT INTO users (email, password_hash, role, name) VALUES (%s, %s, %s, %s) RETURNING id, email, role",
                (email, password, 'customer', email.split('@')[0])
            )
            conn.commit()
            user = cur.fetchone()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'role': user[2]
                    }
                }),
                'isBase64Encoded': False
            }
        
        else:
            cur.execute(
                "SELECT id, email, role, name FROM users WHERE email = %s AND password_hash = %s",
                (email, password)
            )
            user = cur.fetchone()
            
            cur.close()
            conn.close()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'user': {
                            'id': user[0],
                            'email': user[1],
                            'role': user[2],
                            'name': user[3]
                        }
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
