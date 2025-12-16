'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  FolderOpen,
  Mail,
  Calendar,
} from 'lucide-react';
import {
  IntegrationStatsDisplay,
  IntegrationBreakdown,
  IntegrationList,
  ConnectionFlowDialog,
  SyncLogsDialog,
  ExportModal,
} from '@/components/integrations';
import {
  getIntegrations,
  getIntegrationById,
  getIntegrationStats,
  getUnconnectedProviders,
  getSyncLogs,
  connectIntegration,
  disconnectIntegration,
  triggerSync,
  updateIntegration,
  getClients,
} from '@/lib/mock-data';
import type {
  Integration,
  IntegrationStats,
  AvailableIntegration,
  SyncLogEntry,
  IntegrationCategory,
  IntegrationProvider,
  ExportOptions,
} from '@/types/integration';

export default function IntegrationsPage() {
  // State
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [availableIntegrations, setAvailableIntegrations] = useState<AvailableIntegration[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | IntegrationCategory>('all');

  // Dialog state
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);

  // Load data
  const loadData = useCallback(() => {
    const category = activeTab === 'all' ? undefined : activeTab;
    setIntegrations(getIntegrations({ category }));
    setStats(getIntegrationStats());
    setAvailableIntegrations(getUnconnectedProviders());
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSync = useCallback((id: string) => {
    triggerSync(id);
    loadData();
    // Simulate sync completion
    setTimeout(() => {
      const integration = getIntegrationById(id);
      if (integration) {
        updateIntegration(id, {
          status: 'healthy',
          lastSyncAt: new Date().toISOString(),
          recordsSynced: integration.recordsSynced + Math.floor(Math.random() * 50),
        });
        loadData();
      }
    }, 2000);
  }, [loadData]);

  const handleDisconnect = useCallback((id: string) => {
    disconnectIntegration(id);
    loadData();
  }, [loadData]);

  const handleReauthenticate = useCallback((id: string) => {
    // Simulate re-authentication
    updateIntegration(id, {
      status: 'syncing',
      errorMessage: undefined,
    });
    loadData();
    // Simulate success
    setTimeout(() => {
      updateIntegration(id, {
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
      });
      loadData();
    }, 2000);
  }, [loadData]);

  const handleViewLogs = useCallback((id: string) => {
    const integration = getIntegrationById(id);
    const logs = getSyncLogs(id);
    setSelectedIntegration(integration || null);
    setSyncLogs(logs);
    setShowLogsDialog(true);
  }, []);

  const handleConnect = useCallback(async (provider: IntegrationProvider) => {
    const newIntegration = connectIntegration(provider);
    // Simulate initial sync
    setTimeout(() => {
      updateIntegration(newIntegration.id, {
        status: 'healthy',
        lastSyncAt: new Date().toISOString(),
        recordsSynced: Math.floor(Math.random() * 500) + 100,
      });
      loadData();
    }, 3000);
    loadData();
  }, [loadData]);

  const handleExport = useCallback(async (options: ExportOptions) => {
    console.log('Exporting with options:', options);
    // In production, this would trigger an actual export
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }, []);

  // Get counts for tabs
  const allCount = getIntegrations().filter(i => i.status !== 'disconnected').length;
  const fileStorageCount = getIntegrations({ category: 'file_storage' }).filter(i => i.status !== 'disconnected').length;
  const emailCount = getIntegrations({ category: 'email' }).filter(i => i.status !== 'disconnected').length;
  const calendarCount = getIntegrations({ category: 'calendar' }).filter(i => i.status !== 'disconnected').length;

  // Get client count for export
  const clientCount = getClients().length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Integrations & Sources</h1>
            <p className="text-muted-foreground text-sm">
              Connect your data sources and manage sync settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={() => setShowConnectDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Source
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Section */}
        {stats && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Overview</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                {showBreakdown ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Show Details
                  </>
                )}
              </Button>
            </div>
            <IntegrationStatsDisplay stats={stats} />
            {showBreakdown && <IntegrationBreakdown stats={stats} />}
          </div>
        )}

        {/* Integrations Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary" className="text-xs">
                  {allCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="file_storage" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Files
                <Badge variant="secondary" className="text-xs">
                  {fileStorageCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
                <Badge variant="secondary" className="text-xs">
                  {emailCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
                <Badge variant="secondary" className="text-xs">
                  {calendarCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <IntegrationList
              integrations={integrations.filter(i => i.status !== 'disconnected')}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              onReauthenticate={handleReauthenticate}
              onViewLogs={handleViewLogs}
            />
          </TabsContent>

          <TabsContent value="file_storage" className="mt-6">
            <IntegrationList
              integrations={integrations.filter(i => i.status !== 'disconnected')}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              onReauthenticate={handleReauthenticate}
              onViewLogs={handleViewLogs}
            />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <IntegrationList
              integrations={integrations.filter(i => i.status !== 'disconnected')}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              onReauthenticate={handleReauthenticate}
              onViewLogs={handleViewLogs}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <IntegrationList
              integrations={integrations.filter(i => i.status !== 'disconnected')}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              onReauthenticate={handleReauthenticate}
              onViewLogs={handleViewLogs}
            />
          </TabsContent>
        </Tabs>

        {/* Available Integrations */}
        {availableIntegrations.length > 0 && (
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Available Sources</h2>
                <p className="text-sm text-muted-foreground">
                  Connect additional sources to sync more data
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowConnectDialog(true)}>
                View All
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {availableIntegrations.slice(0, 3).map((avail) => (
                <button
                  key={avail.provider}
                  onClick={() => setShowConnectDialog(true)}
                  className="p-4 border rounded-lg text-left hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {avail.category === 'file_storage' && <FolderOpen className="h-5 w-5" />}
                      {avail.category === 'email' && <Mail className="h-5 w-5" />}
                      {avail.category === 'calendar' && <Calendar className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{avail.name}</h4>
                      <p className="text-xs text-muted-foreground">{avail.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConnectionFlowDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        availableIntegrations={availableIntegrations}
        onConnect={handleConnect}
      />

      <SyncLogsDialog
        open={showLogsDialog}
        onOpenChange={setShowLogsDialog}
        integration={selectedIntegration}
        logs={syncLogs}
      />

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        onExport={handleExport}
        totalClients={clientCount}
      />
    </div>
  );
}
