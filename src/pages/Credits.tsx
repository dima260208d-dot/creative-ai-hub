import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const creditPackages = [
  { credits: 10, price: 500, popular: false },
  { credits: 50, price: 2000, popular: true, bonus: 5 },
  { credits: 100, price: 3500, popular: false, bonus: 15 },
  { credits: 500, price: 15000, popular: false, bonus: 100 }
];

export default function Credits() {
  const navigate = useNavigate();
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

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
    const totalCredits = pkg.credits + (pkg.bonus || 0);
    const paymentUrl = `https://www.tbank.ru/payments/?amount=${pkg.price}&recipient=2204320163878871&message=Оплата ${totalCredits} кредитов`;
    
    window.open(paymentUrl, '_blank');
    
    toast({
      title: '💳 Переход к оплате',
      description: `Оплатите ${pkg.price}₽ в открывшемся окне`
    });
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
            <h1 className="text-4xl font-bold text-white">Купить Кредиты</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-xl border border-white/20">
            <div className="flex items-center gap-2">
              <Icon name="Coins" size={24} className="text-yellow-400" />
              <div>
                <p className="text-white/60 text-xs">Ваш баланс</p>
                <p className="text-white text-2xl font-bold">{userCredits} кредитов</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-8">
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-white/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <Icon name="Info" size={32} className="text-blue-300" />
                <div className="text-white">
                  <p className="font-semibold text-lg">Как работают кредиты?</p>
                  <p className="text-white/80">1 кредит = 1 AI-генерация. Покупайте кредиты, используйте для любых сервисов!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <p className="text-white/60 text-sm">кредитов</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{pkg.price}₽</p>
                  <p className="text-white/60 text-sm">~{Math.round(pkg.price / (pkg.credits + (pkg.bonus || 0)))}₽ за кредит</p>
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

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="py-6">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="HelpCircle" size={24} className="text-blue-400" />
                Частые вопросы
              </h3>
              <div className="space-y-3 text-white/80">
                <div>
                  <p className="font-semibold text-white">Кредиты сгорают?</p>
                  <p className="text-sm">Нет, кредиты не сгорают и не имеют срока действия</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Можно ли вернуть кредиты?</p>
                  <p className="text-sm">Да, возврат в течение 14 дней при отсутствии использования</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Как оплатить?</p>
                  <p className="text-sm">Переводом на карту Озон Банк 2204 3201 6387 8871</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}