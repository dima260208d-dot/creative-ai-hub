import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsModal from '@/components/admin/AnalyticsModal';

interface Order {
  id: number;
  user_email: string;
  product_name: string;
  price: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  todayOrders: number;
  totalChats?: number;
  chatUsers?: number;
  totalMessages?: number;
  popularServices?: Array<{name: string; count: number}>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, activeUsers: 0, todayOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'orders' | 'revenue' | 'users' | 'today' | 'chats' | 'chatUsers' | 'messages' | 'services'>('orders');

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/ca9c3300-579b-497d-b39f-c67c3ac67a03');
      const data = await response.json();
      
      setStats(data.stats || { totalOrders: 0, totalRevenue: 0, activeUsers: 0, todayOrders: 0 });
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')} className="bg-white/10 text-white hover:bg-white/20">
              <Icon name="Home" size={20} />
            </Button>
            <h1 className="text-4xl font-bold text-white">Панель Директора</h1>
          </div>
          <Button onClick={handleLogout} variant="destructive">
            <Icon name="LogOut" size={20} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('orders')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Всего заказов</CardTitle>
              <Icon name="ShoppingCart" className="text-blue-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('revenue')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Общий доход</CardTitle>
              <Icon name="DollarSign" className="text-green-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalRevenue}₽</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('users')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Активные пользователи</CardTitle>
              <Icon name="Users" className="text-purple-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.activeUsers}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('today')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Заказов сегодня</CardTitle>
              <Icon name="TrendingUp" className="text-orange-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.todayOrders}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>
        </div>

        <AnalyticsModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          type={modalType} 
          stats={stats}
          orders={orders}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('chats')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Всего чатов</CardTitle>
              <Icon name="MessageSquare" className="text-cyan-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalChats || 0}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('chatUsers')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Пользователей AI</CardTitle>
              <Icon name="Brain" className="text-pink-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.chatUsers || 0}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('messages')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Всего сообщений</CardTitle>
              <Icon name="Send" className="text-yellow-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalMessages || 0}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all" onClick={() => openModal('services')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Популярных сервисов</CardTitle>
              <Icon name="Star" className="text-amber-400" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.popularServices?.length || 0}</div>
              <p className="text-xs text-white/60 mt-1">Нажмите для детальной аналитики</p>
            </CardContent>
          </Card>
        </div>

        {stats.popularServices && stats.popularServices.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Популярные AI-сервисы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.popularServices.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">{service.name}</span>
                    <span className="text-white font-bold">{service.count} запросов</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/80">ID</th>
                    <th className="text-left py-3 px-4 text-white/80">Email</th>
                    <th className="text-left py-3 px-4 text-white/80">Продукт</th>
                    <th className="text-left py-3 px-4 text-white/80">Цена</th>
                    <th className="text-left py-3 px-4 text-white/80">Статус</th>
                    <th className="text-left py-3 px-4 text-white/80">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{order.id}</td>
                      <td className="py-3 px-4 text-white">{order.user_email}</td>
                      <td className="py-3 px-4 text-white">{order.product_name}</td>
                      <td className="py-3 px-4 text-white font-semibold">{order.price}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/70">{order.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}