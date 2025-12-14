'use client';

import React, { useMemo, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import {
  ProfileHeader,
  TimelinePanel,
  ArtifactsPanel,
  AssetsTable,
  AlertsSection,
} from '@/components/clients';
import {
  getClientById,
  getClientRelationships,
  getClientTimeline,
  getClientArtifacts,
  getClientAssets,
  getClientAlerts,
} from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Artifact } from '@/types/client';

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;

  const [timelineLimit, setTimelineLimit] = useState(10);

  const client = useMemo(() => getClientById(clientId), [clientId]);
  const relationships = useMemo(() => getClientRelationships(clientId), [clientId]);
  const timeline = useMemo(
    () => getClientTimeline(clientId, timelineLimit),
    [clientId, timelineLimit]
  );
  const allTimelineEvents = useMemo(() => getClientTimeline(clientId), [clientId]);
  const artifacts = useMemo(() => getClientArtifacts(clientId), [clientId]);
  const assets = useMemo(() => getClientAssets(clientId), [clientId]);
  const alerts = useMemo(() => getClientAlerts(clientId), [clientId]);

  if (!client) {
    notFound();
  }

  const handleLoadMoreTimeline = () => {
    setTimelineLimit((prev) => prev + 10);
  };

  const handleViewArtifact = (artifact: Artifact) => {
    // Mock view action - in real app would open document viewer
    console.log('View artifact:', artifact.name);
    alert(`Opening ${artifact.name}... (mock action)`);
  };

  const handleDownloadArtifact = (artifact: Artifact) => {
    // Mock download action - in real app would trigger download
    console.log('Download artifact:', artifact.name);
    alert(`Downloading ${artifact.name}... (mock action)`);
  };

  const handleDismissAlert = (alertId: string) => {
    // Mock dismiss action - in real app would update state/API
    console.log('Dismiss alert:', alertId);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    // Mock acknowledge action - in real app would update state/API
    console.log('Acknowledge alert:', alertId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/50 px-4 py-4 sm:px-6">
        <ProfileHeader client={client} relationships={relationships} />
      </div>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="border-b px-4 sm:px-6">
            <TabsList className="h-12">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">
                Assets
                {assets.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({assets.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documents
                {artifacts.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({artifacts.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Alerts at the top if any exist */}
                {alerts.length > 0 && (
                  <AlertsSection
                    alerts={alerts}
                    onDismiss={handleDismissAlert}
                    onAcknowledge={handleAcknowledgeAlert}
                  />
                )}

                {/* Two column layout on larger screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column - Assets summary */}
                  <AssetsTable assets={assets.slice(0, 5)} />

                  {/* Right column - Recent activity */}
                  <TimelinePanel
                    events={timeline.slice(0, 5)}
                    hasMore={allTimelineEvents.length > 5}
                  />
                </div>

                {/* Recent documents */}
                <ArtifactsPanel
                  artifacts={artifacts.slice(0, 4)}
                  onView={handleViewArtifact}
                  onDownload={handleDownloadArtifact}
                />
              </TabsContent>

              {/* Assets Tab */}
              <TabsContent value="assets" className="mt-0">
                <AssetsTable assets={assets} />
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-0">
                <ArtifactsPanel
                  artifacts={artifacts}
                  onView={handleViewArtifact}
                  onDownload={handleDownloadArtifact}
                />
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-0">
                <TimelinePanel
                  events={timeline}
                  onLoadMore={handleLoadMoreTimeline}
                  hasMore={timeline.length < allTimelineEvents.length}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
