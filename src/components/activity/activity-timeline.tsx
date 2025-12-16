'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  FileText,
  Settings,
  Zap,
  Link2,
  Database,
  Upload,
  Download,
  LogIn,
  LogOut,
  Bell,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { ActivityEntry, ActivityType, ActivityGroup } from '@/types/activity';

// ============================================================================
// Activity Type Icons
// ============================================================================

const activityIcons: Record<ActivityType, React.ElementType> = {
  client_created: User,
  client_updated: User,
  client_archived: User,
  contact_added: User,
  note_added: FileText,
  task_created: CheckCircle2,
  task_completed: CheckCircle2,
  task_assigned: CheckCircle2,
  opportunity_surfaced: Bell,
  opportunity_actioned: CheckCircle2,
  opportunity_dismissed: AlertCircle,
  automation_executed: Bot,
  automation_approved: Bot,
  automation_paused: Bot,
  integration_connected: Link2,
  integration_synced: Link2,
  integration_error: AlertCircle,
  data_imported: Upload,
  data_exported: Download,
  review_approved: Database,
  review_rejected: Database,
  email_sent: Mail,
  email_received: Mail,
  call_logged: Phone,
  meeting_scheduled: Calendar,
  document_uploaded: FileText,
  document_shared: FileText,
  login: LogIn,
  logout: LogOut,
  settings_changed: Settings,
  system_event: Zap,
};

// ============================================================================
// Activity Entry Card
// ============================================================================

interface ActivityEntryCardProps {
  entry: ActivityEntry;
}

export function ActivityEntryCard({ entry }: ActivityEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = activityIcons[entry.type] || Zap;

  const getActorBadge = () => {
    switch (entry.actor) {
      case 'user':
        return <Badge variant="outline" className="text-xs">You</Badge>;
      case 'automation':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Automation</Badge>;
      case 'system':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">System</Badge>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  const hasDetails = entry.details || entry.changes;

  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50',
      entry.isError && 'bg-red-50/50',
      entry.isImportant && !entry.isError && 'bg-yellow-50/50',
      !entry.isRead && 'border-l-2 border-primary'
    )}>
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        entry.isError ? 'bg-red-100 text-red-600' :
        entry.actor === 'automation' ? 'bg-purple-100 text-purple-600' :
        entry.actor === 'system' ? 'bg-blue-100 text-blue-600' :
        'bg-muted text-muted-foreground'
      )}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{entry.title}</span>
              {getActorBadge()}
              {entry.isError && (
                <Badge variant="destructive" className="text-xs">Error</Badge>
              )}
              {entry.isImportant && !entry.isError && (
                <Badge variant="secondary" className="text-xs">Important</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {entry.description}
            </p>

            {/* Related entities */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {entry.clientName && (
                <Link
                  href={`/clients/${entry.clientId}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <User className="h-3 w-3" />
                  {entry.clientName}
                </Link>
              )}
              {entry.taskTitle && (
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {entry.taskTitle}
                </Link>
              )}
              {entry.automationName && (
                <Link
                  href="/automations"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Bot className="h-3 w-3" />
                  {entry.automationName}
                </Link>
              )}
              {entry.integrationName && (
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Link2 className="h-3 w-3" />
                  {entry.integrationName}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
            <span>{formatTimestamp(entry.timestamp)}</span>
            {hasDetails && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Expandable details */}
        {hasDetails && isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {entry.changes && entry.changes.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Changes:</p>
                {entry.changes.map((change, index) => (
                  <div key={index} className="text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">{change.fieldLabel}:</span>
                    <span className="line-through text-red-600">{String(change.oldValue)}</span>
                    <span className="text-green-600">{String(change.newValue)}</span>
                  </div>
                ))}
              </div>
            )}
            {entry.details && (
              <div className="text-xs space-y-1">
                <p className="font-medium text-muted-foreground">Details:</p>
                {Object.entries(entry.details).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Activity Timeline
// ============================================================================

interface ActivityTimelineProps {
  entries: ActivityEntry[];
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
  // Group entries by date
  const groups: ActivityGroup[] = [];
  const groupMap = new Map<string, ActivityEntry[]>();

  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dateKey = date.toISOString().split('T')[0];

    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, []);
    }
    groupMap.get(dateKey)!.push(entry);
  });

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

  groupMap.forEach((groupEntries, dateKey) => {
    let dateLabel = new Date(dateKey).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    if (dateKey === today) {
      dateLabel = 'Today';
    } else if (dateKey === yesterday) {
      dateLabel = 'Yesterday';
    }

    groups.push({
      date: dateKey,
      dateLabel,
      entries: groupEntries,
    });
  });

  // Sort groups by date (most recent first)
  groups.sort((a, b) => b.date.localeCompare(a.date));

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No activity to show</p>
          <p className="text-sm">Activity will appear here as actions occur</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-2">
            {group.dateLabel}
          </h3>
          <Card>
            <CardContent className="p-0 divide-y">
              {group.entries.map((entry) => (
                <ActivityEntryCard key={entry.id} entry={entry} />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Compact Activity List (for sidebar/widgets)
// ============================================================================

interface CompactActivityListProps {
  entries: ActivityEntry[];
  maxItems?: number;
  onViewAll?: () => void;
}

export function CompactActivityList({ entries, maxItems = 5, onViewAll }: CompactActivityListProps) {
  const displayEntries = entries.slice(0, maxItems);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-2">
      {displayEntries.map((entry) => {
        const Icon = activityIcons[entry.type] || Zap;
        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
          >
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
              entry.isError ? 'bg-red-100 text-red-600' : 'bg-muted'
            )}>
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{entry.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(entry.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
      {entries.length > maxItems && onViewAll && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onViewAll}>
          View all activity
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
