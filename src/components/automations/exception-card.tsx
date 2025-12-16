'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Zap,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { AutomationException } from '@/types/automation';
import { EXCEPTION_SEVERITY_LABELS, EXCEPTION_STATUS_LABELS } from '@/types/automation';

interface ExceptionCardProps {
  exception: AutomationException;
  onResolve: (id: string, resolution: string) => void;
  onIgnore: (id: string) => void;
  onViewClient?: (clientId: string) => void;
}

const severityConfig = {
  low: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    borderColor: 'border-l-blue-400',
  },
  medium: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    borderColor: 'border-l-amber-400',
  },
  high: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    borderColor: 'border-l-orange-400',
  },
  critical: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600 bg-red-50 border-red-200',
    borderColor: 'border-l-red-500',
  },
};

const statusConfig = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  resolved: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  ignored: {
    icon: <EyeOff className="h-4 w-4" />,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  },
};

export function ExceptionCard({
  exception,
  onResolve,
  onIgnore,
  onViewClient,
}: ExceptionCardProps) {
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState('');

  const severityStyle = severityConfig[exception.severity];
  const statusStyle = statusConfig[exception.status];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const handleResolve = () => {
    onResolve(exception.id, resolution);
    setShowResolveDialog(false);
    setResolution('');
  };

  return (
    <>
      <Card className={`border-l-4 ${severityStyle.borderColor}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={severityStyle.color}>
                {severityStyle.icon}
                <span className="ml-1">{EXCEPTION_SEVERITY_LABELS[exception.severity]}</span>
              </Badge>
              <Badge variant="outline" className={statusStyle.color}>
                {statusStyle.icon}
                <span className="ml-1">{EXCEPTION_STATUS_LABELS[exception.status]}</span>
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(exception.occurredAt)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Exception Reason */}
          <div>
            <h4 className="font-medium">{exception.reason}</h4>
            {exception.details && (
              <p className="text-sm text-muted-foreground mt-1">{exception.details}</p>
            )}
          </div>

          {/* Context Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>{exception.automationName}</span>
            </div>
            {exception.affectedClientName && (
              <button
                className="flex items-center gap-2 hover:text-primary"
                onClick={() => exception.affectedClientId && onViewClient?.(exception.affectedClientId)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{exception.affectedClientName}</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Suggested Action */}
          {exception.suggestedAction && exception.status === 'pending' && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-700">
                <span className="font-medium">Suggested: </span>
                {exception.suggestedAction}
              </p>
            </div>
          )}

          {/* Resolution Info (if resolved) */}
          {exception.status === 'resolved' && exception.resolution && (
            <div className="p-3 bg-green-50 rounded-lg text-sm">
              <p className="text-green-700">
                <span className="font-medium">Resolution: </span>
                {exception.resolution}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Resolved by {exception.resolvedBy} on {formatDate(exception.resolvedAt!)}
              </p>
            </div>
          )}

          {/* Actions (if pending) */}
          {exception.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => setShowResolveDialog(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onIgnore(exception.id)}
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Ignore
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Exception</DialogTitle>
            <DialogDescription>
              Document how this exception was resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">{exception.reason}</p>
              {exception.details && (
                <p className="text-muted-foreground mt-1">{exception.details}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Notes</Label>
              <Textarea
                id="resolution"
                placeholder="Describe how you resolved this exception..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ExceptionListProps {
  exceptions: AutomationException[];
  onResolve: (id: string, resolution: string) => void;
  onIgnore: (id: string) => void;
  onViewClient?: (clientId: string) => void;
}

export function ExceptionList({
  exceptions,
  onResolve,
  onIgnore,
  onViewClient,
}: ExceptionListProps) {
  if (exceptions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Exceptions</h3>
        <p className="text-muted-foreground text-sm">
          All automations are running smoothly.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {exceptions.map((exception) => (
        <ExceptionCard
          key={exception.id}
          exception={exception}
          onResolve={onResolve}
          onIgnore={onIgnore}
          onViewClient={onViewClient}
        />
      ))}
    </div>
  );
}
