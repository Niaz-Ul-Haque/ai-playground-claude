'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@/types/chat';
import { MessageItem } from './message-item';
import { TypingIndicator } from './typing-indicator';
import { WelcomeMessage } from './welcome-message';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onPromptClick: (prompt: string) => void;
}

export function MessageList({ messages, isLoading, onPromptClick }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <WelcomeMessage onPromptClick={onPromptClick} />;
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div ref={scrollRef} className="min-h-full">
        <div className="max-w-4xl mx-auto py-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  );
}
