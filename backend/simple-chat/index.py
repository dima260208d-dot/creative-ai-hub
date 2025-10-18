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
    
    user_text = messages[-1]['content'].lower()
    
    replies = {
        'привет': 'Привет! 👋 Я AI-помощник. Чем могу помочь?',
        'как дела': 'Отлично! Готов помогать тебе 24/7! 😊',
        'что ты умеешь': 'Я могу отвечать на вопросы, помогать с задачами и просто поддержать беседу!',
        'спасибо': 'Пожалуйста! Обращайся, если что! 🚀',
    }
    
    reply = None
    for key, value in replies.items():
        if key in user_text:
            reply = value
            break
    
    if not reply:
        reply = f'Понял твой вопрос: "{messages[-1]["content"]}". AI-функционал временно недоступен, но я обязательно отвечу скоро! 🤖'
    
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