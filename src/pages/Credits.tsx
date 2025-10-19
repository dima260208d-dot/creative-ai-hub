import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const creditPackages = [
  { credits: 10, price: 10, popular: false },
  { credits: 50, price: 50, popular: true, bonus: 10 },
  { credits: 100, price: 100, popular: false, bonus: 25 },
  { credits: 500, price: 500, popular: false, bonus: 150 }
];

const PAYMENT_VERIFY_URL = 'https://functions.poehali.dev/a1d0158b-f743-4eeb-8832-860a50fe6a29';

export default function Credits() {
  const navigate = useNavigate();
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [isDirector, setIsDirector] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    setIsDirector(userData.role === 'director');

    loadCredits();
  }, [navigate]);

  const loadCredits = async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email=${userData.email}`
      );
      const data = await response.json();
      setUserCredits(data.credits || 0);
    } catch (error) {
      console.error('Error loading credits:', error);
    }

    setLoading(false);
  };

  const handlePurchase = async (pkg: typeof creditPackages[0]) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    const totalCredits = pkg.credits + (pkg.bonus || 0);
    
    try {
      const response = await fetch('https://functions.poehali.dev/cdd10f3b-3bf7-4f92-bccb-f1b71a85baee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          amount: pkg.price,
          package_id: `package_${pkg.credits}`
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением',
        variant: 'destructive'
      });
    }
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
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="bg-white/10 text-white hover:bg-white/20">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-4xl font-bold text-white">Купить AI-Токены</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-xl border border-white/20">
            <div className="flex items-center gap-2">
              <Icon name="Coins" size={24} className="text-yellow-400" />
              <div>
                <p className="text-white/60 text-xs">Ваш баланс</p>
                {isDirector ? (
                  <p className="text-white text-2xl font-bold flex items-center gap-2">
                    ∞ <span className="text-sm text-green-400">Безлимит</span>
                  </p>
                ) : (
                  <p className="text-white text-2xl font-bold">{userCredits} AI-токенов</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-8 space-y-4">
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-white/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <Icon name="Info" size={32} className="text-blue-300" />
                <div className="text-white">
                  <p className="font-semibold text-lg">Как работают AI-токены?</p>
                  <p className="text-white/80">AI-токены = универсальная валюта для всех AI-сервисов. Покупайте и используйте где угодно!</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-400/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Icon name="CheckCircle" size={28} className="text-green-300" />
                  <div className="text-white">
                    <p className="font-semibold">Автоматическое начисление</p>
                    <p className="text-white/80 text-sm">После оплаты токены зачисляются моментально</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/payment-details')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20"
                >
                  <Icon name="FileText" size={20} />
                  <span className="font-semibold">Реквизиты</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {isDirector && (
          <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-400/30">
            <CardContent className="py-8 text-center">
              <Icon name="Crown" size={48} className="text-yellow-400 mx-auto mb-4" />
              <h2 className="text-white text-2xl font-bold mb-2">Директорский доступ</h2>
              <p className="text-white/80 mb-6">У вас специальные привилегии! Пополняйте баланс бесплатно в любое время.</p>
              <Button
                onClick={async () => {
                  const user = localStorage.getItem('user');
                  if (!user) return;
                  const userData = JSON.parse(user);
                  
                  try {
                    const response = await fetch('https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: userData.email, amount: 1000 })
                    });
                    const data = await response.json();
                    if (data.success) {
                      setUserCredits(data.credits);
                      toast({
                        title: '✅ Баланс пополнен!',
                        description: `Добавлено 1000 AI-токенов. Новый баланс: ${data.credits}`
                      });
                    }
                  } catch (error) {
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось пополнить баланс',
                      variant: 'destructive'
                    });
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg"
              >
                <Icon name="Zap" size={24} className="mr-2" />
                Пополнить +1000 AI-токенов бесплатно
              </Button>
            </CardContent>
          </Card>
        )}

        {!isDirector && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {creditPackages.map((pkg) => (
            <Card
              key={pkg.credits}
              className={`relative overflow-hidden ${
                pkg.popular
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                  : 'bg-white/10 border-white/20'
              } backdrop-blur-lg transition-all hover:scale-105`}
            >
              {pkg.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                  ПОПУЛЯРНО
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-white text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon name="Coins" size={32} className="text-yellow-400" />
                  </div>
                  <p className="text-4xl font-bold">{pkg.credits}</p>
                  {pkg.bonus && (
                    <p className="text-green-400 text-sm mt-1">+{pkg.bonus} бонус!</p>
                  )}
                  <p className="text-white/60 text-sm">AI-токенов</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{pkg.price}₽</p>
                  <p className="text-white/60 text-sm">1 AI-токен = 1₽</p>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.credits}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {purchasing === pkg.credits ? (
                    <>
                      <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Icon name="ShoppingCart" size={20} className="mr-2" />
                      Купить
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="py-6">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="HelpCircle" size={24} className="text-blue-400" />
                Частые вопросы
              </h3>
              <div className="space-y-3 text-white/80">
                <div>
                  <p className="font-semibold text-white">AI-токены сгорают?</p>
                  <p className="text-sm">Нет, AI-токены не сгорают и не имеют срока действия</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Можно ли вернуть AI-токены?</p>
                  <p className="text-sm">Да, возврат в течение 14 дней при отсутствии использования</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Как происходит оплата?</p>
                  <p className="text-sm">
                    1. Выберите пакет AI-токенов<br/>
                    2. Оплатите через ЮKassa (банковские карты)<br/>
                    3. AI-токены зачислятся автоматически!
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white">Как быстро зачисляются AI-токены?</p>
                  <p className="text-sm">Моментально после успешной оплаты (1-3 секунды)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}