import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [selectedPackage, setSelectedPackage] = useState<typeof creditPackages[0] | null>(null);

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
    setSelectedPackage(pkg);
  };

  const handleBankSelect = (bank: string) => {
    if (!selectedPackage) return;
    
    const totalCredits = selectedPackage.credits + (selectedPackage.bonus || 0);
    const cardNumber = '2204320163878871';
    
    let paymentUrl = '';
    
    if (bank === 'tbank') {
      paymentUrl = `https://www.tbank.ru/payments/?amount=${selectedPackage.price}&recipient=${cardNumber}&message=Оплата ${totalCredits} AI-токенов`;
    } else if (bank === 'sber') {
      paymentUrl = `https://www.sberbank.ru/ru/person/dist_services/pay_money?amount=${selectedPackage.price}&recipient=${cardNumber}`;
    } else if (bank === 'alfa') {
      paymentUrl = `https://alfabank.ru/make-money-transfer/?amount=${selectedPackage.price}&card=${cardNumber}`;
    } else if (bank === 'vtb') {
      paymentUrl = `https://www.vtb.ru/personal/platezhi-i-perevody/?amount=${selectedPackage.price}&card=${cardNumber}`;
    }
    
    window.open(paymentUrl, '_blank');
    setSelectedPackage(null);
    
    toast({
      title: '💳 Переход к оплате',
      description: `Оплатите ${selectedPackage.price}₽ в открывшемся окне`
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
            <h1 className="text-4xl font-bold text-white">Купить AI-Токены</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-xl border border-white/20">
            <div className="flex items-center gap-2">
              <Icon name="Coins" size={24} className="text-yellow-400" />
              <div>
                <p className="text-white/60 text-xs">Ваш баланс</p>
                <p className="text-white text-2xl font-bold">{userCredits} AI-токенов</p>
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
                  <p className="font-semibold text-lg">Как работают AI-токены?</p>
                  <p className="text-white/80">AI-токены = универсальная валюта для всех AI-сервисов. Покупайте и используйте где угодно!</p>
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
                  <p className="text-white/60 text-sm">AI-токенов</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{pkg.price}₽</p>
                  <p className="text-white/60 text-sm">~{Math.round(pkg.price / (pkg.credits + (pkg.bonus || 0)))}₽ за AI-токен</p>
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
                  <p className="font-semibold text-white">AI-токены сгорают?</p>
                  <p className="text-sm">Нет, AI-токены не сгорают и не имеют срока действия</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Можно ли вернуть AI-токены?</p>
                  <p className="text-sm">Да, возврат в течение 14 дней при отсутствии использования</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Как оплатить?</p>
                  <p className="text-sm">Выберите удобный банк: Т-Банк, Сбербанк, Альфа-Банк или ВТБ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Выберите банк для оплаты</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button
              onClick={() => handleBankSelect('tbank')}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-6"
            >
              <Icon name="CreditCard" size={24} className="mr-3" />
              Т-Банк (Тинькофф)
            </Button>
            <Button
              onClick={() => handleBankSelect('sber')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6"
            >
              <Icon name="CreditCard" size={24} className="mr-3" />
              Сбербанк
            </Button>
            <Button
              onClick={() => handleBankSelect('alfa')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-6"
            >
              <Icon name="CreditCard" size={24} className="mr-3" />
              Альфа-Банк
            </Button>
            <Button
              onClick={() => handleBankSelect('vtb')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6"
            >
              <Icon name="CreditCard" size={24} className="mr-3" />
              ВТБ
            </Button>
          </div>
          {selectedPackage && (
            <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
              <p className="text-white text-center">
                <span className="font-bold text-2xl">{selectedPackage.price}₽</span>
                <br />
                <span className="text-white/60">
                  {selectedPackage.credits + (selectedPackage.bonus || 0)} AI-токенов
                </span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}