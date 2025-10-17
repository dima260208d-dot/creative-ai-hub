import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  complexity: number;
  investment: string;
  icon: string;
  howItWorks: string;
  monetization: string[];
  technologies: string[];
  launchPlan: string[];
  gradient: string;
}

const ideas: Idea[] = [
  {
    id: 1,
    title: 'AI-Биография',
    description: 'Генератор профессиональных автобиографий для работы, dating и соцсетей',
    category: 'AI-генеративные',
    complexity: 1,
    investment: 'До 100$',
    icon: 'User',
    gradient: 'from-purple-500 to-pink-500',
    howItWorks: 'Пользователь вводит ключевые факты о себе, AI генерирует профессиональную автобиографию с возможностью стилизации под разные цели',
    monetization: ['Базовый отчет: $4.99', 'Премиум с редактурами: $14.99', 'Пакет из 5 биографий: $19.99'],
    technologies: ['OpenAI GPT-4', 'Stripe платежи', 'Firebase'],
    launchPlan: ['День 1-3: Прототип', 'День 4-7: Интеграция AI API', 'День 8-10: Тестирование и запуск']
  },
  {
    id: 2,
    title: 'Нейро-Гадалка',
    description: 'AI анализирует данные и генерирует персонализированные предсказания',
    category: 'Развлечения',
    complexity: 2,
    investment: 'До 100$',
    icon: 'Sparkles',
    gradient: 'from-indigo-500 to-purple-500',
    howItWorks: 'AI анализирует введенные данные пользователя, генерирует персонализированные предсказания с ежедневными обновлениями гороскопов',
    monetization: ['Базовая гадание: $2.99', 'Подписка на ежедневные прогнозы: $9.99/мес', 'Расширенный расклад: $7.99'],
    technologies: ['GPT-4 + кастомные алгоритмы', 'Telegram bot', 'Cloudinary для карт Таро'],
    launchPlan: ['День 1-5: Разработка алгоритмов', 'День 6-8: UI/UX дизайн', 'День 9-10: Запуск MVP']
  },
  {
    id: 3,
    title: 'Генератор Бизнес-Идей',
    description: 'Персонализированные бизнес-идеи на основе навыков и бюджета',
    category: 'Бизнес',
    complexity: 2,
    investment: '100-500$',
    icon: 'Lightbulb',
    gradient: 'from-green-500 to-teal-500',
    howItWorks: 'Пользователь указывает навыки, бюджет, интересы. AI генерирует 10 персонализированных идей с детальным анализом',
    monetization: ['10 идей: $9.99', 'Детальный анализ 3 идей: $24.99', 'Пожизненный доступ: $149'],
    technologies: ['Fine-tuned GPT', 'A/B тестирование', 'Автоматический PDF'],
    launchPlan: ['День 1-7: Fine-tuning модели', 'День 8-12: Тестирование', 'День 13-15: Запуск']
  },
  {
    id: 4,
    title: 'AI-Резюме Конструктор',
    description: 'Создание профессиональных резюме с оптимизацией под ATS',
    category: 'Бизнес',
    complexity: 1,
    investment: 'До 100$',
    icon: 'FileText',
    gradient: 'from-blue-500 to-cyan-500',
    howItWorks: 'AI анализирует опыт работы и создает оптимизированное резюме с ключевыми словами для прохождения автоматических систем отбора',
    monetization: ['Базовое резюме: $5.99', 'Премиум + Cover Letter: $15.99', '3 индустрии: $24.99'],
    technologies: ['GPT-4 для генерации', 'PDF генератор', 'ATS оптимизатор'],
    launchPlan: ['День 1-4: Шаблоны резюме', 'День 5-7: AI интеграция', 'День 8-10: Запуск']
  },
  {
    id: 5,
    title: 'Генератор Названий',
    description: 'AI создает уникальные названия для бизнеса, продуктов и проектов',
    category: 'Творчество',
    complexity: 1,
    investment: 'До 100$',
    icon: 'Type',
    gradient: 'from-orange-500 to-red-500',
    howItWorks: 'Пользователь описывает свой бизнес, AI генерирует 50+ вариантов названий с проверкой доменов',
    monetization: ['20 названий: $3.99', '50 названий + домены: $9.99', 'Неограниченно: $29/мес'],
    technologies: ['GPT-4 генерация', 'Domain API проверка', 'Trademark search'],
    launchPlan: ['День 1-3: Алгоритм генерации', 'День 4-6: Интеграция API', 'День 7-10: Тестирование']
  },
  {
    id: 6,
    title: 'AI-Посты для Соцсетей',
    description: 'Автоматическая генерация контента для всех социальных платформ',
    category: 'AI-генеративные',
    complexity: 2,
    investment: '100-500$',
    icon: 'Share2',
    gradient: 'from-pink-500 to-rose-500',
    howItWorks: 'AI создает оптимизированный контент для Instagram, Facebook, LinkedIn с адаптацией под аудиторию каждой платформы',
    monetization: ['10 постов: $7.99', '50 постов/мес: $24.99', 'Агентский план: $99/мес'],
    technologies: ['Multi-platform AI', 'Image generation API', 'Scheduling система'],
    launchPlan: ['День 1-5: Multi-platform логика', 'День 6-10: UI панель', 'День 11-14: Запуск']
  },
  {
    id: 7,
    title: 'Нейро-Художник',
    description: 'Генерация уникальных изображений для коммерческого использования',
    category: 'Творчество',
    complexity: 2,
    investment: '100-500$',
    icon: 'Palette',
    gradient: 'from-violet-500 to-purple-500',
    howItWorks: 'Пользователь вводит описание, AI генерирует уникальные изображения с полными коммерческими правами',
    monetization: ['5 изображений: $9.99', '25 изображений: $39.99', 'Безлимит: $99/мес'],
    technologies: ['Midjourney API', 'DALL-E 3', 'Stable Diffusion'],
    launchPlan: ['День 1-5: API интеграция', 'День 6-8: Галерея', 'День 9-12: Запуск']
  },
  {
    id: 8,
    title: 'Email Копирайтер',
    description: 'AI пишет продающие email рассылки с высокой конверсией',
    category: 'Бизнес',
    complexity: 1,
    investment: 'До 100$',
    icon: 'Mail',
    gradient: 'from-cyan-500 to-blue-500',
    howItWorks: 'AI анализирует целевую аудиторию и создает персонализированные email с высоким open rate',
    monetization: ['5 писем: $6.99', '20 писем: $19.99', 'Агентский: $79/мес'],
    technologies: ['GPT-4 копирайтинг', 'A/B тестирование', 'Mailchimp интеграция'],
    launchPlan: ['День 1-4: Шаблоны писем', 'День 5-7: AI оптимизация', 'День 8-10: Запуск']
  },
  {
    id: 9,
    title: 'Видео Скрипт Генератор',
    description: 'Создание скриптов для YouTube, TikTok и Reels за минуты',
    category: 'Творчество',
    complexity: 2,
    investment: 'До 100$',
    icon: 'Video',
    gradient: 'from-red-500 to-orange-500',
    howItWorks: 'AI генерирует вирусные скрипты с хуками, сторителлингом и CTA для видео контента',
    monetization: ['3 скрипта: $4.99', '15 скриптов: $19.99', 'Unlimited: $49/мес'],
    technologies: ['GPT-4 сценарии', 'Viral pattern analysis', 'Trending topics API'],
    launchPlan: ['День 1-5: Алгоритм скриптов', 'День 6-8: Trending интеграция', 'День 9-12: Запуск']
  },
  {
    id: 10,
    title: 'AI-Чат Консультант',
    description: 'Умный чат-бот для автоматизации поддержки клиентов',
    category: 'AI-генеративные',
    complexity: 3,
    investment: '500$+',
    icon: 'MessageSquare',
    gradient: 'from-emerald-500 to-green-500',
    howItWorks: 'AI обучается на базе знаний компании и отвечает на вопросы клиентов 24/7',
    monetization: ['Starter: $29/мес', 'Business: $99/мес', 'Enterprise: $299/мес'],
    technologies: ['Custom GPT training', 'Multi-language', 'CRM интеграция'],
    launchPlan: ['День 1-7: Training pipeline', 'День 8-14: Multi-platform', 'День 15-20: Запуск']
  }
];

const categories = ['Все', 'AI-генеративные', 'Творчество', 'Бизнес', 'Развлечения'];
const complexityLevels = ['Все', 'Легко', 'Средне', 'Сложно'];
const investmentLevels = ['Все', 'До 100$', '100-500$', '500$+'];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedComplexity, setSelectedComplexity] = useState('Все');
  const [selectedInvestment, setSelectedInvestment] = useState('Все');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const filteredIdeas = ideas.filter(idea => {
    const categoryMatch = selectedCategory === 'Все' || idea.category === selectedCategory;
    const complexityMatch = selectedComplexity === 'Все' || 
      (selectedComplexity === 'Легко' && idea.complexity === 1) ||
      (selectedComplexity === 'Средне' && idea.complexity === 2) ||
      (selectedComplexity === 'Сложно' && idea.complexity === 3);
    const investmentMatch = selectedInvestment === 'Все' || idea.investment === selectedInvestment;
    
    return categoryMatch && complexityMatch && investmentMatch;
  });

  const getComplexityStars = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(3 - level);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
      
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Icon name="Sparkles" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">IdeaForge AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Создай свой пассивный доход
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              100 готовых бизнес-моделей на AI без сотрудников
            </p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
              Выбрать идею
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>
          </div>

          <div className="mb-12 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Icon name="Filter" size={16} />
                Категории
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

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon name="BarChart3" size={16} />
                  Сложность
                </h3>
                <div className="flex flex-wrap gap-2">
                  {complexityLevels.map(level => (
                    <Badge
                      key={level}
                      variant={selectedComplexity === level ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                        selectedComplexity === level 
                          ? 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30' 
                          : 'hover:border-secondary/50'
                      }`}
                      onClick={() => setSelectedComplexity(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Icon name="DollarSign" size={16} />
                  Инвестиции
                </h3>
                <div className="flex flex-wrap gap-2">
                  {investmentLevels.map(inv => (
                    <Badge
                      key={inv}
                      variant={selectedInvestment === inv ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                        selectedInvestment === inv 
                          ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30' 
                          : 'hover:border-accent/50'
                      }`}
                      onClick={() => setSelectedInvestment(inv)}
                    >
                      {inv}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea, index) => (
              <Card
                key={idea.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 border-border/50 bg-card/50 backdrop-blur animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
                onClick={() => setSelectedIdea(idea)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${idea.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${idea.gradient} shadow-lg`}>
                      <Icon name={idea.icon as any} size={24} className="text-white" />
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: idea.complexity }).map((_, i) => (
                        <Icon key={i} name="Star" size={14} className="text-accent fill-accent" />
                      ))}
                      {Array.from({ length: 3 - idea.complexity }).map((_, i) => (
                        <Icon key={i} name="Star" size={14} className="text-muted-foreground/30" />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {idea.description}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary" className="bg-secondary/20">
                      {idea.category}
                    </Badge>
                    <span className="text-accent font-semibold">{idea.investment}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="w-full text-primary">
                      Подробнее
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredIdeas.length === 0 && (
            <div className="text-center py-20">
              <Icon name="Search" size={64} className="mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-xl text-muted-foreground">
                Идеи не найдены. Попробуйте изменить фильтры
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur">
          {selectedIdea && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedIdea.gradient} shadow-xl`}>
                    <Icon name={selectedIdea.icon as any} size={32} className="text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl mb-2">{selectedIdea.title}</DialogTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {getComplexityStars(selectedIdea.complexity)}
                      </span>
                      <Badge variant="secondary">{selectedIdea.investment}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Target" size={20} className="text-primary" />
                    Как работает
                  </h3>
                  <p className="text-muted-foreground">{selectedIdea.howItWorks}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Icon name="DollarSign" size={20} className="text-secondary" />
                    Монетизация
                  </h3>
                  <ul className="space-y-2">
                    {selectedIdea.monetization.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="CheckCircle2" size={16} className="text-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Code" size={20} className="text-accent" />
                    Технологии
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.technologies.map((tech, i) => (
                      <Badge key={i} variant="outline" className="border-accent/30">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Calendar" size={20} className="text-primary" />
                    План запуска
                  </h3>
                  <ul className="space-y-2">
                    {selectedIdea.launchPlan.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                          {i + 1}
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                    <Icon name="Rocket" size={18} className="mr-2" />
                    Запустить проект
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Icon name="Download" size={18} className="mr-2" />
                    Скачать PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
