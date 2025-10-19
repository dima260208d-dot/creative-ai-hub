import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'orders' | 'revenue' | 'users' | 'today' | 'chats' | 'chatUsers' | 'messages' | 'services';
  stats: any;
  orders?: any[];
}

export default function AnalyticsModal({ isOpen, onClose, type, stats, orders = [] }: AnalyticsModalProps) {
  const getContent = () => {
    switch (type) {
      case 'orders':
        return {
          title: '📦 Детальная статистика заказов',
          icon: 'ShoppingCart',
          sections: [
            { label: 'Всего заказов', value: stats.totalOrders, color: 'text-blue-400' },
            { label: 'Завершено успешно', value: orders.filter((o: any) => o.status === 'completed').length, color: 'text-green-400' },
            { label: 'В обработке', value: orders.filter((o: any) => o.status === 'pending').length, color: 'text-yellow-400' },
            { label: 'Средний чек', value: `${Math.round(stats.totalRevenue / stats.totalOrders || 0)}₽`, color: 'text-purple-400' }
          ]
        };
      
      case 'revenue':
        return {
          title: '💰 Детальная статистика доходов',
          icon: 'DollarSign',
          sections: [
            { label: 'Общий доход', value: `${stats.totalRevenue}₽`, color: 'text-green-400' },
            { label: 'Средний доход за заказ', value: `${Math.round(stats.totalRevenue / stats.totalOrders || 0)}₽`, color: 'text-blue-400' },
            { label: 'Доход на пользователя', value: `${Math.round(stats.totalRevenue / stats.activeUsers || 0)}₽`, color: 'text-purple-400' },
            { label: 'Прогноз на месяц', value: `${Math.round((stats.totalRevenue / 30) * 30)}₽`, color: 'text-cyan-400' }
          ]
        };
      
      case 'users':
        return {
          title: '👥 Детальная статистика пользователей',
          icon: 'Users',
          sections: [
            { label: 'Активные пользователи', value: stats.activeUsers, color: 'text-purple-400' },
            { label: 'Пользователи AI-чатов', value: stats.chatUsers || 0, color: 'text-pink-400' },
            { label: 'Конверсия в заказы', value: `${Math.round((stats.totalOrders / stats.activeUsers || 0) * 100)}%`, color: 'text-green-400' },
            { label: 'Средний LTV', value: `${Math.round(stats.totalRevenue / stats.activeUsers || 0)}₽`, color: 'text-blue-400' }
          ]
        };
      
      case 'today':
        return {
          title: '📈 Статистика за сегодня',
          icon: 'TrendingUp',
          sections: [
            { label: 'Заказов сегодня', value: stats.todayOrders, color: 'text-orange-400' },
            { label: 'Доход за сегодня', value: `${stats.todayOrders * 50}₽`, color: 'text-green-400' },
            { label: 'Прогноз на день', value: `${stats.todayOrders * 2}`, color: 'text-cyan-400' },
            { label: 'Активность', value: stats.todayOrders > 0 ? '🔥 Высокая' : '😴 Низкая', color: 'text-yellow-400' }
          ]
        };
      
      case 'chats':
        return {
          title: '💬 Детальная статистика чатов',
          icon: 'MessageSquare',
          sections: [
            { label: 'Всего чатов', value: stats.totalChats || 0, color: 'text-cyan-400' },
            { label: 'Активных пользователей', value: stats.chatUsers || 0, color: 'text-pink-400' },
            { label: 'Чатов на пользователя', value: Math.round((stats.totalChats || 0) / (stats.chatUsers || 1)), color: 'text-blue-400' },
            { label: 'Популярность', value: stats.totalChats > 20 ? '🔥 Топ' : '📊 Норма', color: 'text-green-400' }
          ]
        };
      
      case 'chatUsers':
        return {
          title: '🧠 Пользователи AI-сервисов',
          icon: 'Brain',
          sections: [
            { label: 'Пользователей AI', value: stats.chatUsers || 0, color: 'text-pink-400' },
            { label: 'От общего числа', value: `${Math.round(((stats.chatUsers || 0) / stats.activeUsers || 0) * 100)}%`, color: 'text-purple-400' },
            { label: 'Среднее чатов/юзер', value: Math.round((stats.totalChats || 0) / (stats.chatUsers || 1)), color: 'text-cyan-400' },
            { label: 'Вовлечённость', value: (stats.chatUsers || 0) > 5 ? '🚀 Отлично' : '📈 Растёт', color: 'text-green-400' }
          ]
        };
      
      case 'messages':
        return {
          title: '✉️ Статистика сообщений',
          icon: 'Send',
          sections: [
            { label: 'Всего сообщений', value: stats.totalMessages || 0, color: 'text-yellow-400' },
            { label: 'Сообщений на чат', value: Math.round((stats.totalMessages || 0) / (stats.totalChats || 1)), color: 'text-blue-400' },
            { label: 'Сообщений на юзера', value: Math.round((stats.totalMessages || 0) / (stats.chatUsers || 1)), color: 'text-purple-400' },
            { label: 'Активность', value: (stats.totalMessages || 0) > 50 ? '🔥 Высокая' : '📊 Средняя', color: 'text-green-400' }
          ]
        };
      
      case 'services':
        return {
          title: '⭐ Популярные AI-сервисы',
          icon: 'Star',
          sections: stats.popularServices?.slice(0, 4).map((s: any, idx: number) => ({
            label: `${idx + 1}. ${s.name}`,
            value: `${s.count} запросов`,
            color: idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-blue-400'
          })) || []
        };
      
      default:
        return { title: 'Аналитика', icon: 'BarChart', sections: [] };
    }
  };

  const content = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Icon name={content.icon as any} className="text-blue-400" size={32} />
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Подробная информация и метрики
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {content.sections.map((section, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="text-sm text-white/70 mb-1">{section.label}</div>
              <div className={`text-2xl font-bold ${section.color}`}>{section.value}</div>
            </div>
          ))}
        </div>

        {type === 'services' && stats.popularServices && stats.popularServices.length > 4 && (
          <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <h3 className="text-lg font-bold mb-3 text-white/90">Другие сервисы:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.popularServices.slice(4).map((service: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-white/70">{service.name}</span>
                  <span className="text-white font-semibold">{service.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
