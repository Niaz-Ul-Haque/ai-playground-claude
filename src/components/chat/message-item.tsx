'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import type { Message, Card } from '@/types/chat';
import { formatRelativeDate } from '@/lib/utils/format';
import { parseMessageContent } from '@/lib/ai/parse-content';
import { CardRenderer } from './card-renderer';
import { PendingMessageContent } from './pending-message';
import { cn } from '@/lib/utils';

/**
 * Converts markdown-style bold text (**text**) to JSX with proper formatting
 */
function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the bold part
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface MessageItemProps {
  message: Message;
}

/**
 * Determines if the text content appears to be a redundant description 
 * of what's already shown in the cards. This helps avoid duplicate information
 * when the AI returns both a detailed text description and structured cards.
 */
function isRedundantTextContent(text: string, cards: Card[]): boolean {
  if (!cards || cards.length === 0) return false;
  
  // If text is short (less than 100 chars), it's likely an intro, keep it
  if (text.length < 100) return false;
  
  const textLower = text.toLowerCase();
  
  // Check for patterns that indicate the text is describing card content
  const cardTypes = cards.map(c => c.type);
  
  // Task-related redundancy detection
  if (cardTypes.includes('task-list') || cardTypes.includes('task')) {
    const taskPatterns = [
      /\*\*high priority/i,
      /\*\*medium priority/i,
      /\*\*low priority/i,
      /here('s| is) your (priority )?breakdown/i,
      /you have \d+ tasks?/i,
      /tasks? scheduled/i,
      /- client meeting/i,
      /- review ai draft/i,
      /- compliance check/i,
      /- email follow-up/i,
      /- renewal review/i,
      /ai-completed tasks? ready/i,
      /documents? (are )?ready for (your )?approval/i,
    ];
    
    const matchCount = taskPatterns.filter(pattern => pattern.test(text)).length;
    // If multiple patterns match, the text is likely describing the task list
    if (matchCount >= 2) return true;
  }
  
  // Client-related redundancy detection
  if (cardTypes.includes('client-list') || cardTypes.includes('client')) {
    const clientPatterns = [
      /here are (your |the )?clients?/i,
      /client details/i,
      /\d+ clients? found/i,
    ];
    
    if (clientPatterns.some(pattern => pattern.test(text))) return true;
  }
  
  // Policy-related redundancy detection
  if (cardTypes.includes('policy-list') || cardTypes.includes('policy')) {
    const policyPatterns = [
      /here are (your |the )?policies/i,
      /policy details/i,
      /\d+ policies? found/i,
    ];
    
    if (policyPatterns.some(pattern => pattern.test(text))) return true;
  }
  
  return false;
}

/**
 * Extracts a short introductory sentence from potentially redundant text.
 * Returns the first sentence if it's reasonably short.
 */
function extractIntroText(text: string): string | null {
  // Find the first sentence (ends with . ! or ?)
  const match = text.match(/^[^.!?]+[.!?]/);
  if (match && match[0].length < 150) {
    return match[0].trim();
  }
  
  // Or use the first line if it's short
  const firstLine = text.split('\n')[0];
  if (firstLine && firstLine.length < 150 && !firstLine.includes('**')) {
    return firstLine.trim();
  }
  
  return null;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  // Handle only 'pending' state with special UI - 'typing' and 'complete' render normally
  if (!isUser && message.status === 'pending') {
    return <PendingMessageContent status={message.status} metadata={message.metadata} />;
  }
  
  const segments = message.content ? parseMessageContent(message.content) : [];
  
  // Check if we have explicit cards from the API
  const hasExplicitCards = message.cards && message.cards.length > 0;
  const hasInlineCards = segments.some(s => s.type === 'card');

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
          {!isUser && message.status === 'typing' && (
            <span className="text-xs text-muted-foreground" aria-live="polite">
              is typing…
            </span>
          )}
          {!message.status || message.status === 'complete' ? (
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(message.timestamp)}
            </span>
          ) : null}
        </div>

        <div className={cn('space-y-2', isUser && 'flex flex-col items-end')}>
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              // Check if this text is redundant given the explicit cards
              if (hasExplicitCards && isRedundantTextContent(segment.content, message.cards!)) {
                // Try to extract just the intro
                const introText = extractIntroText(segment.content);
                if (introText) {
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
                      {parseMarkdown(introText)}
                    </div>
                  );
                }
                // If no good intro, skip this redundant text entirely
                return null;
              }
              
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
                  {parseMarkdown(segment.content)}
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

          {/* Render explicit cards from message.cards array */}
          {hasExplicitCards && !hasInlineCards && (
            <>
              {message.cards!.map((card, index) => (
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
