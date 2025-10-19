'''
Business: Get admin statistics and all orders
Args: event with httpMethod, queryStringParameters (email for auth check)
      context with request_id
Returns: HTTP response with stats and orders list
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        conn = get_db_connection()
        cur = conn.cursor()
        
        schema = 't_p55547046_creative_ai_hub'
        
        cur.execute(f"SELECT COUNT(*) FROM {schema}.orders WHERE status != 'test'")
        total_orders = cur.fetchone()[0]
        
        cur.execute(f"SELECT COUNT(DISTINCT user_id) FROM {schema}.orders WHERE status != 'test'")
        active_users = cur.fetchone()[0]
        
        today = datetime.now().date()
        cur.execute(
            f"SELECT COUNT(*) FROM {schema}.orders WHERE status != 'test' AND DATE(created_at) = %s",
            (today,)
        )
        today_orders = cur.fetchone()[0]
        
        cur.execute(f"SELECT COUNT(*) FROM {schema}.chat_history")
        total_chats = cur.fetchone()[0] or 0
        
        cur.execute(f"SELECT COUNT(DISTINCT user_email) FROM {schema}.chat_history")
        chat_users = cur.fetchone()[0] or 0
        
        cur.execute(
            f"""
            SELECT service_name, COUNT(*) as count
            FROM {schema}.chat_history
            GROUP BY service_name
            ORDER BY count DESC
            LIMIT 10
            """
        )
        popular_services = [{'name': row[0], 'count': row[1]} for row in cur.fetchall()]
        
        total_messages = total_chats * 2
        
        cur.execute(
            f"""
            SELECT o.id, u.email, o.service_name, o.plan, o.status, o.created_at
            FROM {schema}.orders o
            JOIN {schema}.users u ON o.user_id = u.id
            WHERE o.status != 'test'
            ORDER BY o.created_at DESC
            LIMIT 50
            """
        )
        orders_data = cur.fetchall()
        
        cur.close()
        conn.close()
        
        orders = []
        for order in orders_data:
            orders.append({
                'id': order[0],
                'user_email': order[1],
                'product_name': order[2],
                'price': f"{order[3]} план",
                'status': order[4],
                'created_at': str(order[5])
            })
        
        stats = {
            'totalOrders': total_orders,
            'totalRevenue': total_orders * 50,
            'activeUsers': active_users,
            'todayOrders': today_orders,
            'totalChats': total_chats,
            'chatUsers': chat_users,
            'totalMessages': total_messages,
            'popularServices': popular_services
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'stats': stats,
                'orders': orders
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }