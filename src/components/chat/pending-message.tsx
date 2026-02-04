'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageStatus, MessageMetadata } from '@/types/chat';

interface PendingMessageContentProps {
  status: MessageStatus;
  metadata?: MessageMetadata;
}

export function PendingMessageContent({ status, metadata }: PendingMessageContentProps) {
  const [isOpen, setIsOpen] = useState(status === 'pending');
  const [progressStep, setProgressStep] = useState('Gathering context…');

  // Auto-close Details when status becomes 'complete' or 'typing'
  useEffect(() => {
    if (status === 'typing' || status === 'complete') {
      setIsOpen(false);
    }
  }, [status]);

  // Timed heuristic for progress steps (only when status is 'pending')
  useEffect(() => {
    if (status !== 'pending') return;

    const timer1 = setTimeout(() => {
      setProgressStep('Preparing response…');
    }, 1000);

    const timer2 = setTimeout(() => {
      setProgressStep('Still working…');
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [status]);

  const getStatusText = () => {
    if (status === 'pending') return 'is thinking…';
    if (status === 'typing') return 'is typing…';
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

        {/* Thinking Animation */}
        {status === 'pending' && (
          <div className="inline-flex items-center gap-1 px-4 py-3 bg-muted rounded-lg">
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
          </div>
        )}

        {/* Expandable Details Section */}
        {(status === 'pending' || status === 'typing') && (
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
                {status === 'pending' && (
                  <>
                    <div>• {metadata?.step || progressStep}</div>
                    {metadata?.details && <div className="pl-3">{metadata.details}</div>}
                  </>
                )}
                {status === 'typing' && (
                  <div>• Rendering response…</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
