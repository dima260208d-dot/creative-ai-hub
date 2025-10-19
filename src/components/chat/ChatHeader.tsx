import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  user: any;
  userTokens: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedService?: { id: number; name: string; tokens: number };
  setSelectedService?: (service: { id: number; name: string; tokens: number }) => void;
  services?: Array<{ id: number; name: string; tokens: number }>;
}

export default function ChatHeader({ user, userTokens, isSidebarOpen, setIsSidebarOpen, selectedService, setSelectedService, services = [] }: ChatHeaderProps) {
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
          <>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="Coins" size={16} className="text-yellow-500" />
              <span className="font-medium">{userTokens}</span>
            </div>
            {services.length > 0 && setSelectedService && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Icon name="Sparkles" size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-auto">
                  {services.map((service) => (
                    <DropdownMenuItem
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={selectedService?.id === service.id ? 'font-semibold' : ''}>
                          {service.name}
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          {service.tokens} 🪙
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>
    </div>
  );
}