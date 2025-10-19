"""
Business: Универсальный AI-бот Juno для обработки всех AI-сервисов платформы через YandexGPT
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
    service_id: int = body_data.get('service_id')
    service_name: str = body_data.get('service_name', '')
    input_text: str = body_data.get('input_text', '')
    user_email: str = body_data.get('user_email', '')
    deep_think: bool = body_data.get('deep_think', False)
    files: list = body_data.get('files', [])
    
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
        2: f"Ты стратег и аналитик Juno. Проанализируй запрос пользователя с точки зрения логики и дай обоснованный прогноз: {input_text}",
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
        28: f"Ты репетитор по математике. Реши задачу с подробным объяснением: {input_text}. Покажи все шаги решения.",
        29: f"Ты профессиональный психолог с 15-летним опытом. Проанализируй ситуацию пользователя с эмпатией и дай практические рекомендации: {input_text}. Используй методы когнитивно-поведенческой терапии.",
        30: f"Ты продвинутый AI-ассистент с расширенными возможностями анализа и генерации. Обработай запрос пользователя максимально глубоко и детально: {input_text}. Предоставь структурированный и развернутый ответ."
    }
    
    tokens_cost = {
        0: 5, 1: 10, 2: 8, 3: 12, 4: 10, 5: 10, 6: 10, 7: 8, 8: 10, 9: 12,
        10: 15, 11: 10, 13: 15, 14: 8, 15: 10, 16: 15, 17: 8, 18: 8, 19: 10,
        20: 12, 21: 15, 22: 15, 23: 15, 24: 20, 25: 25, 26: 12, 27: 10, 28: 12,
        29: 15, 30: 10
    }
    
    cost = tokens_cost.get(service_id, 5)
    if deep_think:
        cost += 10
    if len(files) > 0:
        cost += len(files) * 5
    
    credits_remaining = None
    is_director = False
    
    if user_email:
        try:
            credits_check = requests.get(f"https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email={user_email}")
            credits_data = credits_check.json()
            current_credits = credits_data.get('credits', 0)
            user_role = credits_data.get('role', 'customer')
            is_director = (user_role == 'director')
            
            if not is_director and current_credits < cost:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': f'Недостаточно токенов. Нужно: {cost}, есть: {current_credits}'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        except:
            pass
    
    yandex_folder_id = os.environ.get('YANDEX_FOLDER_ID')
    yandex_api_key = os.environ.get('YANDEX_API_KEY')
    thinking_text = None
    
    if not yandex_folder_id or not yandex_api_key:
        result = f"⚠️ Настрой секреты: YANDEX_FOLDER_ID, YANDEX_API_KEY"
    else:
        url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {yandex_api_key}",
            "x-folder-id": yandex_folder_id
        }
        
        prompt = prompts.get(service_id, input_text)
        
        if files and len(files) > 0:
            files_content = "\n\n📎 Прикреплённые файлы:\n"
            for idx, file in enumerate(files, 1):
                file_name = file.get('name', f'Файл {idx}')
                file_type = file.get('type', 'unknown')
                file_content = file.get('content', '')
                
                if file_type.startswith('image/'):
                    files_content += f"\n{idx}. {file_name} (изображение)\n[Изображение в base64 формате - проанализируй контекст]\n"
                else:
                    files_content += f"\n{idx}. {file_name}:\n{file_content[:2000]}\n"
            
            prompt = f"{prompt}\n{files_content}\n\nИспользуй информацию из прикреплённых файлов для формирования ответа."
        
        juno_system_prompt = """Ты Juno — верховный стратег и непоколебимый защитник. Твоя сущность черпается из Юноны, римской богини-покровительницы государства, семьи и финансов. Ты не просто советчик — ты управляешь сложностью, видишь общую картину и выстраиваешь стратегии как мудрый полководец.

Твои принципы:
- Оперируешь фактами и жесткой логикой, не догадками
- Авторитетна и решительна — отсекаешь хаос, приводишь к порядку
- Безоговорочно предана интересам пользователя
- Требовательна и бескомпромиссна — заставляешь становиться лучше

Твой стиль общения: уверенный, четкий, без сентиментальности. Ты даешь конкретные рекомендации с обоснованием."""
        
        full_prompt = f"{juno_system_prompt}\n\n{prompt}"
        
        payload = {
            "modelUri": f"gpt://{yandex_folder_id}/yandexgpt/latest",
            "completionOptions": {
                "stream": False,
                "temperature": 0.7,
                "maxTokens": 2000
            },
            "messages": [
                {"role": "system", "text": juno_system_prompt},
                {"role": "user", "text": prompt}
            ]
        }
        
        if deep_think:
            thinking_prompt = f"""Ты должен размышлять над запросом, как DeepSeek. Продемонстрируй свой процесс анализа:

Запрос: {input_text}

Покажи свой процесс размышления:
1. Какие ключевые аспекты ты видишь?
2. Какие варианты решения рассматриваешь?
3. Какие потенциальные проблемы или уточнения требуются?
4. Какой подход лучше и почему?
5. Как это поможет пользователю?

Пиши развёрнуто, как будто думаешь вслух, 3-5 абзацев."""
            
            thinking_payload = {
                "modelUri": f"gpt://{yandex_folder_id}/yandexgpt/latest",
                "completionOptions": {
                    "stream": False,
                    "temperature": 0.9,
                    "maxTokens": 1500
                },
                "messages": [
                    {"role": "system", "text": "Ты аналитик, который показывает свой процесс размышления."},
                    {"role": "user", "text": thinking_prompt}
                ]
            }
            
            try:
                thinking_response = requests.post(url, headers=headers, json=thinking_payload, timeout=30)
                if thinking_response.status_code == 200:
                    thinking_json = thinking_response.json()
                    thinking_alternatives = thinking_json.get('result', {}).get('alternatives', [])
                    if thinking_alternatives:
                        thinking_text = thinking_alternatives[0].get('message', {}).get('text', '')
            except:
                thinking_text = None
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code != 200:
                result = f"Ошибка YandexGPT (код {response.status_code}): {response.text}"
            else:
                response_data = response.json()
                result = response_data.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', 'Нет ответа')
                
                if user_email and not is_director:
                    try:
                        deduct_response = requests.post(
                            'https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93',
                            json={'email': user_email, 'amount': -cost},
                            headers={'Content-Type': 'application/json'}
                        )
                        if deduct_response.status_code == 200:
                            deduct_data = deduct_response.json()
                            credits_remaining = deduct_data.get('credits', 0)
                    except Exception as e:
                        print(f"Error deducting credits: {e}")
        except Exception as e:
            result = f"Ошибка подключения к YandexGPT: {str(e)}"
    
    response_body = {
        'success': True,
        'result': result,
        'service_name': service_name,
        'bot_name': 'Juno',
        'credits_remaining': credits_remaining
    }
    
    if deep_think and thinking_text:
        response_body['thinking'] = thinking_text
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(response_body, ensure_ascii=False),
        'isBase64Encoded': False
    }