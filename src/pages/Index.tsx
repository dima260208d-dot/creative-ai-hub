import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const services = [
  { id: 0, name: '💬 Обычный чат', tokens: 5 },
  { id: 1, name: '✍️ Биография', tokens: 10 },
  { id: 2, name: '🔮 Гадание', tokens: 8 },
  { id: 3, name: '💡 Бизнес-идеи', tokens: 12 },
  { id: 4, name: '📄 Резюме', tokens: 10 },
  { id: 5, name: '🏷️ Нейминг', tokens: 10 },
  { id: 6, name: '📱 SMM-посты', tokens: 10 },
  { id: 7, name: '🎨 Промпт для изображения', tokens: 8 },
  { id: 8, name: '📧 Email-письмо', tokens: 10 },
  { id: 9, name: '🎬 Видео-скрипт', tokens: 12 },
  { id: 10, name: '🤖 База знаний чат-бота', tokens: 15 },
  { id: 11, name: '🎯 Концепция логотипа', tokens: 10 },
  { id: 13, name: '⚖️ Юридический договор', tokens: 15 },
  { id: 14, name: '😂 Идеи мемов', tokens: 8 },
  { id: 15, name: '📊 Структура презентации', tokens: 10 },
  { id: 16, name: '📝 SEO-статья', tokens: 15 },
  { id: 17, name: '🌍 Перевод текста', tokens: 8 },
  { id: 18, name: '🍳 Рецепты', tokens: 8 },
  { id: 19, name: '💪 План тренировок', tokens: 10 },
  { id: 20, name: '🧪 Тест-кейсы', tokens: 12 },
  { id: 21, name: '📚 Реферат', tokens: 15 },
  { id: 22, name: '📖 Сочинение', tokens: 15 },
  { id: 23, name: '✏️ Эссе', tokens: 15 },
  { id: 24, name: '🎓 Курсовая работа', tokens: 20 },
  { id: 25, name: '🎯 Дипломная работа', tokens: 25 },
  { id: 26, name: '🔬 Отчёт по лабораторной', tokens: 12 },
  { id: 27, name: '📋 Конспект лекции', tokens: 10 },
  { id: 28, name: '🔢 Решение задачи', tokens: 12 }
];

export default function Index() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [selectedService, setSelectedService] = useState(0);
  const [userTokens, setUserTokens] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      loadUserTokens(parsed.email);
    }
  }, []);

  const loadUserTokens = async (email: string) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email=${email}`);
      const data = await response.json();
      setUserTokens(data.credits || 0);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast({ title: 'Введите сообщение', variant: 'destructive' });
      return;
    }

    if (!user) {
      toast({
        title: '⚠️ Требуется авторизация',
        description: 'Войдите в аккаунт и оплатите токены',
        variant: 'destructive'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const service = services.find(s => s.id === selectedService);
    const tokensNeeded = service?.tokens || 5;

    if (userTokens < tokensNeeded) {
      toast({
        title: '⚠️ Недостаточно токенов',
        description: `Пополните баланс. Нужно: ${tokensNeeded} токенов, у вас: ${userTokens}`,
        variant: 'destructive'
      });
      setTimeout(() => navigate('/credits'), 1500);
      return;
    }

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/280ede35-32cc-4715-a89c-f76364702010', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user ? { 'X-User-Email': user.email } : {})
        },
        body: JSON.stringify({
          service_id: selectedService,
          service_name: service?.name || 'Чат',
          input_text: userMessage,
          user_email: user?.email
        })
      });

      const data = await response.json();

      if (data.success && data.result) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
        
        if (user && data.credits_remaining !== undefined) {
          setUserTokens(data.credits_remaining);
          toast({ 
            title: '✅ Готово!', 
            description: `Использовано ${tokensNeeded} AI-токенов. Осталось: ${data.credits_remaining}` 
          });
        }
      } else {
        if (data.error && data.error.includes('Недостаточно токенов')) {
          toast({ title: '⚠️ Недостаточно токенов', description: 'Пополните баланс для продолжения работы', variant: 'destructive' });
          setTimeout(() => navigate('/credits'), 1500);
        } else {
          toast({ title: 'Ошибка', description: data.error || 'Не удалось получить ответ', variant: 'destructive' });
        }
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проблема с подключением', variant: 'destructive' });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50 border-b border-border bg-card shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => { setMessages([]); setSelectedService(0); }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="https://cdn.poehali.dev/files/5474f469-cefe-4c33-a935-85f6463e1f5d.jpg" alt="Anima AI" className="w-12 h-12 rounded-full border-2 border-primary shadow-md shadow-primary/50" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Anima AI</h1>
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Badge variant="secondary" className="px-4 py-2">
                  <Icon name="Coins" size={18} className="mr-2 text-yellow-400" />
                  <span className="font-bold">{userTokens}</span>
                </Badge>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  <Icon name="User" size={18} className="mr-2" />
                  Кабинет
                </Button>
              </>
            ) : (
              <Button 
                variant="default"
                onClick={() => navigate('/login')}
              >
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        <div className="flex-1 overflow-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center">
              <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Привет! Я Anima 👋</h2>
              <p className="text-muted-foreground">Выбери сервис и задай вопрос!</p>
            </Card>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  <span>Думаю...</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Select value={selectedService.toString()} onValueChange={(v) => setSelectedService(parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите сервис" />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{service.name}</span>
                    <Badge variant="outline" className="ml-2">{service.tokens} токенов</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Напиши сообщение..."
              className="min-h-[60px] max-h-[200px]"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !message.trim()} size="lg">
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}