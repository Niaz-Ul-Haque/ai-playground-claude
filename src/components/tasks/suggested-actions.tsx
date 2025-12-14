'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SuggestedAction } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Lightbulb,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Mail,
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SuggestedActionsProps {
  actions: SuggestedAction[];
  onAccept?: (actionId: string) => void;
  onDismiss?: (actionId: string) => void;
}

const getActionIcon = (type: SuggestedAction['type']) => {
  switch (type) {
    case 'follow_up':
      return RefreshCw;
    case 'review_required':
      return AlertTriangle;
    case 'schedule_meeting':
      return Calendar;
    case 'send_document':
      return Mail;
    case 'update_record':
      return FileText;
    case 'complete_task':
      return CheckCircle;
    case 'escalate':
      return AlertTriangle;
    default:
      return Lightbulb;
  }
};

const getPriorityColor = (priority: SuggestedAction['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'medium':
      return 'border-l-yellow-500';
    default:
      return 'border-l-muted';
  }
};

function SuggestedActionCard({
  action,
  onAccept,
  onDismiss,
}: {
  action: SuggestedAction;
  onAccept?: (actionId: string) => void;
  onDismiss?: (actionId: string) => void;
}) {
  const [showReason, setShowReason] = useState(false);
  const Icon = getActionIcon(action.type);

  return (
    <div
      className={cn(
        'border-l-4 rounded-lg bg-muted/30 p-4',
        getPriorityColor(action.priority)
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{action.title}</h4>
              <Badge variant="outline" className="text-xs">
                {action.confidence}% confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {action.description}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {action.clientId && action.clientName && (
            <Link
              href={`/clients/${action.clientId}`}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>{action.clientName}</span>
            </Link>
          )}
          <span className="text-muted-foreground">
            Suggested {formatDistanceToNow(new Date(action.suggestedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Why This? */}
        <Collapsible open={showReason} onOpenChange={setShowReason}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
              <span>Why this suggestion?</span>
              {showReason ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-3 bg-background rounded-lg text-sm">
              {action.reason}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onAccept && (
            <Button size="sm" className="flex-1 gap-1" onClick={() => onAccept(action.id)}>
              <Check className="h-4 w-4" />
              Accept
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => onDismiss(action.id)}
            >
              <X className="h-4 w-4" />
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuggestedActions({ actions, onAccept, onDismiss }: SuggestedActionsProps) {
  const pendingActions = actions.filter((a) => a.status === 'pending');

  if (pendingActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Suggested Actions
          <Badge variant="secondary">{pendingActions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingActions.slice(0, 5).map((action) => (
          <SuggestedActionCard
            key={action.id}
            action={action}
            onAccept={onAccept}
            onDismiss={onDismiss}
          />
        ))}
        {pendingActions.length > 5 && (
          <Button variant="ghost" className="w-full">
            View all {pendingActions.length} suggestions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
