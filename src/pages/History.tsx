import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  service_name: string;
  input_text: string;
  result: string;
  created_at: string;
  tokens_used: number;
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    loadHistory();
  }, [navigate]);

  const loadHistory = async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/dae3ca97-9b18-4750-a99e-c449f81e0a79?email=${userData.email}`
      );
      const data = await response.json();

      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить историю',
        variant: 'destructive'
      });
    }

    setLoading(false);
  };

  const filterHistory = () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return history.filter((item) => {
      const itemDate = new Date(item.created_at).getTime();

      if (filter === 'today') {
        return now - itemDate < dayMs;
      } else if (filter === 'week') {
        return now - itemDate < dayMs * 7;
      }
      return true;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Скопировано',
      description: 'Текст скопирован в буфер обмена'
    });
  };

  const downloadText = (text: string, serviceName: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serviceName}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: '✅ Загружено',
      description: 'Файл сохранён на устройство'
    });
  };

  const filteredHistory = filterHistory();

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
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-4xl font-bold text-white">История генераций</h1>
          </div>
          <Badge className="bg-white/20 text-white text-lg px-4 py-2">
            {filteredHistory.length} результатов
          </Badge>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? '' : 'bg-white/10 text-white hover:bg-white/20'}
          >
            Всё время
          </Button>
          <Button
            onClick={() => setFilter('today')}
            variant={filter === 'today' ? 'default' : 'outline'}
            className={filter === 'today' ? '' : 'bg-white/10 text-white hover:bg-white/20'}
          >
            Сегодня
          </Button>
          <Button
            onClick={() => setFilter('week')}
            variant={filter === 'week' ? 'default' : 'outline'}
            className={filter === 'week' ? '' : 'bg-white/10 text-white hover:bg-white/20'}
          >
            Неделя
          </Button>
        </div>

        {filteredHistory.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="py-12 text-center">
              <Icon name="FileSearch" size={64} className="text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg">История пуста</p>
              <p className="text-white/40 text-sm mt-2">
                Используйте AI-сервисы, результаты появятся здесь
              </p>
              <Button
                onClick={() => navigate('/')}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Перейти к сервисам
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {item.service_name}
                        </Badge>
                        <span className="text-white/60 text-sm">
                          {new Date(item.created_at).toLocaleString('ru-RU')}
                        </span>
                        <Badge variant="outline" className="text-white/80 border-white/30">
                          {item.tokens_used} токенов
                        </Badge>
                      </div>
                      <p className="text-white/90 font-medium mb-2">
                        Запрос: {item.input_text.slice(0, 100)}
                        {item.input_text.length > 100 && '...'}
                      </p>
                      <p className="text-white/70 text-sm line-clamp-2">
                        {item.result.slice(0, 200)}
                        {item.result.length > 200 && '...'}
                      </p>
                    </div>
                    <Icon name="ChevronRight" size={24} className="text-white/40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                {selectedItem?.service_name}
              </Badge>
              <span className="text-white/60 text-sm font-normal">
                {selectedItem && new Date(selectedItem.created_at).toLocaleString('ru-RU')}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Icon name="MessageSquare" size={20} />
                  Ваш запрос:
                </h3>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/90">{selectedItem.input_text}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Sparkles" size={20} />
                  Результат AI:
                </h3>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-white/90 whitespace-pre-wrap">{selectedItem.result}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => copyToClipboard(selectedItem.result)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Icon name="Copy" size={18} className="mr-2" />
                  Скопировать
                </Button>
                <Button
                  onClick={() => downloadText(selectedItem.result, selectedItem.service_name)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Icon name="Download" size={18} className="mr-2" />
                  Скачать
                </Button>
              </div>

              <div className="text-center text-white/60 text-sm">
                Использовано: {selectedItem.tokens_used} AI-токенов
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}