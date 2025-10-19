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
    <div className="border-b border-border bg-card px-3 py-3 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        {user && (
          <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden">
            <Icon name="Menu" size={20} />
          </Button>
        )}
        <h1 className="text-base font-semibold">Новый чат</h1>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/credits')} className="p-2">
            <Icon name="Sparkles" size={18} />
          </Button>
        )}
      </div>
    </div>
  );}
}