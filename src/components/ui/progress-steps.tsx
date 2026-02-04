'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'current' | 'completed';
}

interface ProgressStepsProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProgressSteps({
  steps,
  orientation = 'horizontal',
  className,
}: ProgressStepsProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-col' : 'flex-row items-center',
        className
      )}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={cn(
              'flex items-center gap-3',
              isVertical && 'flex-row'
            )}
          >
            {/* Step indicator */}
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium shrink-0',
                step.status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                step.status === 'current' && 'border-primary text-primary bg-primary/10',
                step.status === 'pending' && 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {step.status === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>

            {/* Step content */}
            <div className={cn(isVertical ? 'pb-4' : 'hidden md:block')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                isVertical
                  ? 'w-0.5 h-6 ml-4 -mt-4 mb-2'
                  : 'flex-1 h-0.5 mx-2',
                steps[index + 1].status === 'pending'
                  ? 'bg-muted-foreground/30'
                  : 'bg-primary'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
