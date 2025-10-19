import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ChatHistoryItem {
  id: number;
  chat_id: string;
  chat_title: string;
  service_name: string;
  updated_at: string;
}

interface ChatSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  chatHistory: ChatHistoryItem[];
  currentChatId: string;
  startNewChat: () => void;
  loadChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

export default function ChatSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  chatHistory,
  currentChatId,
  startNewChat,
  loadChat,
  deleteChat
}: ChatSidebarProps) {
  return (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-border bg-card flex flex-col fixed left-0 top-0 h-screen z-40`}>
      <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
        <h2 className="font-bold">История чатов</h2>
        <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(false)}>
          <Icon name="X" size={18} />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-2 shrink-0">
        <Button onClick={startNewChat} className="w-full mb-3" size="sm">
          <Icon name="Plus" size={16} className="mr-2" />
          Новый чат
        </Button>
        {chatHistory.map((chat) => (
          <div key={chat.id} className="mb-2 group relative">
            <Button
              variant={currentChatId === chat.chat_id ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left truncate pr-8"
              size="sm"
              onClick={() => loadChat(chat.chat_id)}
            >
              <div className="flex-1 truncate">
                <div className="text-xs text-muted-foreground">{chat.service_name}</div>
                <div className="truncate">{chat.chat_title}</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteChat(chat.chat_id)}
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
