"""
Business: Простой AI-чат для общения с пользователями
Args: event с messages массивом
Returns: Ответ от AI
"""

import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Только POST'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    messages = body_data.get('messages', [])
    
    if not messages:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Отправь сообщение'}),
            'isBase64Encoded': False
        }
    
    gemini_key = os.environ.get('GEMINI_API_KEY')
    
    if not gemini_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Добавь GEMINI_API_KEY в секреты!'}),
            'isBase64Encoded': False
        }
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={gemini_key}"
    
    gemini_messages = []
    for msg in messages:
        gemini_messages.append({
            "role": "user" if msg['role'] == 'user' else "model",
            "parts": [{"text": msg['content']}]
        })
    
    payload = {
        "contents": gemini_messages,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 500
        }
    }
    
    response = requests.post(url, json=payload, timeout=30)
    
    if response.status_code != 200:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Gemini ошибка: {response.text}'}),
            'isBase64Encoded': False
        }
    
    response_data = response.json()
    reply = response_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'Не могу ответить')
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'reply': reply
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }