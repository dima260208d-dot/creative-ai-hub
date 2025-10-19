import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const services = [
  { id: 0, name: '💬 Обычный чат', tokens: 5 },
  { id: 29, name: '🧠 AI Психолог', tokens: 15 },
  { id: 30, name: '🚀 AI Продвинутый чат', tokens: 10 },
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

interface ChatHistoryItem {
  id: number;
  chat_id: string;
  chat_title: string;
  service_name: string;
  updated_at: string;
}

export default function Index() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; thinking?: string }>>([]);
  const [selectedService, setSelectedService] = useState(0);
  const [userTokens, setUserTokens] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deepThinkMode, setDeepThinkMode] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string; content: string; type: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      loadUserTokens(parsed.email);
      loadChatHistory(parsed.email);
      setCurrentChatId(Date.now().toString());
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

  const loadChatHistory = async (email: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea', {
        headers: { 'X-User-Email': email }
      });
      const data = await response.json();
      if (data.success) {
        setChatHistory(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveCurrentChat = async () => {
    if (!user || messages.length === 0) return;
    
    const service = services.find(s => s.id === selectedService);
    const userMsg = messages.find(m => m.role === 'user');
    const chatTitle = userMsg ? userMsg.content.slice(0, 50) : 'Новый чат';
    
    try {
      const response = await fetch('https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user.email
        },
        body: JSON.stringify({
          chat_id: currentChatId,
          chat_title: chatTitle,
          service_id: selectedService,
          service_name: service?.name || 'Чат',
          messages: messages
        })
      });
      
      if (response.ok) {
        await loadChatHistory(user.email);
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea?chat_id=${chatId}`, {
        headers: { 'X-User-Email': user.email }
      });
      const data = await response.json();
      if (data.success && data.chat) {
        setMessages(data.chat.messages || []);
        setSelectedService(data.chat.service_id);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedService(0);
    setCurrentChatId(Date.now().toString());
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      await fetch(`https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea?chat_id=${chatId}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': user.email }
      });
      loadChatHistory(user.email);
      if (currentChatId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          content: content,
          type: file.type
        }]);
        toast({ title: '✅ Файл прикреплён', description: file.name });
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && attachedFiles.length === 0) {
      toast({ title: 'Введите сообщение или прикрепите файл', variant: 'destructive' });
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
    let tokensNeeded = service?.tokens || 5;
    
    if (deepThinkMode) tokensNeeded += 10;
    if (attachedFiles.length > 0) tokensNeeded += attachedFiles.length * 5;

    const creditsCheck = await fetch(`https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email=${user.email}`);
    const creditsData = await creditsCheck.json();
    const currentBalance = creditsData.credits || 0;
    
    setUserTokens(currentBalance);

    if (currentBalance < tokensNeeded) {
      toast({
        title: '⚠️ Недостаточно токенов',
        description: `Пополните баланс. Нужно: ${tokensNeeded} токенов, у вас: ${currentBalance}`,
        variant: 'destructive'
      });
      setTimeout(() => navigate('/credits'), 1500);
      return;
    }

    const userMessage = message;
    const files = [...attachedFiles];
    setMessage('');
    setAttachedFiles([]);
    setMessages(prev => [...prev, { role: 'user', content: userMessage + (files.length > 0 ? `\n\n📎 Прикреплено файлов: ${files.length}` : '') }]);
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
          user_email: user?.email,
          deep_think: deepThinkMode,
          files: files
        })
      });

      const data = await response.json();

      if (data.success && data.result) {
        const thinking = data.thinking || undefined;
        setMessages(prev => [...prev, { role: 'assistant', content: data.result, thinking }]);
        
        if (user) {
          const balanceCheck = await fetch(`https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email=${user.email}`);
          const balanceData = await balanceCheck.json();
          const newBalance = balanceData.credits || 0;
          
          setUserTokens(newBalance);
          
          toast({ 
            title: '✅ Готово!', 
            description: `Использовано ${tokensNeeded} AI-токенов. Осталось: ${newBalance}` 
          });
          
          setTimeout(async () => {
            await saveCurrentChat();
          }, 500);
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
    <div className="min-h-screen bg-background flex">
      {user && (
        <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-border bg-card flex flex-col fixed left-0 top-0 h-screen z-40`}>
          <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
            <h2 className="font-bold">История чатов</h2>
            <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(false)}>
              <Icon name="X" size={18} />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 shrink-0">
            <Button onClick={startNewChat} className="w-full mb-3" size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Новый чат
            </Button>
            {chatHistory.map((chat) => (
              <div key={chat.id} className="mb-2 group relative">
                <Button
                  variant={currentChatId === chat.chat_id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left truncate pr-8"
                  size="sm"
                  onClick={() => loadChat(chat.chat_id)}
                >
                  <div className="flex-1 truncate">
                    <div className="text-xs text-muted-foreground">{chat.service_name}</div>
                    <div className="truncate">{chat.chat_title}</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={() => deleteChat(chat.chat_id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && user ? 'ml-64' : 'ml-0'} h-screen overflow-hidden`}>
        <div className="sticky top-0 z-50 border-b border-border bg-card shadow-lg shrink-0">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {user && !isSidebarOpen && (
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)}>
                  <Icon name="Menu" size={20} />
                </Button>
              )}
              <button onClick={startNewChat} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="https://cdn.poehali.dev/files/5474f469-cefe-4c33-a935-85f6463e1f5d.jpg" alt="Juno AI" className="w-12 h-12 rounded-full border-2 border-primary shadow-md shadow-primary/50" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Juno</h1>
              </button>
            </div>
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

        <div className="flex-1 overflow-auto px-4 py-6">
          <div className="container mx-auto max-w-4xl space-y-4">
              {messages.length === 0 && (
                <Card className="p-8 text-center">
                  <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-primary" />
                  <h2 className="text-2xl font-bold mb-2">Привет! Я Juno ⚡</h2>
                  <p className="text-muted-foreground">Выбери сервис и задай вопрос!</p>
                </Card>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] space-y-3`}>
                    {msg.thinking && (
                      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300/50 dark:border-purple-700/50">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                            <Icon name="Brain" size={18} />
                            <span>Процесс размышления</span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{msg.thinking}</p>
                        </div>
                      </Card>
                    )}
                    <Card className={`p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </Card>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] space-y-2">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Loader2" size={20} className="animate-spin" />
                        <span>{deepThinkMode ? 'Глубоко размышляю...' : 'Думаю...'}</span>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="border-t border-border bg-card px-4 py-4 shrink-0">
          <div className="container mx-auto max-w-4xl space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="deep-think" 
                    checked={deepThinkMode} 
                    onCheckedChange={setDeepThinkMode}
                  />
                  <Label htmlFor="deep-think" className="text-sm cursor-pointer">
                    🧠 Глубокое мышление <Badge variant="outline" className="ml-1">+10 токенов</Badge>
                  </Label>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Paperclip" size={16} className="mr-1" />
                Файлы
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                className="hidden"
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </div>

            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, idx) => (
                  <Badge key={idx} variant="secondary" className="pr-1">
                    <Icon name="File" size={14} className="mr-1" />
                    {file.name}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFile(idx)}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

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
    </div>
  );
}