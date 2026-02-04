'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, MinusCircle } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  description?: string;
  details?: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  title?: string;
  showScore?: boolean;
  className?: string;
}

const statusConfig = {
  pass: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  fail: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  pending: {
    icon: MinusCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
  },
};

export function Checklist({ items, title, showScore = true, className }: ChecklistProps) {
  const passCount = items.filter(i => i.status === 'pass').length;
  const score = Math.round((passCount / items.length) * 100);

  return (
    <div className={cn('space-y-4', className)}>
      {(title || showScore) && (
        <div className="flex items-center justify-between">
          {title && <h4 className="font-medium">{title}</h4>}
          {showScore && (
            <span
              className={cn(
                'text-sm font-medium px-2 py-1 rounded',
                score >= 80 && 'bg-green-100 text-green-700',
                score >= 50 && score < 80 && 'bg-amber-100 text-amber-700',
                score < 50 && 'bg-red-100 text-red-700'
              )}
            >
              {score}% Pass
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg',
                config.bg
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                )}
                {item.details && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {item.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
