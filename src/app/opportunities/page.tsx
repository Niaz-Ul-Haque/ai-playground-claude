'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { OpportunityFilters, SnoozeOptions, DismissReason } from '@/types/opportunity';
import {
  OpportunityStatsDisplay,
  OpportunityBreakdown,
  OpportunityFiltersComponent,
  OpportunityList,
  SnoozeDialog,
  DismissDialog,
} from '@/components/opportunities';
import {
  getOpportunities,
  getOpportunityStats,
  getOpportunityById,
  snoozeOpportunity,
  dismissOpportunity,
  markOpportunityActioned,
  markOpportunityViewed,
} from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

type ViewTab = 'active' | 'snoozed' | 'actioned' | 'all';

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('active');
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Snooze dialog state
  const [snoozeDialogOpen, setSnoozeDialogOpen] = useState(false);
  const [snoozeTargetId, setSnoozeTargetId] = useState<string | null>(null);
  const [snoozeTargetTitle, setSnoozeTargetTitle] = useState('');

  // Dismiss dialog state
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [dismissTargetId, setDismissTargetId] = useState<string | null>(null);
  const [dismissTargetTitle, setDismissTargetTitle] = useState('');

  // Refresh data helper
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Get stats
  const stats = useMemo(() => getOpportunityStats(), [refreshKey]);

  // Get opportunities based on active tab and filters
  const opportunities = useMemo(() => {
    const baseFilters: OpportunityFilters = { ...filters };

    switch (activeTab) {
      case 'active':
        // Show new and viewed (not snoozed, dismissed, or actioned)
        return getOpportunities(baseFilters).filter(
          (opp) => opp.status === 'new' || opp.status === 'viewed'
        );
      case 'snoozed':
        baseFilters.status = 'snoozed';
        break;
      case 'actioned':
        baseFilters.status = 'actioned';
        break;
      case 'all':
        // Show all including dismissed
        break;
    }

    return getOpportunities(baseFilters);
  }, [activeTab, filters, refreshKey]);

  // Handlers
  const handleStartWorkflow = useCallback((oppId: string) => {
    // Mark as viewed first
    markOpportunityViewed(oppId);
    // In a real app, this would navigate to the workflow or trigger workflow creation
    const opp = getOpportunityById(oppId);
    alert(`Starting workflow: ${opp?.suggestedWorkflowName || 'Default Workflow'} for ${opp?.clientName}`);
    refresh();
  }, [refresh]);

  const handleSnoozeClick = useCallback((oppId: string) => {
    const opp = getOpportunityById(oppId);
    if (opp) {
      setSnoozeTargetId(oppId);
      setSnoozeTargetTitle(opp.title);
      setSnoozeDialogOpen(true);
    }
  }, []);

  const handleSnoozeConfirm = useCallback((options: SnoozeOptions) => {
    if (snoozeTargetId) {
      snoozeOpportunity(snoozeTargetId, options);
      refresh();
    }
  }, [snoozeTargetId, refresh]);

  const handleDismissClick = useCallback((oppId: string) => {
    const opp = getOpportunityById(oppId);
    if (opp) {
      setDismissTargetId(oppId);
      setDismissTargetTitle(opp.title);
      setDismissDialogOpen(true);
    }
  }, []);

  const handleDismissConfirm = useCallback((reason: DismissReason) => {
    if (dismissTargetId) {
      dismissOpportunity(dismissTargetId, reason);
      refresh();
    }
  }, [dismissTargetId, refresh]);

  const handleMarkActioned = useCallback((oppId: string) => {
    markOpportunityActioned(oppId);
    refresh();
  }, [refresh]);

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Opportunities</h1>
            <p className="text-sm text-muted-foreground">
              AI-surfaced opportunities with impact scoring and recommended actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="gap-1"
            >
              {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showBreakdown ? 'Hide' : 'Show'} Breakdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Simple Filters' : 'Advanced Filters'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Stats */}
            <OpportunityStatsDisplay stats={stats} />

            {/* Breakdown */}
            {showBreakdown && <OpportunityBreakdown stats={stats} />}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ViewTab)}
            >
              <TabsList className="h-10">
                <TabsTrigger value="active" className="gap-1">
                  Active
                  {(stats.byStatus.new + stats.byStatus.viewed) > 0 && (
                    <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {stats.byStatus.new + stats.byStatus.viewed}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="snoozed" className="gap-1">
                  Snoozed
                  {stats.byStatus.snoozed > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({stats.byStatus.snoozed})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="actioned" className="gap-1">
                  Actioned
                  {stats.byStatus.actioned > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({stats.byStatus.actioned})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="mt-4">
                <OpportunityFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  showAdvanced={showAdvancedFilters}
                />
              </div>

              {/* Active Opportunities */}
              <TabsContent value="active" className="mt-4">
                <OpportunityList
                  opportunities={opportunities}
                  onStartWorkflow={handleStartWorkflow}
                  onSnooze={handleSnoozeClick}
                  onDismiss={handleDismissClick}
                  onMarkActioned={handleMarkActioned}
                  emptyMessage="No active opportunities. Connect more data sources to discover new opportunities."
                />
              </TabsContent>

              {/* Snoozed Opportunities */}
              <TabsContent value="snoozed" className="mt-4">
                <OpportunityList
                  opportunities={opportunities}
                  onStartWorkflow={handleStartWorkflow}
                  onSnooze={handleSnoozeClick}
                  onDismiss={handleDismissClick}
                  onMarkActioned={handleMarkActioned}
                  emptyMessage="No snoozed opportunities."
                />
              </TabsContent>

              {/* Actioned Opportunities */}
              <TabsContent value="actioned" className="mt-4">
                <OpportunityList
                  opportunities={opportunities}
                  emptyMessage="No completed opportunities yet."
                />
              </TabsContent>

              {/* All Opportunities */}
              <TabsContent value="all" className="mt-4">
                <OpportunityList
                  opportunities={opportunities}
                  onStartWorkflow={handleStartWorkflow}
                  onSnooze={handleSnoozeClick}
                  onDismiss={handleDismissClick}
                  onMarkActioned={handleMarkActioned}
                  emptyMessage="No opportunities found matching your criteria."
                />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Snooze Dialog */}
      <SnoozeDialog
        open={snoozeDialogOpen}
        onOpenChange={setSnoozeDialogOpen}
        opportunityTitle={snoozeTargetTitle}
        onSnooze={handleSnoozeConfirm}
      />

      {/* Dismiss Dialog */}
      <DismissDialog
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        opportunityTitle={dismissTargetTitle}
        onDismiss={handleDismissConfirm}
      />
    </div>
  );
}
