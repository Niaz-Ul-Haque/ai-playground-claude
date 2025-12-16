'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical,
  RefreshCw,
  Unlink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  FolderOpen,
  Mail,
  Calendar,
  Cloud,
  Database,
  ExternalLink,
  Key,
} from 'lucide-react';
import type {
  Integration,
  IntegrationStatus,
  IntegrationCategory,
} from '@/types/integration';
import {
  INTEGRATION_STATUS_LABELS,
  INTEGRATION_CATEGORY_LABELS,
  PROVIDER_COLORS,
} from '@/types/integration';

interface IntegrationCardProps {
  integration: Integration;
  onSync?: (id: string) => void;
  onDisconnect?: (id: string) => void;
  onReauthenticate?: (id: string) => void;
  onViewLogs?: (id: string) => void;
}

const categoryIcons: Record<IntegrationCategory, React.ReactNode> = {
  file_storage: <FolderOpen className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
};

const statusConfig: Record<IntegrationStatus, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  healthy: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  syncing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  disconnected: {
    icon: <Unlink className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

export function IntegrationCard({
  integration,
  onSync,
  onDisconnect,
  onReauthenticate,
  onViewLogs,
}: IntegrationCardProps) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const config = statusConfig[integration.status];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <Card className={`${config.borderColor} border-l-4`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${PROVIDER_COLORS[integration.provider]}15` }}
              >
                <div style={{ color: PROVIDER_COLORS[integration.provider] }}>
                  {categoryIcons[integration.category]}
                </div>
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  {integration.providerName}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {INTEGRATION_CATEGORY_LABELS[integration.category]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${config.bgColor} ${config.color} ${config.borderColor}`}
              >
                <span className="mr-1">{config.icon}</span>
                {INTEGRATION_STATUS_LABELS[integration.status]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onSync?.(integration.id)}
                    disabled={integration.status === 'syncing' || integration.status === 'disconnected'}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </DropdownMenuItem>
                  {integration.status === 'error' && (
                    <DropdownMenuItem onClick={() => onReauthenticate?.(integration.id)}>
                      <Key className="mr-2 h-4 w-4" />
                      Re-authenticate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onViewLogs?.(integration.id)}>
                    <Database className="mr-2 h-4 w-4" />
                    View Sync Logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDisconnectDialog(true)}
                    className="text-red-600"
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Status Message */}
          {(integration.errorMessage || integration.warningMessage) && (
            <div
              className={`p-2 rounded-md text-sm ${
                integration.errorMessage ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <div className="flex items-start gap-2">
                {integration.errorMessage ? (
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{integration.errorMessage || integration.warningMessage}</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Last Sync</p>
              <p className="font-medium">{formatDate(integration.lastSyncAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Records</p>
              <p className="font-medium">{formatNumber(integration.recordsSynced)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Frequency</p>
              <p className="font-medium capitalize">{integration.syncFrequency}</p>
            </div>
          </div>

          {/* Account Info */}
          {typeof integration.metadata?.accountEmail === 'string' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cloud className="h-3 w-3" />
              <span>{integration.metadata.accountEmail}</span>
            </div>
          )}

          {/* Action Buttons */}
          {integration.status === 'error' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onReauthenticate?.(integration.id)}
            >
              <Key className="mr-2 h-4 w-4" />
              Re-authenticate to fix
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {integration.providerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop syncing data from {integration.providerName}. Your existing data
              will be preserved, but no new updates will be received. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDisconnect?.(integration.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface IntegrationListProps {
  integrations: Integration[];
  onSync?: (id: string) => void;
  onDisconnect?: (id: string) => void;
  onReauthenticate?: (id: string) => void;
  onViewLogs?: (id: string) => void;
}

export function IntegrationList({
  integrations,
  onSync,
  onDisconnect,
  onReauthenticate,
  onViewLogs,
}: IntegrationListProps) {
  if (integrations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Integrations Connected</h3>
        <p className="text-muted-foreground text-sm">
          Connect your data sources to start syncing client information automatically.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onSync={onSync}
          onDisconnect={onDisconnect}
          onReauthenticate={onReauthenticate}
          onViewLogs={onViewLogs}
        />
      ))}
    </div>
  );
}
