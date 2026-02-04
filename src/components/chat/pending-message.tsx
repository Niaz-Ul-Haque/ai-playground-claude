'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageStatus, MessageMetadata } from '@/types/chat';
import { streamingStatusDisplay } from '@/types/chat';

interface PendingMessageContentProps {
  status: MessageStatus;
  metadata?: MessageMetadata;
}

export function PendingMessageContent({ status, metadata }: PendingMessageContentProps) {
  const streamingStatus = metadata?.streamingStatus;
  const streamingProgress = metadata?.streamingProgress ?? 0;
  const statusHistory = metadata?.statusHistory ?? [];

  // Determine the display text from real streaming status or fallback to metadata.step
  const displayStep = streamingStatus
    ? streamingStatusDisplay[streamingStatus]
    : metadata?.step || 'Connecting...';

  // Build the steps to display: completed ones from history + current active
  const completedStatuses = new Set(statusHistory.map(h => h.status));
  const currentStatus = streamingStatus;

  return (
    <div className="flex gap-3 p-4">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3">
        {/* Name */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ciri</span>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            is working...
          </span>
        </div>

        {/* Status Timeline */}
        {status === 'pending' && statusHistory.length > 0 && (
          <div className="space-y-1">
            {statusHistory.map((entry, index) => {
              const isCurrentStep = entry.status === currentStatus;
              const isCompleted = !isCurrentStep && completedStatuses.has(entry.status);

              return (
                <div
                  key={entry.status}
                  className={cn(
                    'flex items-center gap-2 text-xs transition-all duration-300',
                    isCurrentStep
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {isCurrentStep ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span>{entry.message}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback when no history yet */}
        {status === 'pending' && statusHistory.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
            <span>{displayStep}</span>
          </div>
        )}

        {/* Progress Bar */}
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
      </div>
    </div>
  );
}
