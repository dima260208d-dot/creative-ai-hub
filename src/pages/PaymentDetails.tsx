import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function PaymentDetails() {
  const navigate = useNavigate();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Скопировано',
      description: `${label} скопирован в буфер обмена`
    });
  };

  const bankDetails = [
    {
      bank: 'Озон Банк',
      cardNumber: '2204 3201 6387 8871',
      cardHolder: 'JUNO AI',
      icon: 'CreditCard',
      color: 'from-purple-600 to-blue-600'
    }
  ];

  const packages = [
    { credits: 10, price: 99, bonus: 0 },
    { credits: 50, price: 399, bonus: 10 },
    { credits: 100, price: 699, bonus: 25 },
    { credits: 500, price: 2999, bonus: 150 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/credits')} 
            className="bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-4xl font-bold text-white">Реквизиты для оплаты</h1>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border-yellow-400/30">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <Icon name="AlertCircle" size={32} className="text-yellow-300 shrink-0" />
                <div className="text-white">
                  <p className="font-bold text-lg mb-2">Важно!</p>
                  <p className="text-white/90 text-sm leading-relaxed">
                    После перевода напишите в поддержку @juno_ai_support с указанием вашего email и суммы перевода. 
                    Токены будут зачислены в течение 5 минут после проверки платежа.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {bankDetails.map((bank, idx) => (
            <Card key={idx} className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Icon name={bank.icon as any} size={32} className="text-yellow-400" />
                  {bank.bank}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm mb-1">Номер карты</p>
                    <div className="flex items-center justify-between">
                      <p className="text-white text-2xl font-mono font-bold">{bank.cardNumber}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bank.cardNumber.replace(/\s/g, ''), 'Номер карты')}
                        className="text-white hover:bg-white/10"
                      >
                        <Icon name="Copy" size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm mb-1">Получатель</p>
                    <div className="flex items-center justify-between">
                      <p className="text-white text-lg font-semibold">{bank.cardHolder}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bank.cardHolder, 'Имя получателя')}
                        className="text-white hover:bg-white/10"
                      >
                        <Icon name="Copy" size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Icon name="Package" size={28} className="text-blue-400" />
                Пакеты AI-токенов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">
                        {pkg.credits} {pkg.bonus > 0 && (
                          <span className="text-green-400">+{pkg.bonus}</span>
                        )} AI-токенов
                      </p>
                      <p className="text-white/60 text-sm">
                        ~{Math.round(pkg.price / (pkg.credits + pkg.bonus))}₽ за токен
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">{pkg.price}₽</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(pkg.price.toString(), 'Сумма')}
                        className="text-white/80 hover:bg-white/10 mt-1"
                      >
                        <Icon name="Copy" size={16} className="mr-1" />
                        Копировать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-white/20">
            <CardContent className="py-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Icon name="ListOrdered" size={24} className="text-blue-300" />
                Инструкция по оплате
              </h3>
              <ol className="space-y-3 text-white/90">
                <li className="flex gap-3">
                  <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">1</span>
                  <span>Переведите нужную сумму на карту выше</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">2</span>
                  <span>Напишите в Telegram: <a href="https://t.me/juno_ai_support" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@juno_ai_support</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">3</span>
                  <span>Укажите ваш email и сумму перевода</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold">4</span>
                  <span>Получите AI-токены в течение 5 минут!</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/credits')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Вернуться к пакетам
            </Button>
            <Button
              onClick={() => window.open('https://t.me/juno_ai_support', '_blank')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-6"
            >
              <Icon name="MessageCircle" size={20} className="mr-2" />
              Написать в поддержку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
