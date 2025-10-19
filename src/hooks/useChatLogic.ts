import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ChatHistoryItem {
  id: number;
  chat_id: string;
  chat_title: string;
  service_name: string;
  updated_at: string;
}

interface Service {
  id: number;
  name: string;
  tokens: number;
}

export const useChatLogic = (services: Service[]) => {
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
  const [streamingThinking, setStreamingThinking] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingThinking, streamingAnswer, isLoading, isThinking, isStreaming]);

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
      
      reader.onerror = () => {
        toast({ 
          title: '❌ Ошибка чтения файла', 
          description: `Не удалось прочитать ${file.name}`,
          variant: 'destructive'
        });
      };
      
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
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
    const newUserMessage = { role: 'user' as const, content: userMessage + (files.length > 0 ? `\n\n📎 Прикреплено файлов: ${files.length}` : '') };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    if (user && messages.length === 0) {
      try {
        const service = services.find(s => s.id === selectedService);
        const chatTitle = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
        const saveResponse = await fetch('https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-User-Email': user.email },
          body: JSON.stringify({
            chat_id: currentChatId,
            user_email: user.email,
            chat_title: chatTitle,
            service_id: selectedService,
            service_name: service?.name || 'Чат',
            messages: updatedMessages
          })
        });
        
        if (saveResponse.ok) {
          await loadChatHistory(user.email);
        }
      } catch (error) {
        console.error('Error saving first message:', error);
      }
    }

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
        
        if (thinking && deepThinkMode) {
          setIsThinking(true);
          setStreamingThinking('');
          
          const words = thinking.split(' ');
          for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 30));
            setStreamingThinking(words.slice(0, i + 1).join(' '));
          }
          
          setIsThinking(false);
          setStreamingThinking('');
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setIsStreaming(true);
        setStreamingAnswer('');
        
        const answerWords = data.result.split(' ');
        for (let i = 0; i < answerWords.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 40));
          setStreamingAnswer(answerWords.slice(0, i + 1).join(' '));
        }
        
        setIsStreaming(false);
        setMessages(prev => [...prev, { role: 'assistant', content: data.result, thinking }]);
        setStreamingAnswer('');
        
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

  return {
    message,
    setMessage,
    isLoading,
    messages,
    selectedService,
    setSelectedService,
    userTokens,
    user,
    chatHistory,
    currentChatId,
    isSidebarOpen,
    setIsSidebarOpen,
    deepThinkMode,
    setDeepThinkMode,
    attachedFiles,
    streamingThinking,
    isThinking,
    streamingAnswer,
    isStreaming,
    fileInputRef,
    messagesEndRef,
    loadChat,
    startNewChat,
    deleteChat,
    handleFileUpload,
    removeFile,
    handleSend
  };
};