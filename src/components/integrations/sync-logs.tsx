'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Plus,
  RefreshCw,
  SkipForward,
} from 'lucide-react';
import type { SyncLogEntry, Integration } from '@/types/integration';

interface SyncLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
  logs: SyncLogEntry[];
}

const statusConfig = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Success',
  },
  partial: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'Partial',
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Failed',
  },
};

export function SyncLogsDialog({
  open,
  onOpenChange,
  integration,
  logs,
}: SyncLogsDialogProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Sync History {integration && `- ${integration.providerName}`}
          </DialogTitle>
          <DialogDescription>
            View recent sync activity and any issues that occurred.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sync history available.
              </div>
            ) : (
              logs.map((log) => {
                const config = statusConfig[log.status];
                return (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.status === 'failed' ? 'border-red-200' :
                      log.status === 'partial' ? 'border-amber-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${config.bgColor} ${config.color}`}
                        >
                          {config.icon}
                          <span className="ml-1">{config.label}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(log.duration)}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Processed</p>
                          <p className="font-medium">{log.recordsProcessed}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-medium">{log.recordsCreated}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Updated</p>
                          <p className="font-medium">{log.recordsUpdated}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SkipForward className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Skipped</p>
                          <p className="font-medium">{log.recordsSkipped}</p>
                        </div>
                      </div>
                    </div>

                    {log.errors && log.errors.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {log.errors.map((error, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-red-50 rounded text-sm text-red-700"
                          >
                            <div className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{error.code}</p>
                                <p className="text-xs">{error.message}</p>
                                {error.recoverable && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    Recoverable
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
