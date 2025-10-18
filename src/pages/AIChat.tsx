import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const serviceName = searchParams.get('name') || 'AI Сервис';
  const tokensNeeded = parseInt(searchParams.get('tokens') || '5');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    if (!serviceId) {
      navigate('/');
      return;
    }

    loadUserTokens();
    loadChatHistory();
  }, [navigate, serviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserTokens = async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email=${userData.email}`
      );
      const data = await response.json();
      setUserTokens(data.credits || 0);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadChatHistory = () => {
    const savedChats = localStorage.getItem(`chat_${serviceId}`);
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  };

  const saveChatHistory = (msgs: Message[]) => {
    localStorage.setItem(`chat_${serviceId}`, JSON.stringify(msgs));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (userTokens < tokensNeeded) {
      toast({
        title: 'Недостаточно AI-токенов',
        description: `Нужно ${tokensNeeded} AI-токенов. У вас: ${userTokens}`,
        variant: 'destructive'
      });
      setTimeout(() => navigate('/credits'), 1500);
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const user = localStorage.getItem('user');
    if (!user) return;
    const userData = JSON.parse(user);

    try {
      const response = await fetch('https://functions.poehali.dev/280ede35-32cc-4715-a89c-f76364702010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: parseInt(serviceId),
          service_name: serviceName,
          input_text: input
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.result || 'Генерация завершена!',
          timestamp: new Date()
        };

        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        saveChatHistory(updatedMessages);

        setUserTokens(data.credits_remaining);

        toast({
          title: '✅ Готово!',
          description: `Использовано ${tokensNeeded} AI-токенов. Осталось: ${data.credits_remaining}`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать генерацию',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить запрос',
        variant: 'destructive'
      });
    }

    setLoading(false);
  };

  const clearChat = () => {
    if (confirm('Очистить историю чата?')) {
      setMessages([]);
      localStorage.removeItem(`chat_${serviceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')} className="bg-white/10 text-white hover:bg-white/20">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{serviceName}</h1>
              <p className="text-white/60 text-sm">AI-Чат • {tokensNeeded} AI-токенов за запрос</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
              <Icon name="Coins" size={20} className="text-yellow-400" />
              <span className="text-white font-bold">{userTokens}</span>
            </div>
            <Button onClick={clearChat} variant="outline" className="bg-white/10 text-white hover:bg-white/20">
              <Icon name="Trash2" size={20} />
            </Button>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6" style={{ height: 'calc(100vh - 280px)' }}>
          <CardContent className="p-6 overflow-y-auto h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <Icon name="MessageSquare" size={64} className="mb-4" />
                <p className="text-xl mb-2">Начните диалог с AI</p>
                <p className="text-sm">Задайте вопрос или опишите задачу</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/20 text-white border border-white/30'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 rounded-2xl px-4 py-3 border border-white/30">
                      <div className="flex items-center gap-2 text-white">
                        <Icon name="Loader" size={20} className="animate-spin" />
                        <span>AI генерирует ответ...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Напишите ваш запрос..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg py-6"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-6"
          >
            {loading ? (
              <Icon name="Loader" size={24} className="animate-spin" />
            ) : (
              <Icon name="Send" size={24} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}