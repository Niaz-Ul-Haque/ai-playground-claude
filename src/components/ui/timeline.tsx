'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  date?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'pending';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Dot/Icon */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background shrink-0',
                item.status === 'completed' && 'border-primary bg-primary',
                item.status === 'current' && 'border-primary',
                item.status === 'pending' && 'border-muted-foreground/30'
              )}
            >
              {item.icon ? (
                <span className={cn(
                  'text-sm',
                  item.status === 'completed' && 'text-primary-foreground'
                )}>
                  {item.icon}
                </span>
              ) : (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    item.status === 'completed' && 'bg-primary-foreground',
                    item.status === 'current' && 'bg-primary',
                    item.status === 'pending' && 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              {item.date && (
                <time className="text-xs text-muted-foreground">{item.date}</time>
              )}
              <h4 className="text-sm font-medium">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
