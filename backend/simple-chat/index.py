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
    
    yandex_api_key = os.environ.get('YANDEX_API_KEY')
    yandex_folder_id = os.environ.get('YANDEX_FOLDER_ID')
    
    if not yandex_api_key or not yandex_folder_id:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'YandexGPT не настроен'}),
            'isBase64Encoded': False
        }
    
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Api-Key {yandex_api_key}",
        "x-folder-id": yandex_folder_id
    }
    
    yandex_messages = [
        {"role": "system", "text": "Ты дружелюбный AI-помощник. Отвечай кратко и полезно на русском языке."}
    ]
    for msg in messages:
        yandex_messages.append({"role": msg['role'], "text": msg['content']})
    
    payload = {
        "modelUri": f"gpt://{yandex_folder_id}/yandexgpt-lite/latest",
        "completionOptions": {
            "stream": False,
            "temperature": 0.7,
            "maxTokens": 500
        },
        "messages": yandex_messages
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    
    if response.status_code != 200:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'YandexGPT ошибка: {response.text}'}),
            'isBase64Encoded': False
        }
    
    response_data = response.json()
    reply = response_data.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', 'Не могу ответить')
    
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