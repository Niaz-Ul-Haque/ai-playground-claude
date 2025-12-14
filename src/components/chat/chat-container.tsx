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
    <div className="flex flex-col h-full">
      {/* Page header with context info */}
      {messages.length > 0 && (
        <div className="border-b bg-background/50 px-4 py-2 shrink-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? 's' : ''} in this conversation
          </div>
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
        </div>
      )}

      <MessageList
        messages={messages}
        isLoading={isLoading}
        onPromptClick={handlePromptClick}
      />

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
