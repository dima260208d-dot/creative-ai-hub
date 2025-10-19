import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  credits: number;
  created_at: string;
  total_orders: number;
  total_chats: number;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: any[];
  payments: any[];
}

export default function UserDetailsModal({ isOpen, onClose, user, orders, payments }: UserDetailsModalProps) {
  if (!user) return null;

  const userOrders = orders.filter(o => o.user_email === user.email);
  const userPayments = payments.filter(p => p.user_email === user.email);
  const totalSpent = userPayments.reduce((sum, p) => sum + p.amount, 0);

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: { label: '👑 Админ', variant: 'destructive' },
      director: { label: '💼 Директор', variant: 'default' },
      customer: { label: '👤 Клиент', variant: 'secondary' }
    };
    const config = variants[role] || variants.customer;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Icon name="User" className="text-blue-400" size={32} />
            Профиль пользователя
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Основная информация */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Info" size={20} />
              Основная информация
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/70">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Имя</p>
                <p className="font-semibold">{user.name || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Роль</p>
                <div>{getRoleBadge(user.role)}</div>
              </div>
              <div>
                <p className="text-sm text-white/70">Регистрация</p>
                <p className="font-semibold">{new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Coins" className="text-yellow-400" size={20} />
                <p className="text-sm text-white/70">AI-токены</p>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{user.credits}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="ShoppingCart" className="text-blue-400" size={20} />
                <p className="text-sm text-white/70">Заказов</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{user.total_orders}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="MessageSquare" className="text-cyan-400" size={20} />
                <p className="text-sm text-white/70">Чатов</p>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{user.total_chats}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="DollarSign" className="text-green-400" size={20} />
                <p className="text-sm text-white/70">Потрачено</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{totalSpent}₽</p>
            </div>
          </div>

          {/* Платежи */}
          {userPayments.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="CreditCard" size={20} className="text-green-400" />
                История платежей ({userPayments.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userPayments.map((payment) => (
                  <div key={payment.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{payment.amount}₽ → +{payment.tokens_added} токенов</p>
                      <p className="text-xs text-white/60">{new Date(payment.created_at).toLocaleString('ru-RU')}</p>
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400">✅ Успешно</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Заказы */}
          {userOrders.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Package" size={20} className="text-blue-400" />
                История заказов ({userOrders.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userOrders.map((order) => (
                  <div key={order.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold">{order.product_name}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status === 'completed' ? '✅ Выполнен' : '⏳ В обработке'}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70">{order.price}</p>
                    <p className="text-xs text-white/60">{new Date(order.created_at).toLocaleString('ru-RU')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userOrders.length === 0 && userPayments.length === 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 text-center">
              <Icon name="Inbox" className="text-white/40 mx-auto mb-2" size={48} />
              <p className="text-white/70">Пользователь пока не совершал покупок</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
