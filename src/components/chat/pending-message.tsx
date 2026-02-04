'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageStatus, MessageMetadata, StreamingStatus } from '@/types/chat';
import { streamingStatusDisplay } from '@/types/chat';

interface PendingMessageContentProps {
  status: MessageStatus;
  metadata?: MessageMetadata;
}

export function PendingMessageContent({ status, metadata }: PendingMessageContentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const streamingStatus = metadata?.streamingStatus;
  const streamingProgress = metadata?.streamingProgress ?? 0;

  // Auto-close Details when status becomes 'complete' or 'typing'
  useEffect(() => {
    if (status === 'typing' || status === 'complete') {
      setIsOpen(false);
    }
  }, [status]);

  // Determine the display text from real streaming status or fallback to metadata.step
  const displayStep = streamingStatus
    ? streamingStatusDisplay[streamingStatus]
    : metadata?.step || 'Gathering context...';

  const getStatusText = () => {
    if (status === 'pending') return 'is thinking...';
    if (status === 'typing') return 'is typing...';
    return null;
  };

  const statusText = getStatusText();
  const showStatus = status === 'pending' || status === 'typing';

  return (
    <div className="flex gap-3 p-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        {/* Name and Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ciri</span>
          {showStatus && (
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {statusText}
            </span>
          )}
        </div>

        {/* Progress Step - Real streaming status or fallback */}
        {status === 'pending' && (
          <div className="text-xs text-muted-foreground">
            {displayStep}
          </div>
        )}

        {/* Progress Bar - Only shown when we have real streaming progress */}
        {status === 'pending' && streamingProgress > 0 && (
          <div className="max-w-xs">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${streamingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Thinking Animation */}
        {status === 'pending' && (
          <div className="inline-flex items-center gap-1 px-4 py-3 bg-muted rounded-lg">
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
          </div>
        )}

        {/* Expandable Details Section */}
        {(status === 'pending' || status === 'typing') && metadata?.details && (
          <div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
              Details
            </button>
            {isOpen && (
              <div className="mt-2 text-xs text-muted-foreground space-y-1 px-2 py-1">
                <div className="pl-3">{metadata.details}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
