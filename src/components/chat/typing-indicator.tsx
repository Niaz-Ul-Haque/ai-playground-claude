'use client';

import { Search, Loader2, Sparkles, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StreamingStatus =
  | 'idle'
  | 'thinking'
  | 'searching'
  | 'processing'
  | 'generating'
  | 'executing';

interface TypingIndicatorProps {
  status?: StreamingStatus;
  statusText?: string;
}

const STATUS_CONFIG: Record<StreamingStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
}> = {
  idle: {
    icon: Loader2,
    label: 'Waiting...',
    color: 'text-muted-foreground',
  },
  thinking: {
    icon: Sparkles,
    label: 'Thinking...',
    color: 'text-primary',
  },
  searching: {
    icon: Search,
    label: 'Searching...',
    color: 'text-blue-500',
  },
  processing: {
    icon: Loader2,
    label: 'Processing...',
    color: 'text-amber-500',
  },
  generating: {
    icon: Sparkles,
    label: 'Generating response...',
    color: 'text-green-500',
  },
  executing: {
    icon: Wrench,
    label: 'Executing action...',
    color: 'text-purple-500',
  },
};

/**
 * TypingIndicator - Shows the AI's current status during streaming
 *
 * @param status - The current streaming status
 * @param statusText - Optional custom status text to display
 */
export function TypingIndicator({ status = 'thinking', statusText }: TypingIndicatorProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.thinking;
  const Icon = config.icon;
  const displayText = statusText || config.label;

  return (
    <div className="flex items-center gap-1 p-4">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg">
        {/* Animated Icon */}
        <Icon className={cn(
          'h-4 w-4',
          config.color,
          status !== 'idle' && 'animate-spin'
        )} />

        {/* Status Text */}
        <span className={cn('text-sm font-medium', config.color)}>
          {displayText}
        </span>

        {/* Animated Dots */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

/**
 * StreamingCursor - An animated cursor shown at the end of streaming text
 */
export function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-0.5" />
  );
}

/**
 * ThinkingIndicator - Alternative simplified thinking indicator
 * Used for quick thinking states
 */
export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
      <span>Thinking...</span>
    </div>
  );
}
