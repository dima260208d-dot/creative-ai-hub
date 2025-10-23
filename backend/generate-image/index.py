"""
Business: Генерация изображений через бесплатный API Pollinations.ai
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с URL изображения
"""

import json
from typing import Dict, Any
from urllib.parse import quote
import random

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
    
    if not prompt:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'prompt обязателен'}),
            'isBase64Encoded': False
        }
    
    # Улучшаем промпт для качественного изображения
    enhanced_prompt = f"{prompt}, high quality, detailed, professional photography"
    encoded_prompt = quote(enhanced_prompt)
    
    # Генерируем уникальный seed для разнообразия
    seed = random.randint(1, 1000000)
    
    # Создаем URL для Pollinations AI (бесплатный сервис)
    image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&seed={seed}&nologo=true"
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'image_url': image_url,
            'revised_prompt': enhanced_prompt,
            'original_prompt': prompt
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }
