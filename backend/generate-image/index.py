"""
Business: Генерация изображений через OpenAI DALL-E 3 API
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с URL изображения
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
    prompt: str = body_data.get('prompt', '')
    user_email: str = body_data.get('user_email', '')
    
    if not prompt:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'prompt обязателен'}),
            'isBase64Encoded': False
        }
    
    openai_api_key = os.environ.get('OPENAI_API_KEY')
    
    if not openai_api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'OpenAI API key не настроен'}),
            'isBase64Encoded': False
        }
    
    openai_url = 'https://api.openai.com/v1/images/generations'
    openai_headers = {
        'Authorization': f'Bearer {openai_api_key}',
        'Content-Type': 'application/json'
    }
    
    openai_data = {
        'model': 'dall-e-3',
        'prompt': prompt,
        'n': 1,
        'size': '1024x1024',
        'quality': 'standard'
    }
    
    response = requests.post(openai_url, headers=openai_headers, json=openai_data, timeout=120)
    
    if response.status_code != 200:
        error_msg = response.json().get('error', {}).get('message', 'Ошибка генерации')
        return {
            'statusCode': response.status_code,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': error_msg}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    result = response.json()
    image_url = result['data'][0]['url']
    revised_prompt = result['data'][0].get('revised_prompt', prompt)
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'image_url': image_url,
            'revised_prompt': revised_prompt
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }
