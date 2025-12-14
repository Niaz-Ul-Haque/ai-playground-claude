'use client';

import React from 'react';
import type { AssetAlert } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  X,
  Calendar,
  CheckCircle,
  Cake,
  RefreshCw,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface AlertsSectionProps {
  alerts: AssetAlert[];
  onDismiss?: (alertId: string) => void;
  onAcknowledge?: (alertId: string) => void;
}

const getAlertIcon = (type: AssetAlert['type']) => {
  switch (type) {
    case 'renewal':
      return RefreshCw;
    case 'expiry':
      return AlertTriangle;
    case 'review_due':
      return Calendar;
    case 'action_needed':
      return AlertCircle;
    case 'contribution_room':
      return PiggyBank;
    case 'rebalance':
      return BarChart3;
    case 'birthday':
    case 'anniversary':
      return Cake;
    default:
      return Bell;
  }
};

const getSeverityStyles = (severity: AssetAlert['severity']) => {
  switch (severity) {
    case 'critical':
      return {
        container: 'border-l-4 border-l-red-500 bg-red-500/5',
        icon: 'text-red-500',
        badge: 'bg-red-500/10 text-red-500',
      };
    case 'warning':
      return {
        container: 'border-l-4 border-l-yellow-500 bg-yellow-500/5',
        icon: 'text-yellow-500',
        badge: 'bg-yellow-500/10 text-yellow-500',
      };
    case 'info':
      return {
        container: 'border-l-4 border-l-blue-500 bg-blue-500/5',
        icon: 'text-blue-500',
        badge: 'bg-blue-500/10 text-blue-500',
      };
    default:
      return {
        container: 'border-l-4 border-l-muted bg-muted/50',
        icon: 'text-muted-foreground',
        badge: 'bg-muted text-muted-foreground',
      };
  }
};

export function AlertsSection({ alerts, onDismiss, onAcknowledge }: AlertsSectionProps) {
  // Sort alerts by severity (critical first) then by date
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {criticalCount} urgent
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary">{alerts.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const styles = getSeverityStyles(alert.severity);
          const dueDate = alert.dueDate ? new Date(alert.dueDate) : null;
          const isOverdue = dueDate && dueDate < new Date();

          return (
            <div
              key={alert.id}
              className={`rounded-lg p-3 ${styles.container}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${styles.icon}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <Badge className={`text-xs ${styles.badge}`}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {isOverdue ? (
                        <span className="text-red-500 font-medium">
                          Overdue by {formatDistanceToNow(dueDate)}
                        </span>
                      ) : (
                        <>
                          Due {format(dueDate, 'MMM d, yyyy')} ·{' '}
                          {formatDistanceToNow(dueDate, { addSuffix: true })}
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {onAcknowledge && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onAcknowledge(alert.id)}
                      title="Acknowledge"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDismiss(alert.id)}
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
