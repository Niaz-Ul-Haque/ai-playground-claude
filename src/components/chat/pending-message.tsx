'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageStatus, MessageMetadata } from '@/types/chat';
import { streamingStatusDisplay } from '@/types/chat';

interface PendingMessageContentProps {
  status: MessageStatus;
  metadata?: MessageMetadata;
}

const REVEAL_INTERVAL_MS = 3000;

export function PendingMessageContent({ status, metadata }: PendingMessageContentProps) {
  const streamingStatus = metadata?.streamingStatus;
  const statusHistory = metadata?.statusHistory ?? [];

  const [visibleCount, setVisibleCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show the first step immediately when history starts populating
  useEffect(() => {
    if (statusHistory.length > 0 && visibleCount === 0) {
      setVisibleCount(1);
    }
  }, [statusHistory.length, visibleCount]);

  // Progressively reveal queued steps every 3 seconds
  useEffect(() => {
    if (status !== 'pending') return;
    if (visibleCount === 0) return;
    if (visibleCount >= statusHistory.length) return;

    timerRef.current = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, REVEAL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, visibleCount, statusHistory.length]);

  // Reset when starting a fresh message
  useEffect(() => {
    if (statusHistory.length === 0) {
      setVisibleCount(0);
    }
  }, [statusHistory.length]);

  const displayStep = streamingStatus
    ? streamingStatusDisplay[streamingStatus]
    : metadata?.step || 'Connecting...';

  const visibleSteps = statusHistory.slice(0, visibleCount);

  // Use the last visible step's progress for the bar (not the real backend progress)
  const displayProgress =
    visibleSteps.length > 0
      ? visibleSteps[visibleSteps.length - 1].progress
      : 0;

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

        {/* Status Timeline - progressive reveal */}
        {status === 'pending' && visibleSteps.length > 0 && (
          <div className="space-y-1.5">
            {visibleSteps.map((entry, index) => {
              const isActive = index === visibleSteps.length - 1;

              return (
                <div
                  key={entry.status}
                  className={cn(
                    'flex items-center gap-2 text-xs transition-all duration-300',
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {isActive ? (
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
        {status === 'pending' && visibleSteps.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
            <span>{displayStep}</span>
          </div>
        )}

        {/* Progress Bar - synced to visible steps */}
        {status === 'pending' && displayProgress > 0 && (
          <div className="max-w-xs">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
