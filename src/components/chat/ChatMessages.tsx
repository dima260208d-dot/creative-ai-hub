import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isThinking: boolean;
  streamingThinking: string;
  isStreaming: boolean;
  streamingAnswer: string;
  isLoading: boolean;
  isSearching: boolean;
  deepThinkMode: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessages({
  messages,
  isThinking,
  streamingThinking,
  isStreaming,
  streamingAnswer,
  isLoading,
  isSearching,
  deepThinkMode,
  messagesEndRef
}: ChatMessagesProps) {
  return (
    <>
      {messages.length === 0 && (
        <Card className="p-6 sm:p-8 text-center mx-2 sm:mx-0">
          <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Привет! Я Juno ⚡</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Выбери сервис и задай вопрос!</p>
        </Card>
      )}

      {messages.map((msg, idx) => (
        <div key={idx} className={`flex px-2 sm:px-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[90%] sm:max-w-[80%] space-y-3`}>
            {msg.thinking && (
              <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300/50 dark:border-purple-700/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                    <Icon name="Brain" size={18} />
                    <span>Процесс размышления</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{msg.thinking}</p>
                </div>
              </Card>
            )}
            <Card className={`p-3 sm:p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
              <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
            </Card>
          </div>
        </div>
      ))}

      {isThinking && streamingThinking && (
        <div className="flex justify-start">
          <div className="max-w-[80%] space-y-3">
            <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300/50 dark:border-purple-700/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  <Icon name="Brain" size={18} className="animate-pulse" />
                  <span>Процесс размышления</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {streamingThinking}<span className="animate-pulse">▋</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {isStreaming && streamingAnswer && (
        <div className="flex justify-start">
          <div className="max-w-[80%] space-y-3">
            <Card className="p-4">
              <p className="whitespace-pre-wrap">
                {streamingAnswer}<span className="animate-pulse">▋</span>
              </p>
            </Card>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="flex justify-start px-2 sm:px-0">
          <div className="max-w-[90%] sm:max-w-[80%] space-y-2">
            <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-300/50 dark:border-blue-700/50">
              <div className="flex items-center gap-2">
                <Icon name="Globe" size={20} className="animate-pulse text-blue-600 dark:text-blue-400" />
                <span className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300">🌐 Поиск в сети...</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {isLoading && !isThinking && !isStreaming && !isSearching && (
        <div className="flex justify-start px-2 sm:px-0">
          <div className="max-w-[90%] sm:max-w-[80%] space-y-2">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Icon name="Loader2" size={20} className="animate-spin" />
                <span className="text-sm sm:text-base">{deepThinkMode ? 'Креативно размышляю...' : 'Думаю...'}</span>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </>
  );
}