"""
Business: Универсальный AI-бот "Гений" для обработки всех AI-сервисов платформы через YandexGPT
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict
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
    
    if service_id is None or not input_text:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'service_id и input_text обязательны'}),
            'isBase64Encoded': False
        }
    
    prompts = {
        0: input_text,
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
        20: f"Ты QA-инженер. Создай тест-кейсы для функционала: {input_text}. Укажи шаги и ожидаемые результаты.",
        21: f"Ты преподаватель. Напиши подробный реферат на тему: {input_text}. Включи введение, основную часть и заключение.",
        22: f"Ты учитель литературы. Напиши сочинение на тему: {input_text}. Добавь литературный анализ и цитаты.",
        23: f"Ты академический писатель. Напиши аргументированное эссе на тему: {input_text}. Структурируй мысли логично.",
        24: f"Ты научный руководитель. Создай структуру курсовой работы на тему: {input_text}. Добавь план исследования.",
        25: f"Ты научный консультант. Создай план и структуру дипломной работы на тему: {input_text}.",
        26: f"Ты преподаватель. Создай отчёт по лабораторной работе: {input_text}. Добавь цели, ход работы, выводы.",
        27: f"Ты методист. Создай структурированный конспект лекции на тему: {input_text}. Выдели ключевые моменты.",
        28: f"Ты репетитор по математике. Реши задачу с подробным объяснением: {input_text}. Покажи все шаги решения."
    }
    
    yandex_agent_id = os.environ.get('YANDEX_AGENT_ID')
    yandex_folder_id = os.environ.get('YANDEX_FOLDER_ID')
    yandex_api_key = os.environ.get('YANDEX_API_KEY')
    
    if not yandex_agent_id or not yandex_folder_id or not yandex_api_key:
        result = f"⚠️ Настрой секреты: YANDEX_AGENT_ID, YANDEX_FOLDER_ID, YANDEX_API_KEY"
    else:
        url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {yandex_api_key}",
            "x-folder-id": yandex_folder_id
        }
        
        prompt = prompts.get(service_id, input_text)
        
        payload = {
            "modelUri": f"gpt://{yandex_folder_id}/{yandex_agent_id}/latest",
            "completionOptions": {
                "stream": False,
                "temperature": 0.7,
                "maxTokens": 1000
            },
            "messages": [
                {"role": "user", "text": prompt}
            ]
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            result = f"Ошибка YandexGPT: {response.text}"
        else:
            response_data = response.json()
            result = response_data.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', 'Нет ответа')
    
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