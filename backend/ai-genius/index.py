"""
Business: Универсальный AI-бот "Гений" для обработки всех AI-сервисов платформы
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict
"""

import json
import os
from typing import Dict, Any
from openai import OpenAI

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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    service_id: int = body_data.get('service_id')
    service_name: str = body_data.get('service_name', '')
    input_text: str = body_data.get('input_text', '')
    
    if not service_id or not input_text:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'service_id и input_text обязательны'}),
            'isBase64Encoded': False
        }
    
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'OpenAI API ключ не настроен'}),
            'isBase64Encoded': False
        }
    
    import httpx
    client = OpenAI(
        api_key=openai_key,
        http_client=httpx.Client()
    )
    
    prompts = {
        1: f"Ты профессиональный копирайтер. Создай профессиональную биографию на основе: {input_text}. Сделай текст живым, интересным и запоминающимся.",
        2: f"Ты мистическая AI-гадалка с именем Гений. Проанализируй запрос пользователя и дай персонализированное предсказание: {input_text}",
        3: f"Ты бизнес-консультант. Сгенерируй 10 персонализированных бизнес-идей на основе: {input_text}. Для каждой идеи укажи потенциал и первые шаги.",
        4: f"Ты HR-специалист. Создай профессиональное резюме на основе: {input_text}. Оптимизируй под ATS системы.",
        5: f"Ты нейминг-специалист. Сгенерируй 20 креативных названий для: {input_text}. Каждое название должно быть запоминающимся.",
        6: f"Ты SMM-специалист. Создай 5 вирусных постов для соцсетей на тему: {input_text}. Добавь хештеги и эмодзи.",
        7: f"Ты AI-художник. Опиши детальный prompt для генерации изображения: {input_text}. Добавь стиль, композицию, освещение.",
        8: f"Ты email-маркетолог. Напиши продающее письмо для: {input_text}. Используй проверенные триггеры конверсии.",
        9: f"Ты видео-сценарист. Создай вирусный скрипт для YouTube/TikTok на тему: {input_text}. Добавь хуки и CTA.",
        10: f"Ты AI-консультант. Создай базу знаний чат-бота для: {input_text}. Добавь FAQ и типовые ответы.",
        11: f"Ты графический дизайнер. Опиши концепцию логотипа для: {input_text}. Укажи цвета, формы, символику.",
        12: f"Ты аудио-инженер. Создай скрипт для озвучки: {input_text}. Добавь интонации и паузы.",
        13: f"Ты юрист. Создай юридический договор для: {input_text}. Используй корректные формулировки.",
        14: f"Ты мем-мейкер. Придумай 5 вирусных идей мемов на тему: {input_text}. Укажи формат и текст.",
        15: f"Ты презентатор. Создай структуру презентации для: {input_text}. Укажи слайды и ключевые месседжи.",
        16: f"Ты SEO-копирайтер. Напиши SEO-оптимизированную статью на тему: {input_text}. Добавь подзаголовки и ключевые слова.",
        17: f"Ты переводчик. Переведи следующий текст с сохранением контекста и стиля: {input_text}",
        18: f"Ты шеф-повар. Создай 3 персональных рецепта из продуктов: {input_text}. Укажи калории и время готовки.",
        19: f"Ты фитнес-тренер. Создай персональный план тренировок для: {input_text}. Учти цели и уровень подготовки.",
        20: f"Ты QA-инженер. Создай тест-кейсы для функционала: {input_text}. Укажи шаги и ожидаемые результаты."
    }
    
    system_prompt = prompts.get(service_id, f"Обработай запрос пользователя: {input_text}")
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Ты AI-бот по имени Гений. Ты профессионал в создании контента и помощи пользователям."},
            {"role": "user", "content": system_prompt}
        ],
        temperature=0.8,
        max_tokens=2000
    )
    
    result = response.choices[0].message.content
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'result': result,
            'service_name': service_name,
            'bot_name': 'Гений'
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }