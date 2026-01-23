'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import type { Message } from '@/types/chat';
import { formatRelativeDate } from '@/lib/utils/format';
import { parseMessageContent } from '@/lib/ai/parse-content';
import { CardRenderer } from './card-renderer';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const segments = message.content ? parseMessageContent(message.content) : [];

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 space-y-2 min-w-0', isUser ? 'items-end' : 'items-start')}>
        <div className={cn('flex items-center gap-2', isUser && 'flex-row-reverse')}>
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'Ciri'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(message.timestamp)}
          </span>
        </div>

        <div className={cn('space-y-2', isUser && 'flex flex-col items-end')}>
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              return (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm whitespace-pre-wrap max-w-[85%]',
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {segment.content}
                </div>
              );
            }

            if (segment.type === 'card') {
              return (
                <div key={index} className="w-full max-w-2xl">
                  <CardRenderer card={segment.card} />
                </div>
              );
            }

            return null;
          })}

          {/* Fallback for messages with explicit cards array */}
          {message.cards && message.cards.length > 0 && segments.every(s => s.type === 'text') && (
            <>
              {message.cards.map((card, index) => (
                <div key={`card-${index}`} className="w-full max-w-2xl">
                  <CardRenderer card={card} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
