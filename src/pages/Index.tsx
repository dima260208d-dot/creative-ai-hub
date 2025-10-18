import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
  gradient: string;
  'AI-токенBasic': number;
  'AI-токенPro': number;
  'AI-токенUltimate': number;
  features: string[];
  uses: number;
}

const services: Service[] = [
  {
    id: 1,
    title: 'AI-Биография',
    description: 'Создай профессиональную биографию за 2 минуты',
    category: 'Контент',
    icon: 'User',
    gradient: 'from-purple-500 to-pink-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 15,
    'AI-токенUltimate': 30,
    features: ['1 биография', '3 биографии + правки', '5 биографий + стили'],
    uses: 12847
  },
  {
    id: 2,
    title: 'Нейро-Гадалка',
    description: 'Персональные предсказания и гороскопы от AI',
    category: 'Развлечения',
    icon: 'Sparkles',
    gradient: 'from-indigo-500 to-purple-500',
    'AI-токенBasic': 12,
    'AI-токенPro': 25,
    'AI-токенUltimate': 50,
    features: ['Базовое гадание', 'Расширенный расклад', 'Ежедневные прогнозы'],
    uses: 34521
  },
  {
    id: 3,
    title: 'Генератор Бизнес-Идей',
    description: 'Получи 10 персонализированных бизнес-идей',
    category: 'Бизнес',
    icon: 'Lightbulb',
    gradient: 'from-green-500 to-teal-500',
    'AI-токенBasic': 40,
    'AI-токенPro': 80,
    'AI-токенUltimate': 160,
    features: ['10 идей', 'Детальный анализ 3 идей', 'Безлимит + консультации'],
    uses: 8934
  },
  {
    id: 4,
    title: 'AI-Резюме',
    description: 'Профессиональное резюме с оптимизацией под ATS',
    category: 'Карьера',
    icon: 'FileText',
    gradient: 'from-blue-500 to-cyan-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 15,
    'AI-токенUltimate': 30,
    features: ['Базовое резюме', 'Резюме + Cover Letter', '3 версии под индустрии'],
    uses: 19283
  },
  {
    id: 5,
    title: 'Генератор Названий',
    description: 'Уникальные названия для бизнеса с проверкой доменов',
    category: 'Брендинг',
    icon: 'Type',
    gradient: 'from-orange-500 to-red-500',
    'AI-токенBasic': 12,
    'AI-токенPro': 25,
    'AI-токенUltimate': 50,
    features: ['20 названий', '50 названий + домены', 'Безлимит'],
    uses: 15672
  },
  {
    id: 6,
    title: 'AI-Посты для Соцсетей',
    description: 'Контент для Instagram, Facebook, LinkedIn за секунды',
    category: 'Контент',
    icon: 'Share2',
    gradient: 'from-pink-500 to-rose-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 25,
    'AI-токенUltimate': 50,
    features: ['10 постов', '50 постов/мес', 'Безлимит + аналитика'],
    uses: 27456
  },
  {
    id: 7,
    title: 'Нейро-Художник',
    description: 'Создай уникальные изображения для любых целей',
    category: 'Творчество',
    icon: 'Palette',
    gradient: 'from-violet-500 to-purple-500',
    'AI-токенBasic': 40,
    'AI-токенPro': 100,
    'AI-токенUltimate': 200,
    features: ['5 изображений', '25 изображений', 'Безлимит + коммерция'],
    uses: 41289
  },
  {
    id: 8,
    title: 'Email Копирайтер',
    description: 'Продающие email рассылки с высокой конверсией',
    category: 'Маркетинг',
    icon: 'Mail',
    gradient: 'from-cyan-500 to-blue-500',
    'AI-токенBasic': 20,
    'AI-токенPro': 60,
    'AI-токенUltimate': 120,
    features: ['5 писем', '20 писем', 'Безлимит + A/B тесты'],
    uses: 13542
  },
  {
    id: 9,
    title: 'Видео Скрипт Генератор',
    description: 'Вирусные скрипты для YouTube, TikTok, Reels',
    category: 'Контент',
    icon: 'Video',
    gradient: 'from-red-500 to-orange-500',
    'AI-токенBasic': 12,
    'AI-токенPro': 48,
    'AI-токенUltimate': 96,
    features: ['3 скрипта', '15 скриптов', 'Безлимит + тренды'],
    uses: 22108
  },
  {
    id: 10,
    title: 'AI-Чат Консультант',
    description: 'Умный чат-бот для твоего бизнеса за 5 минут',
    category: 'Бизнес',
    icon: 'MessageSquare',
    gradient: 'from-emerald-500 to-green-500',
    'AI-токенBasic': 48,
    'AI-токенPro': 140,
    'AI-токенUltimate': 280,
    features: ['100 запросов/мес', '1000 запросов/мес', 'Безлимит + CRM'],
    uses: 6721
  },
  {
    id: 11,
    title: 'Логотип за 5 минут',
    description: 'Профессиональный логотип и брендбук мгновенно',
    category: 'Брендинг',
    icon: 'Shapes',
    gradient: 'from-yellow-500 to-orange-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 15,
    'AI-токенUltimate': 30,
    features: ['10 логотипов', 'Векторные файлы', 'Полный брендбук'],
    uses: 18934
  },
  {
    id: 12,
    title: 'Голосовой Клонер',
    description: 'Клонируй свой голос для озвучки контента',
    category: 'Аудио',
    icon: 'Mic',
    gradient: 'from-red-500 to-pink-500',
    'AI-токенBasic': 12,
    'AI-токенPro': 32,
    'AI-токенUltimate': 64,
    features: ['1 голос', '5 голосов', 'Коммерческая лицензия'],
    uses: 9456
  },
  {
    id: 13,
    title: 'Контракт Генератор',
    description: 'Юридические документы за 3 минуты',
    category: 'Бизнес',
    icon: 'FileCheck',
    gradient: 'from-blue-500 to-indigo-500',
    'AI-токенBasic': 8,
    'AI-токенPro': 24,
    'AI-токенUltimate': 48,
    features: ['1 контракт', '10 контрактов', 'Безлимит + юрист'],
    uses: 7823
  },
  {
    id: 14,
    title: 'Мем Фабрика',
    description: 'Вирусные мемы для твоих соцсетей',
    category: 'Развлечения',
    icon: 'Smile',
    gradient: 'from-green-500 to-emerald-500',
    'AI-токенBasic': 12,
    'AI-токенPro': 25,
    'AI-токенUltimate': 50,
    features: ['20 мемов', '100 мемов', 'Безлимит + тренды'],
    uses: 31245
  },
  {
    id: 15,
    title: 'Презентация за 10 минут',
    description: 'Профессиональная презентация из текста',
    category: 'Бизнес',
    icon: 'Presentation',
    gradient: 'from-purple-500 to-blue-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 15,
    'AI-токенUltimate': 30,
    features: ['1 презентация', '5 презентаций', 'Безлимит + шаблоны'],
    uses: 14567
  },
  {
    id: 16,
    title: 'SEO Статьи Автор',
    description: 'SEO-оптимизированные статьи для блога',
    category: 'Контент',
    icon: 'FileText',
    gradient: 'from-teal-500 to-cyan-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 25,
    'AI-токенUltimate': 50,
    features: ['1 статья', '10 статей', 'Безлимит + аналитика'],
    uses: 11892
  },
  {
    id: 17,
    title: 'AI-Переводчик Pro',
    description: 'Контекстный перевод документов на 100+ языков',
    category: 'Утилиты',
    icon: 'Languages',
    gradient: 'from-orange-500 to-yellow-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 15,
    'AI-токенUltimate': 30,
    features: ['5000 слов', '50000 слов', 'Безлимит'],
    uses: 25634
  },
  {
    id: 18,
    title: 'Рецепты от AI Шефа',
    description: 'Персональные рецепты из твоих продуктов',
    category: 'Развлечения',
    icon: 'ChefHat',
    gradient: 'from-red-500 to-orange-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 8,
    'AI-токенUltimate': 16,
    features: ['50 рецептов', 'Premium доступ', 'Family план'],
    uses: 19823
  },
  {
    id: 19,
    title: 'Workout План AI',
    description: 'Персональные тренировки под твои цели',
    category: 'Здоровье',
    icon: 'Dumbbell',
    gradient: 'from-green-500 to-teal-500',
    'AI-токенBasic': 5,
    'AI-токенPro': 15,
    'AI-токенUltimate': 30,
    features: ['1 месяц', '3 месяца', 'Годовой план'],
    uses: 16745
  },
  {
    id: 20,
    title: 'Тест-Кейсы Генератор',
    description: 'Автоматическая генерация тестов для QA',
    category: 'Разработка',
    icon: 'Bug',
    gradient: 'from-purple-500 to-pink-500',
    'AI-токенBasic': 8,
    'AI-токенPro': 25,
    'AI-токенUltimate': 60,
    features: ['10 test suites', '50 test suites', 'Enterprise'],
    uses: 5892
  },
  {
    id: 21,
    title: 'AI-Реферат',
    description: 'Готовый реферат по любой теме за 10 минут',
    category: 'Обучение',
    icon: 'BookOpen',
    gradient: 'from-blue-500 to-indigo-500',
    'AI-токенBasic': 30,
    'AI-токенPro': 90,
    'AI-токенUltimate': 180,
    features: ['1 реферат до 10 стр', '3 реферата до 20 стр', 'Безлимит + антиплагиат'],
    uses: 8921
  },
  {
    id: 22,
    title: 'Генератор Сочинений',
    description: 'Уникальное сочинение с литературным анализом',
    category: 'Обучение',
    icon: 'PenTool',
    gradient: 'from-purple-500 to-violet-500',
    'AI-токенBasic': 25,
    'AI-токенPro': 75,
    'AI-токенUltimate': 150,
    features: ['1 сочинение', '5 сочинений + правки', 'Безлимит + экспертиза'],
    uses: 12456
  },
  {
    id: 23,
    title: 'AI-Эссе',
    description: 'Аргументированное эссе на любую тему',
    category: 'Обучение',
    icon: 'FileEdit',
    gradient: 'from-teal-500 to-green-500',
    'AI-токенBasic': 20,
    'AI-токенPro': 60,
    'AI-токенUltimate': 120,
    features: ['1 эссе до 5 стр', '3 эссе до 10 стр', 'Безлимит + редактура'],
    uses: 9834
  },
  {
    id: 24,
    title: 'Курсовая Работа AI',
    description: 'Полноценная курсовая с исследованием',
    category: 'Обучение',
    icon: 'GraduationCap',
    gradient: 'from-orange-500 to-red-500',
    'AI-токенBasic': 80,
    'AI-токенPro': 240,
    'AI-токенUltimate': 480,
    features: ['1 курсовая до 30 стр', '2 курсовые + правки', 'Безлимит + защита'],
    uses: 4567
  },
  {
    id: 25,
    title: 'Диплом Помощник',
    description: 'Структура и главы дипломной работы',
    category: 'Обучение',
    icon: 'Award',
    gradient: 'from-pink-500 to-rose-500',
    'AI-токенBasic': 120,
    'AI-токенPro': 360,
    'AI-токенUltimate': 720,
    features: ['Введение + план', '3 главы + список лит.', 'Полный диплом + защита'],
    uses: 2341
  },
  {
    id: 26,
    title: 'Лабораторная Работа AI',
    description: 'Отчёт по лабораторной с расчётами',
    category: 'Обучение',
    icon: 'FlaskConical',
    gradient: 'from-cyan-500 to-blue-500',
    'AI-токенBasic': 15,
    'AI-токенPro': 45,
    'AI-токенUltimate': 90,
    features: ['1 лабораторная', '5 лабораторных', 'Безлимит + проверка'],
    uses: 7234
  },
  {
    id: 27,
    title: 'Конспект Лекций',
    description: 'Структурированный конспект из любого текста',
    category: 'Обучение',
    icon: 'NotebookPen',
    gradient: 'from-emerald-500 to-teal-500',
    'AI-токенBasic': 10,
    'AI-токенPro': 30,
    'AI-токенUltimate': 60,
    features: ['10 страниц', '50 страниц', 'Безлимит + mind-карты'],
    uses: 15678
  },
  {
    id: 28,
    title: 'Решатель Задач',
    description: 'Пошаговое решение математических задач',
    category: 'Обучение',
    icon: 'Calculator',
    gradient: 'from-violet-500 to-purple-500',
    'AI-токенBasic': 8,
    'AI-токенPro': 24,
    'AI-токенUltimate': 48,
    features: ['10 задач', '50 задач', 'Безлимит + объяснения'],
    uses: 23456
  }
];

const categories = ['Все', 'Контент', 'Бизнес', 'Творчество', 'Маркетинг', 'Развлечения', 'Карьера', 'Брендинг', 'Аудио', 'Утилиты', 'Здоровье', 'Разработка', 'Обучение'];

export default function Index() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'ultimate'>('basic');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const filteredServices = services.filter(service => 
    selectedCategory === 'Все' || service.category === selectedCategory
  );

  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  const handlePayment = async () => {
    if (!selectedService) {
      toast({ title: 'Ошибка', description: 'Выберите сервис', variant: 'destructive' });
      return;
    }

    const user = localStorage.getItem('user');
    if (!user) {
      toast({ title: 'Войдите в систему', description: 'Необходима авторизация' });
      navigate('/login');
      return;
    }

    const aiTokenNeeded = selectedPlan === 'basic' ? selectedService['AI-токенBasic'] : 
                         selectedPlan === 'pro' ? selectedService['AI-токенPro'] : 
                         selectedService['AI-токенUltimate'];

    navigate(`/ai-chat?service=${selectedService.id}&name=${encodeURIComponent(selectedService.title)}&tokens=${aiTokenNeeded}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
      
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-end gap-3 mb-4">
            {isLoggedIn ? (
              <>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  <Icon name="User" size={20} className="mr-2" />
                  Личный кабинет
                </Button>
                <Button onClick={() => {
                  localStorage.removeItem('user');
                  setIsLoggedIn(false);
                }} variant="outline">
                  <Icon name="LogOut" size={20} className="mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} variant="outline">
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </Button>
            )}
          </div>

          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Icon name="Zap" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">100 AI-сервисов работают прямо сейчас</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CREATIVE AI HUB
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              100 автоматизированных AI-сервисов для твоего бизнеса
            </p>
            <p className="text-lg text-muted-foreground/80 mb-8">
              Выбирай сервис. Оплачивай. Пользуйся за секунды. 🚀
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={16} className="text-secondary" />
                <span><strong className="text-foreground">234,589</strong> пользователей</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={16} className="text-accent" />
                <span><strong className="text-foreground">1.2M+</strong> генераций</span>
              </div>
            </div>
          </div>

          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Icon name="Filter" size={16} />
              Категории сервисов
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                    selectedCategory === cat 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => (
              <Card
                key={service.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 border-border/50 bg-card/50 backdrop-blur animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
                onClick={() => {
                  const user = localStorage.getItem('user');
                  if (!user) {
                    toast({ title: 'Войдите в систему', description: 'Необходима авторизация' });
                    navigate('/login');
                    return;
                  }
                  
                  const tokensBasic = service['AI-токенBasic'] || 5;
                  navigate(`/ai-chat?service=${service.id}&name=${encodeURIComponent(service.title)}&tokens=${tokensBasic}`);
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} shadow-lg`}>
                      <Icon name={service.icon as any} size={24} className="text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-secondary/20 text-xs">
                      {formatNumber(service.uses)} юзеров
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">От</span>
                      <div className="text-2xl font-bold text-accent">
                        {service['AI-токенBasic']} {service['AI-токенBasic'] === 1 ? 'AI-токен' : service['AI-токенBasic'] < 5 ? 'AI-токена' : 'AI-токенов'}
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                      Попробовать
                      <Icon name="ArrowRight" size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-20">
              <Icon name="Search" size={64} className="mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-xl text-muted-foreground">
                Сервисы не найдены. Попробуйте другую категорию
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur">
          {selectedService && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedService.gradient} shadow-xl`}>
                    <Icon name={selectedService.icon as any} size={32} className="text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl mb-2">{selectedService.title}</DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedService.description}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{selectedService.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        <Icon name="Users" size={14} className="inline mr-1" />
                        {formatNumber(selectedService.uses)} пользователей
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="CreditCard" size={20} className="text-primary" />
                    Выбери тариф
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPlan === 'basic' 
                          ? 'border-primary bg-primary/5 shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPlan('basic')}
                    >
                      <div className="text-sm text-muted-foreground mb-1">Базовый</div>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {selectedService['AI-токенBasic']} {selectedService['AI-токенBasic'] === 1 ? 'AI-токен' : selectedService['AI-токенBasic'] < 5 ? 'AI-токена' : 'AI-токенов'}
                      </div>
                      <div className="text-sm text-muted-foreground">{selectedService.features[0]}</div>
                    </div>
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                        selectedPlan === 'pro' 
                          ? 'border-secondary bg-secondary/5 shadow-lg' 
                          : 'border-border hover:border-secondary/50'
                      }`}
                      onClick={() => setSelectedPlan('pro')}
                    >
                      <Badge className="absolute -top-2 right-2 bg-secondary text-secondary-foreground">Популярный</Badge>
                      <div className="text-sm text-muted-foreground mb-1">Профи</div>
                      <div className="text-2xl font-bold text-secondary mb-2">
                        {selectedService['AI-токенPro']} {selectedService['AI-токенPro'] === 1 ? 'AI-токен' : selectedService['AI-токенPro'] < 5 ? 'AI-токена' : 'AI-токенов'}
                      </div>
                      <div className="text-sm text-muted-foreground">{selectedService.features[1]}</div>
                    </div>
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPlan === 'ultimate' 
                          ? 'border-accent bg-accent/5 shadow-lg' 
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => setSelectedPlan('ultimate')}
                    >
                      <div className="text-sm text-muted-foreground mb-1">Ультимат</div>
                      <div className="text-2xl font-bold text-accent mb-2">
                        {selectedService['AI-токенUltimate']} {selectedService['AI-токенUltimate'] === 1 ? 'AI-токен' : selectedService['AI-токенUltimate'] < 5 ? 'AI-токена' : 'AI-токенов'}
                      </div>
                      <div className="text-sm text-muted-foreground">{selectedService.features[2]}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="Play" size={20} className="text-secondary" />
                    Попробуй прямо сейчас
                  </h3>
                  <Textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Введи свой запрос здесь..."
                    className="mb-4 min-h-[120px]"
                  />
                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing || !userInput.trim()}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-lg py-6"
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Icon name="Coins" size={20} className="mr-2 text-yellow-300" />
                        Создать за {selectedPlan === 'basic' ? selectedService['AI-токенBasic'] : selectedPlan === 'pro' ? selectedService['AI-токенPro'] : selectedService['AI-токенUltimate']} {(() => {
                          const aiToken = selectedPlan === 'basic' ? selectedService['AI-токенBasic'] : selectedPlan === 'pro' ? selectedService['AI-токенPro'] : selectedService['AI-токенUltimate'];
                          return aiToken === 1 ? 'AI-токен' : aiToken < 5 ? 'AI-токена' : 'AI-токенов';
                        })()}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    💰 1 AI-токен = 50₽ | Купить AI-токены в личном кабинете
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Icon name="Shield" size={16} className="text-primary" />
                    <span>100% безопасно</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Zap" size={16} className="text-secondary" />
                    <span>Мгновенный результат</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="RefreshCw" size={16} className="text-accent" />
                    <span>Возврат 14 дней</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}