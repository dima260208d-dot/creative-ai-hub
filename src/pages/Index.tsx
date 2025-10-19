import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { useChatLogic } from '@/hooks/useChatLogic';

const services = [
  { id: 0, name: '💬 Обычный чат', tokens: 1 },
  { id: 29, name: '🧠 AI Психолог', tokens: 3 },
  { id: 30, name: '🚀 AI Продвинутый чат', tokens: 2 },
  { id: 1, name: '✍️ Биография', tokens: 2 },
  { id: 2, name: '🔮 Гадание', tokens: 2 },
  { id: 3, name: '💡 Бизнес-идеи', tokens: 2 },
  { id: 4, name: '📄 Резюме', tokens: 2 },
  { id: 5, name: '🏷️ Нейминг', tokens: 2 },
  { id: 6, name: '📱 SMM-посты', tokens: 2 },
  { id: 7, name: '🎨 Промпт для изображения', tokens: 2 },
  { id: 8, name: '📧 Email-письмо', tokens: 2 },
  { id: 9, name: '🎬 Видео-скрипт', tokens: 2 },
  { id: 10, name: '🤖 База знаний чат-бота', tokens: 3 },
  { id: 11, name: '🎯 Концепция логотипа', tokens: 2 },
  { id: 13, name: '⚖️ Юридический договор', tokens: 3 },
  { id: 14, name: '😂 Идеи мемов', tokens: 2 },
  { id: 15, name: '📊 Структура презентации', tokens: 2 },
  { id: 16, name: '📝 SEO-статья', tokens: 3 },
  { id: 17, name: '🌍 Перевод текста', tokens: 2 },
  { id: 18, name: '🍳 Рецепты', tokens: 2 },
  { id: 19, name: '💪 План тренировок', tokens: 2 },
  { id: 20, name: '🧪 Тест-кейсы', tokens: 2 },
  { id: 21, name: '📚 Реферат', tokens: 3 },
  { id: 22, name: '📖 Сочинение', tokens: 3 },
  { id: 23, name: '✏️ Эссе', tokens: 3 },
  { id: 24, name: '🎓 Курсовая работа', tokens: 4 },
  { id: 25, name: '🎯 Дипломная работа', tokens: 5 },
  { id: 26, name: '🔬 Отчёт по лабораторной', tokens: 2 },
  { id: 27, name: '📋 Конспект лекции', tokens: 2 },
  { id: 28, name: '🔢 Решение задачи', tokens: 2 }
];

export default function Index() {
  const {
    message,
    setMessage,
    isLoading,
    messages,
    selectedService,
    setSelectedService,
    userTokens,
    user,
    chatHistory,
    currentChatId,
    isSidebarOpen,
    setIsSidebarOpen,
    deepThinkMode,
    setDeepThinkMode,
    attachedFiles,
    streamingThinking,
    isThinking,
    streamingAnswer,
    isStreaming,
    isSearching,
    chatTitle,
    fileInputRef,
    messagesEndRef,
    loadChat,
    startNewChat,
    deleteChat,
    handleFileUpload,
    removeFile,
    handleSend
  } = useChatLogic(services);

  return (
    <div className="min-h-screen bg-background flex">
      {user && (
        <ChatSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          startNewChat={startNewChat}
          loadChat={loadChat}
          deleteChat={deleteChat}
        />
      )}

      <div className={`flex-1 flex flex-col ${user && isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
        <ChatHeader
          user={user}
          userTokens={userTokens}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedService={services.find(s => s.id === selectedService)}
          setSelectedService={(service) => setSelectedService(service.id)}
          services={services}
          chatTitle={chatTitle}
          deepThinkMode={deepThinkMode}
        />

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-4xl space-y-4">
            <ChatMessages
              messages={messages}
              isThinking={isThinking}
              streamingThinking={streamingThinking}
              isStreaming={isStreaming}
              streamingAnswer={streamingAnswer}
              isLoading={isLoading}
              isSearching={isSearching}
              deepThinkMode={deepThinkMode}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>

        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
          isLoading={isLoading}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          services={services}
          deepThinkMode={deepThinkMode}
          setDeepThinkMode={setDeepThinkMode}
          attachedFiles={attachedFiles}
          removeFile={removeFile}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
}