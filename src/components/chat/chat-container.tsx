'use client';

import { useChatContext } from '@/context/chat-context';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function ChatContainer() {
  const { messages, isLoading, sendMessage, handleResetChat } = useChatContext();

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Ciri</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered assistant for financial advisors
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetChat}
              aria-label="Start new chat"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </header>

      <MessageList
        messages={messages}
        isLoading={isLoading}
        onPromptClick={handlePromptClick}
      />

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
