import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  user: any;
  userTokens: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function ChatHeader({ user, userTokens, isSidebarOpen, setIsSidebarOpen }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b border-border bg-card px-4 py-3 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        {user && !isSidebarOpen && (
          <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(true)}>
            <Icon name="Menu" size={20} />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Juno AI</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <Button variant="outline" size="sm" onClick={() => navigate('/credits')}>
            <Icon name="Zap" size={16} className="mr-1" />
            {userTokens} токенов
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
          <Icon name="User" size={16} className="mr-1" />
          {user ? user.name : 'Профиль'}
        </Button>
      </div>
    </div>
  );
}
