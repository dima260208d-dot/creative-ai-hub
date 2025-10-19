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
        <div className="flex flex-col items-center justify-center h-full px-4 py-20">
          <div className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Sparkles" size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Привет, я Juno.</h2>
          <p className="text-sm text-muted-foreground text-center">Чем могу помочь вам сегодня?</p>
        </div>
      )}

      {messages.map((msg, idx) => (
        <div key={idx} className={`flex px-2 sm:px-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[90%] sm:max-w-[80%] space-y-3 ${msg.role === 'assistant' ? 'flex items-start gap-3' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="relative w-8 h-8 shrink-0">
                <div className="bat"></div>
              </div>
            )}
            <div className="flex-1 space-y-3">
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
        </div>
      ))}

      {isThinking && streamingThinking && (
        <div className="flex justify-start px-2 sm:px-0">
          <div className="max-w-[90%] sm:max-w-[80%] flex items-start gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <div className="bat"></div>
            </div>
            <div className="flex-1 space-y-3">
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
        </div>
      )}

      {isStreaming && streamingAnswer && (
        <div className="flex justify-start px-2 sm:px-0">
          <div className="max-w-[90%] sm:max-w-[80%] flex items-start gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <div className="bat"></div>
            </div>
            <div className="flex-1 space-y-3">
              <Card className="p-3 sm:p-4">
                <p className="whitespace-pre-wrap text-sm sm:text-base">
                  {streamingAnswer}<span className="animate-pulse">▋</span>
                </p>
              </Card>
            </div>
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