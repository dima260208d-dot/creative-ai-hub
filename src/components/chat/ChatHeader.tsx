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
    <div className="border-b border-border bg-card px-2 sm:px-4 py-3 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {user && !isSidebarOpen && (
          <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(true)} className="p-2">
            <Icon name="Menu" size={20} />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={20} className="text-primary sm:w-6 sm:h-6" />
          <h1 className="text-lg sm:text-xl font-bold">Juno AI</h1>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        {user && (
          <Button variant="outline" size="sm" onClick={() => navigate('/credits')} className="text-xs sm:text-sm px-2 sm:px-3">
            <Icon name="Zap" size={14} className="sm:mr-1" />
            <span className="hidden sm:inline">{userTokens}</span>
            <span className="sm:hidden">{userTokens}</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="text-xs sm:text-sm px-2 sm:px-3">
          <Icon name="User" size={14} className="sm:mr-1" />
          <span className="hidden sm:inline">{user ? user.name : 'Профиль'}</span>
        </Button>
      </div>
    </div>
  );
}