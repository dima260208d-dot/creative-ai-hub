import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({ title: 'Введите сообщение', variant: 'destructive' });
      return;
    }

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/db181a2b-b53b-404e-8551-881ec3ab1664', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось получить ответ', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проблема с подключением', variant: 'destructive' });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon name="MessageSquare" size={24} className="text-primary" />
            <h1 className="text-xl font-bold">AI-Помощник</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        <div className="flex-1 overflow-auto mb-4 space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center">
              <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Привет! 👋</h2>
              <p className="text-muted-foreground">Задай любой вопрос, и я помогу!</p>
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
  );
}