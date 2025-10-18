import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: number;
  service_name: string;
  plan: string;
  price: number;
  input_text: string;
  result: string | null;
  status: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  balance: number;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!email) {
      navigate('/');
      return;
    }

    fetch(`https://functions.poehali.dev/bd2ef983-d2f1-479f-af1a-8b0e969e7194?email=${email}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.user);
        setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email, navigate]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Личный кабинет
            </h1>
            <p className="text-muted-foreground">Управление аккаунтом и историей заказов</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            На главную
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Icon name="User" size={20} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Пользователь</div>
                <div className="font-semibold">{profile.name}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{profile.email}</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
                <Icon name="ShoppingBag" size={20} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Заказов</div>
                <div className="font-semibold text-2xl">{orders.length}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Icon name="Wallet" size={20} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Потрачено</div>
                <div className="font-semibold text-2xl">{totalSpent}₽</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                <Icon name="Calendar" size={20} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">С нами</div>
                <div className="font-semibold">{formatDate(profile.created_at).split(',')[0]}</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <Tabs defaultValue="orders" className="p-6">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="orders">
                <Icon name="History" size={16} className="mr-2" />
                История заказов
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Package" size={64} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">У вас пока нет заказов</p>
                    <Button className="mt-4" onClick={() => navigate('/')}>
                      Выбрать сервис
                    </Button>
                  </div>
                ) : (
                  orders.map(order => (
                    <Card key={order.id} className="p-4 bg-muted/30 border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{order.service_name}</h4>
                          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">{order.plan}</Badge>
                          <div className="text-xl font-bold text-accent">{order.price}₽</div>
                        </div>
                      </div>
                      
                      <div className="bg-background/50 rounded-lg p-3 mb-3">
                        <div className="text-xs text-muted-foreground mb-1">Ваш запрос:</div>
                        <div className="text-sm">{order.input_text}</div>
                      </div>

                      {order.result && (
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                          <div className="text-xs text-primary mb-2 flex items-center gap-1">
                            <Icon name="Sparkles" size={12} />
                            Результат от Juno:
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{order.result}</div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Платежная информация</h3>
                  <Card className="p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Icon name="CreditCard" size={24} className="text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Платежи отправляются на карту</div>
                        <div className="font-mono font-semibold">**** **** **** 8871</div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Информация об Juno</h3>
                  <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                        <Icon name="Shield" size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Juno</div>
                        <div className="text-sm text-muted-foreground">Ваш Стратег и Непоколебимый Защитник</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Juno черпает свою сущность из образа Юноны — верховной богини римского пантеона, покровительницы государства, семьи и финансов. 
                      Она не просто советчик — она управляет сложностью, видит общую картину и выстраивает стратегии как мудрый полководец.
                    </p>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Действия с аккаунтом</h3>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      localStorage.removeItem('userEmail');
                      navigate('/');
                    }}
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти из аккаунта
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}