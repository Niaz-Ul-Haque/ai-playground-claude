'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Task } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Clock,
  User,
  Bot,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from 'lucide-react';
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onMarkComplete?: (taskId: string) => void;
  showClient?: boolean;
}

const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'needs-review':
      return AlertCircle;
    case 'in-progress':
      return PlayCircle;
    case 'completed':
      return CheckCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'needs-review':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'in-progress':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'completed':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-500';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function TaskCard({
  task,
  onApprove,
  onReject,
  onMarkComplete,
  showClient = true,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const StatusIcon = getStatusIcon(task.status);
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'completed';
  const isDueToday = isToday(dueDate);

  return (
    <Card
      className={cn(
        'transition-all',
        isOverdue && 'border-red-500/50',
        task.aiCompleted && 'border-purple-500/30'
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn('p-2 rounded-lg shrink-0', getStatusColor(task.status))}>
                <StatusIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{task.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              </div>
            </div>
            <Badge className={cn('shrink-0', getPriorityColor(task.priority))}>
              {task.priority}
            </Badge>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Due Date */}
            <div
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-500 font-medium',
                isDueToday && !isOverdue && 'text-yellow-600 font-medium'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {isOverdue ? (
                <span>Overdue by {formatDistanceToNow(dueDate)}</span>
              ) : isDueToday ? (
                <span>Due today at {format(dueDate, 'h:mm a')}</span>
              ) : (
                <span>{format(dueDate, 'MMM d, yyyy')}</span>
              )}
            </div>

            {/* Client Link */}
            {showClient && task.clientId && task.clientName && (
              <Link
                href={`/clients/${task.clientId}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>{task.clientName}</span>
              </Link>
            )}

            {/* AI Badge */}
            {task.aiCompleted && (
              <Badge variant="outline" className="gap-1 text-purple-500 border-purple-500/30">
                <Bot className="h-3 w-3" />
                AI Completed
              </Badge>
            )}

            {/* Status Badge */}
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status.replace('-', ' ')}
            </Badge>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          {/* AI Completion Details (Expandable) */}
          {task.aiCompleted && task.aiCompletionData && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    View AI Analysis
                    <Badge variant="outline" className="text-xs">
                      {task.aiCompletionData.confidence}% confidence
                    </Badge>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">{task.aiCompletionData.summary}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.aiCompletionData.details}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Action Buttons */}
          {task.status === 'needs-review' && (
            <div className="flex items-center gap-2 pt-2 border-t">
              {onApprove && (
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => onApprove(task.id)}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => onReject(task.id)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              )}
            </div>
          )}

          {task.status === 'pending' && onMarkComplete && (
            <div className="pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1"
                onClick={() => onMarkComplete(task.id)}
              >
                <CheckCircle className="h-4 w-4" />
                Mark Complete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
