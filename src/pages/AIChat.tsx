import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  const serviceName = searchParams.get('name') || 'AI Сервис';
  const tokensNeeded = parseInt(searchParams.get('tokens') || '5');
  const urlChatId = searchParams.get('chat_id');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [isDirector, setIsDirector] = useState(false);
  const [chatId, setChatId] = useState(urlChatId || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string; data: string; type: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);

    if (!serviceId) {
      navigate('/');
      return;
    }

    loadUserTokens();
    
    if (urlChatId) {
      loadChatHistoryFromServer(urlChatId);
    }
  }, [navigate, serviceId, urlChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      
      if (data.role && data.role !== userData.role) {
        const updatedUser = { ...userData, role: data.role };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsDirector(data.role === 'director' || data.role === 'admin');
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadChatHistoryFromServer = async (loadChatId: string) => {
    const user = localStorage.getItem('user');
    if (!user) return;
    
    const userData = JSON.parse(user);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/c1fa1c51-0a9f-4806-b2be-c89f20413e06?chat_id=${loadChatId}`,
        {
          headers: {
            'X-User-Email': userData.email
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chat && data.chat.messages) {
          const loadedMessages = data.chat.messages
            .filter((m: any) => !m.thinking)
            .map((m: any, idx: number) => ({
              id: Date.now() + idx,
              role: m.role,
              content: m.content,
              timestamp: new Date()
            }));
          setMessages(loadedMessages);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const base64Content = base64Data.split(',')[1];
        
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          data: base64Content,
          type: fileExtension
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const user = localStorage.getItem('user');
    if (!user) return;
    const userData = JSON.parse(user);
    const userIsDirector = userData.role === 'director' || userData.role === 'admin';

    if (!userIsDirector && userTokens < tokensNeeded) {
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
      content: input + (attachedFiles.length > 0 ? ` [${attachedFiles.length} файлов]` : ''),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const isImageGeneration = serviceId === '32';
      const apiUrl = isImageGeneration 
        ? 'https://functions.poehali.dev/280ede35-32cc-4715-a89c-f76364702010'
        : 'https://functions.poehali.dev/db181a2b-b53b-404e-8551-881ec3ab1664';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userData.email
        },
        body: JSON.stringify(isImageGeneration ? {
          service_id: 32,
          input: currentInput,
          user_email: userData.email
        } : {
          message: currentInput,
          chat_id: chatId,
          documents: attachedFiles
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.result || data.reply || 'Не могу ответить',
          timestamp: new Date()
        };

        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);

        setAttachedFiles([]);

        if (data.chat_id && data.chat_id !== chatId) {
          setChatId(data.chat_id);
          setSearchParams({ 
            service: serviceId || '1', 
            name: serviceName, 
            tokens: tokensNeeded.toString(),
            chat_id: data.chat_id 
          });
        }

        if (!userIsDirector) {
          setUserTokens(prev => prev - tokensNeeded);
        }

        toast({
          title: '✅ Готово!',
          description: userIsDirector 
            ? 'Ответ получен! (Безлимитный доступ)'
            : `Использовано ${tokensNeeded} AI-токенов. Осталось: ${userTokens - tokensNeeded}`
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось получить ответ',
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
    if (confirm('Очистить историю и начать новый чат?')) {
      setMessages([]);
      const newChatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setChatId(newChatId);
      setSearchParams({ 
        service: serviceId || '1', 
        name: serviceName, 
        tokens: tokensNeeded.toString()
      });
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
              <p className="text-white/60 text-sm">AI-Чат с памятью • Word/Excel/PDF • {messages.length} сообщений</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
              <Icon name="Coins" size={20} className="text-yellow-400" />
              {isDirector ? (
                <span className="text-white font-bold flex items-center gap-2">
                  ∞ <span className="text-xs text-green-400">Безлимит</span>
                </span>
              ) : (
                <span className="text-white font-bold">{userTokens}</span>
              )}
            </div>
            <Button onClick={clearChat} variant="outline" className="bg-white/10 text-white hover:bg-white/20">
              <Icon name="Trash2" size={20} />
            </Button>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6" style={{ height: 'calc(100vh - 340px)' }}>
          <CardContent className="p-6 overflow-y-auto h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <Icon name="MessageSquare" size={64} className="mb-4" />
                <p className="text-xl mb-2">AI-ассистент с памятью диалога</p>
                <p className="text-sm">Загружайте документы Word, Excel, PDF — я запомню всё!</p>
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
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4">
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Напишите сообщение или загрузите документ..."
                className="min-h-[80px] bg-white/5 text-white border-white/20 resize-none"
                disabled={loading}
              />
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  <Icon name="Paperclip" size={20} />
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={loading || (!input.trim() && attachedFiles.length === 0)} 
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden"
              onChange={handleFileUpload}
              accept=".doc,.docx,.xls,.xlsx,.pdf"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}