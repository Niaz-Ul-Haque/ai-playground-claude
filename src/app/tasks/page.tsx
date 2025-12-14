'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { TaskFilters } from '@/types/task';
import {
  TaskStatsDisplay,
  TaskFiltersComponent,
  TaskList,
  SuggestedActions,
  WorkflowList,
  RecommendationsPanel,
  PrefilledMaterials,
  CycleTimeList,
} from '@/components/tasks';
import {
  getTaskStats,
  searchTasks,
  updateTask,
  getSuggestedActions,
  updateSuggestedAction,
  getWorkflows,
  getMaterials,
  getRecommendations,
  updateRecommendation,
  getCycleTimeStats,
} from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

type ViewTab = 'today' | 'week' | 'all' | 'workflows' | 'insights';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('today');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data helper
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Get stats
  const stats = useMemo(() => getTaskStats(), [refreshKey]);

  // Get tasks based on active tab and filters
  const tasks = useMemo(() => {
    const baseFilters: TaskFilters = { ...filters };

    switch (activeTab) {
      case 'today':
        baseFilters.dueDate = 'today';
        break;
      case 'week':
        baseFilters.dueDate = 'week';
        break;
      case 'all':
        // No date filter
        break;
      default:
        break;
    }

    return searchTasks(baseFilters);
  }, [activeTab, filters, refreshKey]);

  // Get other data
  const suggestedActions = useMemo(() => getSuggestedActions('pending'), [refreshKey]);
  const workflows = useMemo(() => getWorkflows('active'), [refreshKey]);
  const materials = useMemo(() => getMaterials({ status: 'ready' }).concat(getMaterials({ status: 'draft' })), [refreshKey]);
  const recommendations = useMemo(() => getRecommendations(), [refreshKey]);
  const cycleTimeStats = useMemo(() => getCycleTimeStats(), [refreshKey]);

  // Handlers
  const handleApproveTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'completed', completedAt: new Date().toISOString() });
    refresh();
  }, [refresh]);

  const handleRejectTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'pending', aiCompleted: false, aiCompletionData: undefined });
    refresh();
  }, [refresh]);

  const handleMarkComplete = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'completed', completedAt: new Date().toISOString() });
    refresh();
  }, [refresh]);

  const handleAcceptAction = useCallback((actionId: string) => {
    updateSuggestedAction(actionId, 'accepted');
    refresh();
  }, [refresh]);

  const handleDismissAction = useCallback((actionId: string) => {
    updateSuggestedAction(actionId, 'dismissed');
    refresh();
  }, [refresh]);

  const handleApplyRecommendation = useCallback((id: string) => {
    updateRecommendation(id, { status: 'applied', appliedAt: new Date().toISOString() });
    refresh();
  }, [refresh]);

  const handleDismissRecommendation = useCallback((id: string) => {
    updateRecommendation(id, { status: 'dismissed' });
    refresh();
  }, [refresh]);

  const handleRevertRecommendation = useCallback((id: string) => {
    updateRecommendation(id, { status: 'reverted' });
    refresh();
  }, [refresh]);

  const handleViewMaterial = useCallback((materialId: string) => {
    // Mock action - in real app would open document viewer
    alert(`Opening material ${materialId}... (mock action)`);
  }, []);

  const handleDownloadMaterial = useCallback((materialId: string) => {
    // Mock action - in real app would trigger download
    alert(`Downloading material ${materialId}... (mock action)`);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Tasks & Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Manage your tasks, workflows, and AI-suggested actions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ViewTab)}
          className="h-full flex flex-col"
        >
          <div className="border-b px-4 sm:px-6">
            <TabsList className="h-12">
              <TabsTrigger value="today" className="gap-1">
                Today
                {stats.dueToday > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {stats.dueToday}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-1">
                This Week
                {stats.dueThisWeek > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({stats.dueThisWeek})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="workflows" className="gap-1">
                Workflows
                {workflows.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({workflows.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Stats - shown on task views */}
              {(activeTab === 'today' || activeTab === 'week' || activeTab === 'all') && (
                <TaskStatsDisplay stats={stats} />
              )}

              {/* Today View */}
              <TabsContent value="today" className="mt-0 space-y-6">
                {/* Suggested Actions */}
                {suggestedActions.length > 0 && (
                  <SuggestedActions
                    actions={suggestedActions}
                    onAccept={handleAcceptAction}
                    onDismiss={handleDismissAction}
                  />
                )}

                {/* Filters */}
                <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />

                {/* Task List */}
                <TaskList
                  tasks={tasks}
                  onApprove={handleApproveTask}
                  onReject={handleRejectTask}
                  onMarkComplete={handleMarkComplete}
                  emptyMessage="No tasks due today. You're all caught up!"
                />
              </TabsContent>

              {/* This Week View */}
              <TabsContent value="week" className="mt-0 space-y-6">
                {/* Suggested Actions */}
                {suggestedActions.length > 0 && (
                  <SuggestedActions
                    actions={suggestedActions}
                    onAccept={handleAcceptAction}
                    onDismiss={handleDismissAction}
                  />
                )}

                {/* Filters */}
                <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />

                {/* Task List */}
                <TaskList
                  tasks={tasks}
                  onApprove={handleApproveTask}
                  onReject={handleRejectTask}
                  onMarkComplete={handleMarkComplete}
                  emptyMessage="No tasks due this week."
                />
              </TabsContent>

              {/* All Tasks View */}
              <TabsContent value="all" className="mt-0 space-y-6">
                {/* Filters */}
                <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />

                {/* Task List */}
                <TaskList
                  tasks={tasks}
                  onApprove={handleApproveTask}
                  onReject={handleRejectTask}
                  onMarkComplete={handleMarkComplete}
                  emptyMessage="No tasks found matching your criteria."
                />
              </TabsContent>

              {/* Workflows View */}
              <TabsContent value="workflows" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Workflows */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Active Workflows</h2>
                    {workflows.length > 0 ? (
                      <WorkflowList workflows={workflows} maxDisplay={10} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No active workflows
                      </div>
                    )}
                  </div>

                  {/* Prefilled Materials */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Prefilled Materials</h2>
                    {materials.length > 0 ? (
                      <PrefilledMaterials
                        materials={materials}
                        onViewMaterial={handleViewMaterial}
                        onDownloadMaterial={handleDownloadMaterial}
                      />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No prefilled materials available
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Insights View */}
              <TabsContent value="insights" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Process Recommendations */}
                  <RecommendationsPanel
                    recommendations={recommendations}
                    onApply={handleApplyRecommendation}
                    onDismiss={handleDismissRecommendation}
                    onRevert={handleRevertRecommendation}
                  />

                  {/* Cycle Time Stats */}
                  <CycleTimeList stats={cycleTimeStats} />
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
