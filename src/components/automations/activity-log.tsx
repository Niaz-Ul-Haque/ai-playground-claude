'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  User,
  ChevronRight,
  History,
  ExternalLink,
} from 'lucide-react';
import type { AutomationActivityEntry } from '@/types/automation';

interface ActivityLogProps {
  activities: AutomationActivityEntry[];
  onViewLink?: (type: string, id: string) => void;
  maxHeight?: string;
  showHeader?: boolean;
}

const statusConfig = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
};

export function ActivityLog({
  activities,
  onViewLink,
  maxHeight = '400px',
  showHeader = true,
}: ActivityLogProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
        <p className="text-muted-foreground text-sm">
          Automation activity will appear here once automations start running.
        </p>
      </Card>
    );
  }

  const content = (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-3 pr-4">
        {activities.map((activity) => {
          const config = statusConfig[activity.status];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              {/* Status Icon */}
              <div
                className={`p-1.5 rounded-full ${config.bgColor} flex-shrink-0`}
              >
                <span className={config.color}>{config.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Zap className="h-3 w-3" />
                      <span className="truncate">{activity.automationName}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>

                {/* Details */}
                {activity.details && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {activity.details}
                  </p>
                )}

                {/* Footer Row */}
                <div className="flex items-center justify-between mt-2">
                  {activity.affectedClientName ? (
                    <button
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      onClick={() =>
                        activity.affectedClientId &&
                        onViewLink?.('client', activity.affectedClientId)
                      }
                    >
                      <User className="h-3 w-3" />
                      <span>{activity.affectedClientName}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  {activity.linkTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() =>
                        onViewLink?.(activity.linkTo!.type, activity.linkTo!.id)
                      }
                    >
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

interface ActivityHistoryDialogContentProps {
  activities: AutomationActivityEntry[];
  automationName: string;
  onViewLink?: (type: string, id: string) => void;
}

export function ActivityHistoryDialogContent({
  activities,
  automationName,
  onViewLink,
}: ActivityHistoryDialogContentProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No History</h3>
        <p className="text-muted-foreground text-sm">
          This automation hasn't run yet.
        </p>
      </div>
    );
  }

  // Group by date
  const groupedByDate: Record<string, AutomationActivityEntry[]> = {};
  activities.forEach((activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(activity);
  });

  return (
    <ScrollArea className="max-h-[400px]">
      <div className="space-y-6 pr-4">
        {Object.entries(groupedByDate).map(([date, dayActivities]) => (
          <div key={date}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{date}</h4>
            <div className="space-y-2">
              {dayActivities.map((activity) => {
                const config = statusConfig[activity.status];
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 rounded-lg border"
                  >
                    <span className={config.color}>{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.action}</p>
                      {activity.affectedClientName && (
                        <p className="text-xs text-muted-foreground">
                          {activity.affectedClientName}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
