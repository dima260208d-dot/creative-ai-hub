import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Purchase {
  id: number;
  product_name: string;
  price: string;
  created_at: string;
  result?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchases' | 'generate'>('purchases');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    loadPurchases();
  }, [navigate]);

  const loadPurchases = async () => {
    setLoading(false);
    setPurchases([
      { id: 1, product_name: 'AI Биография Мастер', price: '499₽', created_at: '2025-10-17 10:30', result: 'Ваша биография готова...' },
      { id: 2, product_name: 'Нейро-Гадалка', price: '299₽', created_at: '2025-10-16 14:20', result: 'Ваше предсказание: удача уже близко!' }
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setTimeout(() => {
      setGeneratedContent(`AI-результат для запроса: "${prompt}"\n\nВаш контент успешно сгенерирован! 🚀\n\n(Демо-режим без OpenAI API)`);
      setGenerating(false);
    }, 2000);
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
            <Button variant="outline" onClick={() => navigate('/')} className="bg-white/10 text-white hover:bg-white/20">
              <Icon name="Home" size={20} />
            </Button>
            <h1 className="text-4xl font-bold text-white">Мой кабинет</h1>
          </div>
          <Button onClick={handleLogout} variant="destructive">
            <Icon name="LogOut" size={20} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('purchases')}
            variant={activeTab === 'purchases' ? 'default' : 'outline'}
            className={activeTab === 'purchases' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}
          >
            <Icon name="ShoppingBag" size={20} className="mr-2" />
            Мои покупки
          </Button>
          <Button
            onClick={() => setActiveTab('generate')}
            variant={activeTab === 'generate' ? 'default' : 'outline'}
            className={activeTab === 'generate' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}
          >
            <Icon name="Sparkles" size={20} className="mr-2" />
            AI Генерация
          </Button>
        </div>

        {activeTab === 'purchases' ? (
          <div className="grid grid-cols-1 gap-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{purchase.product_name}</span>
                    <span className="text-green-400">{purchase.price}</span>
                  </CardTitle>
                  <p className="text-white/60 text-sm">{purchase.created_at}</p>
                </CardHeader>
                <CardContent>
                  {purchase.result && (
                    <div className="bg-white/5 rounded-lg p-4 text-white">
                      <p className="font-semibold mb-2">Результат:</p>
                      <p className="text-white/80">{purchase.result}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {purchases.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="py-12 text-center">
                  <Icon name="ShoppingBag" size={48} className="mx-auto text-white/40 mb-4" />
                  <p className="text-white/60">У вас пока нет покупок</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">AI Генератор контента</CardTitle>
              <p className="text-white/60">Используйте AI для создания уникального контента</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white mb-2 block">Ваш запрос:</label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Например: Напиши биографию для инстаграм..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={generating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {generating ? (
                  <>
                    <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={20} className="mr-2" />
                    Сгенерировать
                  </>
                )}
              </Button>

              {generatedContent && (
                <div className="bg-white/5 rounded-lg p-6 mt-4">
                  <p className="text-white font-semibold mb-3">Результат:</p>
                  <Textarea
                    value={generatedContent}
                    readOnly
                    rows={8}
                    className="bg-white/5 border-white/20 text-white resize-none"
                  />
                  <Button 
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    variant="outline"
                    className="mt-4 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Icon name="Copy" size={20} className="mr-2" />
                    Скопировать
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
