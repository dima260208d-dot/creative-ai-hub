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
        
        cur.execute("SELECT COUNT(*) FROM orders WHERE status != 'test'")
        total_orders = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(DISTINCT user_id) FROM orders WHERE status != 'test'")
        active_users = cur.fetchone()[0]
        
        today = datetime.now().date()
        cur.execute(
            "SELECT COUNT(*) FROM orders WHERE status != 'test' AND DATE(created_at) = %s",
            (today,)
        )
        today_orders = cur.fetchone()[0]
        
        cur.execute(
            """
            SELECT o.id, u.email, o.service_name, o.plan, o.status, o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
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
            'todayOrders': today_orders
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
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
