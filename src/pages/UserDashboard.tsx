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
  const [userAITokens, setUserAITokens] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    loadPurchases();
  }, [navigate]);

  const loadPurchases = async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);

    try {
      const aiTokensResponse = await fetch(
        `https://functions.poehali.dev/62237982-f08c-4d74-99d7-28201bfc5f93?email=${userData.email}`
      );
      const aiTokensData = await aiTokensResponse.json();
      setUserAITokens(aiTokensData.credits || 0);

      const ordersResponse = await fetch(
        `https://functions.poehali.dev/fe27a5e8-ec1c-4cb4-beb7-b6ccb2075c5f?email=${userData.email}`
      );
      const ordersData = await ordersResponse.json();
      
      const formattedPurchases = ordersData.orders?.map((order: any) => ({
        id: order.id,
        product_name: order.service_name,
        price: order.plan === 'basic' ? '1 AI-токен' : order.plan === 'pro' ? '3 AI-токена' : '5 AI-токенов',
        created_at: new Date(order.created_at).toLocaleString('ru-RU'),
        result: order.ai_result || 'Обрабатывается...'
      })) || [];
      
      setPurchases(formattedPurchases);
    } catch (error) {
      console.error('Error loading data:', error);
    }

    setLoading(false);
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
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
              <Icon name="Coins" size={20} className="text-yellow-400" />
              <span className="text-white font-bold">{userAITokens}</span>
              <Button 
                onClick={() => navigate('/credits')} 
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 ml-2"
              >
                <Icon name="Plus" size={16} className="mr-1" />
                Купить
              </Button>
            </div>
            <Button onClick={handleLogout} variant="destructive">
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </div>
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
                      <p className="font-semibold mb-2 flex items-center justify-between">
                        Результат:
                        <Button
                          onClick={() => {
                            const blob = new Blob([purchase.result || ''], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${purchase.product_name}_${purchase.id}.txt`;
                            a.click();
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Icon name="Download" size={16} className="mr-1" />
                          Скачать
                        </Button>
                      </p>
                      <p className="text-white/80 whitespace-pre-wrap">{purchase.result}</p>
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