'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  AlertTriangle,
  Brain,
  History,
} from 'lucide-react';
import {
  AutomationStatsDisplay,
  AutomationBreakdown,
  SuggestionList,
  ActiveAutomationList,
  SafetyBoundsEditor,
  ExceptionList,
  AdaptationLogs,
  ActivityLog,
  ActivityHistoryDialogContent,
} from '@/components/automations';
import {
  getAutomationSuggestions,
  getActiveAutomations,
  getAutomationExceptions,
  getAdaptationLogs,
  getAutomationActivity,
  getAutomationStats,
  approveAutomationSuggestion,
  rejectAutomationSuggestion,
  pauseAutomation,
  resumeAutomation,
  updateSafetyBounds,
  resolveException,
  ignoreException,
  getActiveAutomationById,
} from '@/lib/mock-data';
import type {
  AutomationSuggestion,
  ActiveAutomation,
  AutomationException,
  AdaptationLogEntry,
  AutomationActivityEntry,
  AutomationStats,
  SafetyBounds,
} from '@/types/automation';
import { useRouter } from 'next/navigation';

type TabValue = 'suggestions' | 'active' | 'exceptions' | 'insights';

export default function AutomationsPage() {
  const router = useRouter();

  // State
  const [suggestions, setSuggestions] = useState<AutomationSuggestion[]>([]);
  const [activeAutomations, setActiveAutomations] = useState<ActiveAutomation[]>([]);
  const [exceptions, setExceptions] = useState<AutomationException[]>([]);
  const [adaptationLogs, setAdaptationLogs] = useState<AdaptationLogEntry[]>([]);
  const [activityLog, setActivityLog] = useState<AutomationActivityEntry[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('suggestions');

  // Dialog state
  const [showBoundsEditor, setShowBoundsEditor] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<ActiveAutomation | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyAutomationId, setHistoryAutomationId] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(() => {
    setSuggestions(getAutomationSuggestions('pending'));
    setActiveAutomations(getActiveAutomations());
    setExceptions(getAutomationExceptions());
    setAdaptationLogs(getAdaptationLogs(10));
    setActivityLog(getAutomationActivity(undefined, 20));
    setStats(getAutomationStats());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Suggestion handlers
  const handleApproveSuggestion = useCallback((id: string) => {
    approveAutomationSuggestion(id);
    loadData();
  }, [loadData]);

  const handleRejectSuggestion = useCallback((id: string) => {
    rejectAutomationSuggestion(id);
    loadData();
  }, [loadData]);

  // Automation handlers
  const handlePauseAutomation = useCallback((id: string) => {
    pauseAutomation(id);
    loadData();
  }, [loadData]);

  const handleResumeAutomation = useCallback((id: string) => {
    resumeAutomation(id);
    loadData();
  }, [loadData]);

  const handleEditBounds = useCallback((id: string) => {
    const automation = getActiveAutomationById(id);
    if (automation) {
      setSelectedAutomation(automation);
      setShowBoundsEditor(true);
    }
  }, []);

  const handleSaveBounds = useCallback((id: string, bounds: SafetyBounds) => {
    updateSafetyBounds(id, bounds);
    loadData();
  }, [loadData]);

  const handleViewHistory = useCallback((id: string) => {
    setHistoryAutomationId(id);
    setShowHistoryDialog(true);
  }, []);

  // Exception handlers
  const handleResolveException = useCallback((id: string, resolution: string) => {
    resolveException(id, resolution);
    loadData();
  }, [loadData]);

  const handleIgnoreException = useCallback((id: string) => {
    ignoreException(id);
    loadData();
  }, [loadData]);

  // Navigation handler
  const handleViewClient = useCallback((clientId: string) => {
    router.push(`/clients/${clientId}`);
  }, [router]);

  // Get counts for tabs
  const pendingSuggestionsCount = suggestions.length;
  const activeCount = activeAutomations.length;
  const pendingExceptionsCount = exceptions.filter(e => e.status === 'pending').length;

  // Get history data for dialog
  const historyAutomation = historyAutomationId
    ? getActiveAutomationById(historyAutomationId)
    : null;
  const historyActivity = historyAutomationId
    ? getAutomationActivity(historyAutomationId)
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Automation Review & Control</h1>
            <p className="text-muted-foreground text-sm">
              Manage AI-powered automations and handle exceptions
            </p>
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
            <AutomationStatsDisplay stats={stats} />
            {showBreakdown && <AutomationBreakdown stats={stats} />}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="suggestions" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggestions
              {pendingSuggestionsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingSuggestionsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Zap className="h-4 w-4" />
              Active
              <Badge variant="secondary" className="text-xs">
                {activeCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Exceptions
              {pendingExceptionsCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {pendingExceptionsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Suggested Automations</h3>
                <p className="text-sm text-muted-foreground">
                  Ciri has detected these patterns in your work. Approve to automate them.
                </p>
              </div>
              <SuggestionList
                suggestions={suggestions}
                onApprove={handleApproveSuggestion}
                onReject={handleRejectSuggestion}
              />
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Active Automations</h3>
                <p className="text-sm text-muted-foreground">
                  These automations are running on your behalf. Pause or configure them as needed.
                </p>
              </div>
              <ActiveAutomationList
                automations={activeAutomations}
                onPause={handlePauseAutomation}
                onResume={handleResumeAutomation}
                onEditBounds={handleEditBounds}
                onViewHistory={handleViewHistory}
              />
            </div>
          </TabsContent>

          <TabsContent value="exceptions" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Exception Queue</h3>
                <p className="text-sm text-muted-foreground">
                  These items need your attention. Resolve or ignore exceptions as appropriate.
                </p>
              </div>
              <ExceptionList
                exceptions={exceptions}
                onResolve={handleResolveException}
                onIgnore={handleIgnoreException}
                onViewClient={handleViewClient}
              />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Adaptation Log</h3>
                <AdaptationLogs logs={adaptationLogs} maxHeight="500px" />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <ActivityLog
                  activities={activityLog}
                  onViewLink={(type, id) => {
                    if (type === 'client') {
                      handleViewClient(id);
                    }
                  }}
                  maxHeight="500px"
                  showHeader={false}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Safety Bounds Editor */}
      <SafetyBoundsEditor
        open={showBoundsEditor}
        onOpenChange={setShowBoundsEditor}
        automation={selectedAutomation}
        onSave={handleSaveBounds}
      />

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Automation History
            </DialogTitle>
            <DialogDescription>
              {historyAutomation?.name || 'Automation'} run history
            </DialogDescription>
          </DialogHeader>
          <ActivityHistoryDialogContent
            activities={historyActivity}
            automationName={historyAutomation?.name || ''}
            onViewLink={(type, id) => {
              if (type === 'client') {
                handleViewClient(id);
                setShowHistoryDialog(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
