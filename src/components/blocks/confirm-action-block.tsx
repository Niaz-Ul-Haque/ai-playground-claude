'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { ConfirmActionBlockData } from '@/types/chat-blocks';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface ConfirmActionBlockProps {
  data: ConfirmActionBlockData;
}

const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    progressColor: 'bg-red-500',
  },
};

const DEFAULT_TIMEOUT = 300000; // 5 minutes

export function ConfirmActionBlock({ data }: ConfirmActionBlockProps) {
  const { sendMessage } = useChatContext();
  const {
    actionId,
    title,
    message,
    consequence,
    severity,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    timeout = DEFAULT_TIMEOUT,
    affectedEntity,
  } = data;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeout);
  const [isExpired, setIsExpired] = useState(false);

  const config = SEVERITY_CONFIG[severity];
  const SeverityIcon = config.icon;

  useEffect(() => {
    if (isConfirmed || isCancelled || isExpired) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConfirmed, isCancelled, isExpired]);

  const handleConfirm = async () => {
    setIsConfirmed(true);
    await sendMessage(`Confirm action ${actionId}`);
  };

  const handleCancel = async () => {
    setIsCancelled(true);
    await sendMessage(`Cancel action ${actionId}`);
  };

  const progressValue = (timeRemaining / timeout) * 100;
  const minutesRemaining = Math.ceil(timeRemaining / 60000);

  if (isConfirmed) {
    return (
      <Card className="my-4 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Action Confirmed</p>
              <p className="text-sm text-green-600">Processing your request...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCancelled) {
    return (
      <Card className="my-4 border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-gray-500" />
            <div>
              <p className="font-medium text-gray-800">Action Cancelled</p>
              <p className="text-sm text-gray-500">No changes were made.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="my-4 border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-gray-500" />
            <div>
              <p className="font-medium text-gray-800">Action Expired</p>
              <p className="text-sm text-gray-500">
                The confirmation window has closed. Please try again if needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('my-4', config.borderColor, config.bgColor)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <SeverityIcon className={cn('h-6 w-6 shrink-0', config.iconColor)} />
            <div className="flex-1">
              <p className={cn('font-semibold text-lg', config.textColor)}>{title}</p>
              <p className={cn('text-sm mt-1', config.textColor)}>{message}</p>
            </div>
          </div>

          {/* Affected Entity */}
          {affectedEntity && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 border border-white/80">
              <span className="text-sm text-muted-foreground">Affected:</span>
              <span className="font-medium">{affectedEntity.name}</span>
              <span className="text-xs text-muted-foreground">({affectedEntity.type})</span>
            </div>
          )}

          {/* Consequence Warning */}
          <div className={cn(
            'p-3 rounded-lg border',
            severity === 'danger' ? 'bg-red-100 border-red-300' : 'bg-white/50 border-white/80'
          )}>
            <p className="text-sm font-medium mb-1">If you proceed:</p>
            <p className={cn(
              'text-sm',
              severity === 'danger' ? 'text-red-700' : 'text-muted-foreground'
            )}>
              {consequence}
            </p>
          </div>

          {/* Timeout Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Auto-cancel in {minutesRemaining} min
              </span>
            </div>
            <Progress
              value={progressValue}
              className="h-1.5"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant={severity === 'danger' ? 'destructive' : 'default'}
              className="flex-1"
              onClick={handleConfirm}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {confirmText}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {cancelText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
