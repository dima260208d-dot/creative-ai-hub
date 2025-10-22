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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deepThinkMode, setDeepThinkMode] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string; content: string; type: string}>>([]);
  const [streamingThinking, setStreamingThinking] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [chatTitle, setChatTitle] = useState('Новый чат');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      loadUserTokens(parsed.email);
      loadChatHistory(parsed.email);
      
      // Загружаем последний чат из localStorage или создаем новый
      const savedChatId = localStorage.getItem('currentChatId');
      if (savedChatId) {
        setCurrentChatId(savedChatId);
        loadChatFromStorage(savedChatId);
      } else {
        setCurrentChatId(Date.now().toString());
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingThinking, streamingAnswer, isLoading, isThinking, isStreaming]);

  // Автосохранение чата при изменении сообщений
  useEffect(() => {
    if (messages.length > 0 && user) {
      const saveAndUpdate = async () => {
        await saveCurrentChat();
        // Обновляем историю чатов сразу после сохранения
        await loadChatHistory(user.email);
      };
      saveAndUpdate();
    }
  }, [messages]);

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
    const title = userMsg ? userMsg.content.slice(0, 50) : 'Новый чат';
    
    // Сохраняем в localStorage для мгновенного восстановления
    localStorage.setItem(`chat_${currentChatId}`, JSON.stringify({
      messages,
      service_id: selectedService,
      chat_title: title
    }));
    
    try {
      const response = await fetch('https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user.email
        },
        body: JSON.stringify({
          chat_id: currentChatId,
          chat_title: title,
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

  const loadChatFromStorage = (chatId: string) => {
    // Загружаем чат из localStorage при старте
    const saved = localStorage.getItem(`chat_${chatId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMessages(data.messages || []);
        setSelectedService(data.service_id || 0);
        setChatTitle(data.chat_title || 'Новый чат');
      } catch (error) {
        console.error('Error loading chat from storage:', error);
      }
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
        const loadedMessages = (data.chat.messages || []).filter((m: any) => !m.thinking);
        setMessages(loadedMessages);
        setSelectedService(data.chat.service_id);
        setCurrentChatId(chatId);
        setChatTitle(data.chat.chat_title || 'Новый чат');
        localStorage.setItem('currentChatId', chatId);
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedService(0);
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setChatTitle('Новый чат');
    localStorage.setItem('currentChatId', newChatId);
    setIsSidebarOpen(false);
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/fe56fd27-64b0-450b-85d7-9bdd0da6b5ea?chat_id=${chatId}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': user.email }
      });
      
      if (response.ok) {
        localStorage.removeItem(`chat_${chatId}`);
        await loadChatHistory(user.email);
        
        if (currentChatId === chatId) {
          startNewChat();
        }
        
        toast({ title: '✅ Чат удалён', description: 'Чат успешно удалён из истории' });
      } else {
        const data = await response.json();
        toast({ 
          title: '❌ Ошибка удаления', 
          description: data.error || 'Не удалось удалить чат',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({ 
        title: '❌ Ошибка', 
        description: 'Проблема с подключением к серверу',
        variant: 'destructive'
      });
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
    let tokensNeeded = service?.tokens || 1;
    
    if (deepThinkMode) tokensNeeded += 2;
    if (attachedFiles.length > 0) tokensNeeded += attachedFiles.length * 1;

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
    
    // Автоматический анализ запроса и выбор функции
    const imageKeywords = [
      'нарисуй', 'сгенерируй изображение', 'создай картинку', 'нарисовать', 
      'изображение', 'картинку', 'фото', 'иллюстрацию', 'рисунок',
      'generate image', 'create image', 'draw', 'picture'
    ];
    const needsImageGeneration = imageKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    // Автоматически переключаем на генерацию изображений
    if (needsImageGeneration && selectedService !== 32) {
      setSelectedService(32);
      toast({
        title: '🎨 Переключено на генерацию изображений',
        description: 'Автоматически выбрана функция генерации изображений'
      });
    }
    
    setMessage('');
    setAttachedFiles([]);
    const newUserMessage = { role: 'user' as const, content: userMessage + (files.length > 0 ? `\n\n📎 Прикреплено файлов: ${files.length}` : '') };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    
    // Обновляем заголовок чата из первого сообщения
    if (updatedMessages.length === 1) {
      const title = userMessage.length > 50 ? userMessage.slice(0, 50) + '...' : userMessage;
      setChatTitle(title);
    }
    
    // Проверяем, нужен ли поиск
    const searchKeywords = [
      'найди', 'поищи', 'найти', 'поиск', 'поискать',
      'что нового', 'последние новости', 'свежие новости',
      'погода', 'прогноз', 'температура',
      'курс', 'доллар', 'евро', 'биткоин',
      'цена', 'стоимость', 'сколько стоит',
      'когда', 'где', 'кто', 'какой',
      'расскажи о', 'информация о', 'что такое',
      'последний', 'новый', 'текущий', 'сейчас', 'сегодня'
    ];
    const needsSearch = searchKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    
    if (needsSearch) {
      setIsSearching(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsSearching(false);
    setIsLoading(true);

    try {
      const documentsPayload = files.map(f => ({
        name: f.name,
        data: f.content.split(',')[1] || f.content,
        type: f.name.split('.').pop()?.toLowerCase() || 'txt'
      }));

      // Для специальных сервисов (генерация изображений, ИИ без границ) используем ai-genius
      const useAiGenius = [31, 32].includes(selectedService);
      const apiUrl = useAiGenius 
        ? 'https://functions.poehali.dev/280ede35-32cc-4715-a89c-f76364702010'
        : 'https://functions.poehali.dev/db181a2b-b53b-404e-8551-881ec3ab1664';
      
      const requestBody = useAiGenius 
        ? {
            service_id: selectedService,
            service_name: service?.name || '',
            input_text: userMessage,
            user_email: user?.email || '',
            deep_think: deepThinkMode,
            files: files.map(f => ({
              name: f.name,
              content: f.content,
              type: f.type
            }))
          }
        : {
            message: userMessage,
            chat_id: currentChatId,
            documents: documentsPayload,
            deep_think: deepThinkMode
          };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user ? { 'X-User-Email': user.email } : {})
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      // ai-genius возвращает { success, result }, а simple-chat — { success, reply }
      const replyText = data.reply || data.result;

      if (data.success && replyText) {
        // Если есть thinking, показываем процесс размышления
        if (data.thinking && deepThinkMode) {
          setIsThinking(true);
          setStreamingThinking('');
          
          const thinkingWords = data.thinking.split(' ');
          for (let i = 0; i < thinkingWords.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            setStreamingThinking(thinkingWords.slice(0, i + 1).join(' '));
          }
          
          setIsThinking(false);
          setStreamingThinking('');
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Очищаем LaTeX символы из ответа
        const cleanedReply = replyText
          .replace(/\\\(/g, '')
          .replace(/\\\)/g, '')
          .replace(/\\\[/g, '')
          .replace(/\\\]/g, '')
          .replace(/\\\{/g, '')
          .replace(/\\\}/g, '')
          .replace(/\\times/g, '×')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)')
          .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
          .replace(/\^2/g, '²')
          .replace(/\^3/g, '³')
          .replace(/\^/g, '')
          .replace(/_(\d)/g, '$1');
        
        setIsStreaming(true);
        setStreamingAnswer('');
        
        const answerWords = cleanedReply.split(' ');
        for (let i = 0; i < answerWords.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 40));
          setStreamingAnswer(answerWords.slice(0, i + 1).join(' '));
        }
        
        setIsStreaming(false);
        const finalMessage: any = { role: 'assistant', content: cleanedReply };
        if (data.thinking) {
          finalMessage.thinking = data.thinking;
        }
        setMessages(prev => [...prev, finalMessage]);
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
    isSearching,
    chatTitle,
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