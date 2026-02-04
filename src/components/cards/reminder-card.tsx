'use client';

import { useState } from 'react';
import type { ReminderCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Clock,
  CheckCircle2,
  X,
  RotateCcw,
  Calendar,
  User,
  FileText,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatContext } from '@/context/chat-context';

interface ReminderCardProps {
  data: ReminderCardData;
}

const SNOOZE_OPTIONS = [
  { label: '15 minutes', value: '15m' },
  { label: '1 hour', value: '1h' },
  { label: '4 hours', value: '4h' },
  { label: 'Tomorrow', value: '1d' },
  { label: 'Next week', value: '1w' },
];

export function ReminderCard({ data }: ReminderCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [status, setStatus] = useState(data.status);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatDateTime = (date: string, time?: string): string => {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    if (time) {
      return `${dateStr} at ${time}`;
    }
    
    return dateStr;
  };

  const getTimeRemaining = (): { text: string; isOverdue: boolean; isUrgent: boolean } => {
    const now = new Date();
    const dueDate = new Date(data.due_date);
    if (data.due_time) {
      const [hours, minutes] = data.due_time.split(':').map(Number);
      dueDate.setHours(hours, minutes);
    }
    
    const diff = dueDate.getTime() - now.getTime();
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 0) {
      if (days > 0) {
        return { text: `${days} day${days > 1 ? 's' : ''} overdue`, isOverdue: true, isUrgent: true };
      }
      return { text: `${hours}h ${minutes}m overdue`, isOverdue: true, isUrgent: true };
    }

    if (days > 0) {
      return { text: `in ${days} day${days > 1 ? 's' : ''}`, isOverdue: false, isUrgent: days <= 1 };
    }
    if (hours > 0) {
      return { text: `in ${hours}h ${minutes}m`, isOverdue: false, isUrgent: hours <= 2 };
    }
    return { text: `in ${minutes}m`, isOverdue: false, isUrgent: true };
  };

  const handleSnooze = async (duration: string) => {
    setActionLoading('snooze');
    try {
      await handleExecuteAction('snooze_reminder', 'reminder', data.reminder_id, { duration });
      setStatus('snoozed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async () => {
    setActionLoading('dismiss');
    try {
      await handleExecuteAction('dismiss_reminder', 'reminder', data.reminder_id, {});
      setStatus('dismissed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    try {
      await handleExecuteAction('complete_reminder', 'reminder', data.reminder_id, {});
      setStatus('completed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = async () => {
    await handleExecuteAction('reschedule_reminder', 'reminder', data.reminder_id, {});
  };

  const timeInfo = getTimeRemaining();
  const actions = data.available_actions || ['snooze', 'dismiss', 'complete'];

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'dismissed':
        return <Badge variant="secondary"><X className="w-3 h-3 mr-1" />Dismissed</Badge>;
      case 'snoozed':
        return <Badge variant="outline" className="border-amber-400 text-amber-600"><Clock className="w-3 h-3 mr-1" />Snoozed</Badge>;
      default:
        return null;
    }
  };

  const getRecurrenceText = (): string | null => {
    if (!data.recurrence || data.recurrence.type === 'none') return null;
    
    const interval = data.recurrence.interval || 1;
    switch (data.recurrence.type) {
      case 'daily':
        return interval === 1 ? 'Repeats daily' : `Repeats every ${interval} days`;
      case 'weekly':
        return interval === 1 ? 'Repeats weekly' : `Repeats every ${interval} weeks`;
      case 'monthly':
        return interval === 1 ? 'Repeats monthly' : `Repeats every ${interval} months`;
      default:
        return null;
    }
  };

  if (status === 'completed' || status === 'dismissed') {
    return (
      <Card className="my-4 border-l-4 border-l-gray-400 opacity-75">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" />
              <CardTitle className="text-lg line-through text-muted-foreground">{data.title}</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`my-4 border-l-4 ${timeInfo.isOverdue ? 'border-l-red-500' : timeInfo.isUrgent ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${timeInfo.isOverdue ? 'text-red-500' : timeInfo.isUrgent ? 'text-amber-500' : 'text-blue-500'}`} />
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Due: {formatDateTime(data.due_date, data.due_time)}</span>
          <span className={`font-medium ${timeInfo.isOverdue ? 'text-red-500' : timeInfo.isUrgent ? 'text-amber-500' : ''}`}>
            ({timeInfo.text})
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {data.description && (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        )}

        {/* Related Entity */}
        {(data.related_client_name || data.related_task_title) && (
          <div className="flex flex-wrap gap-2">
            {data.related_client_name && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {data.related_client_name}
              </Badge>
            )}
            {data.related_task_title && (
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {data.related_task_title}
              </Badge>
            )}
          </div>
        )}

        {/* Recurrence */}
        {getRecurrenceText() && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="w-4 h-4" />
            {getRecurrenceText()}
          </div>
        )}

        {/* Snoozed Until */}
        {status === 'snoozed' && data.snoozed_until && (
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-sm">
            <span className="text-amber-600 dark:text-amber-400">
              Snoozed until {formatDateTime(data.snoozed_until)}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap pt-4 border-t">
        {actions.includes('complete') && (
          <Button
            onClick={handleComplete}
            disabled={actionLoading === 'complete'}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {actionLoading === 'complete' ? 'Completing...' : 'Mark Complete'}
          </Button>
        )}

        {actions.includes('snooze') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={actionLoading === 'snooze'}>
                <Clock className="w-4 h-4 mr-2" />
                {actionLoading === 'snooze' ? 'Snoozing...' : 'Snooze'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {SNOOZE_OPTIONS.map(option => (
                <DropdownMenuItem key={option.value} onClick={() => handleSnooze(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {actions.includes('reschedule') && (
          <Button variant="ghost" onClick={handleReschedule}>
            <Calendar className="w-4 h-4 mr-2" />
            Reschedule
          </Button>
        )}

        {actions.includes('dismiss') && (
          <Button
            variant="ghost"
            onClick={handleDismiss}
            disabled={actionLoading === 'dismiss'}
          >
            <X className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
