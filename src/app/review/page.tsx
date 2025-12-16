'use client';

import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ReviewStatsDisplay,
  ReviewBreakdown,
  ReviewFilters,
  ReviewList,
  BatchActions,
  BatchResults,
  ComparisonView,
} from '@/components/review';
import {
  getReviewQueue,
  getReviewQueueStats,
  updateReviewItem,
  batchUpdateReviewItems,
  getClientById,
} from '@/lib/mock-data';
import type {
  ReviewQueueFilters,
  ReviewQueueItem,
  BatchOperation,
  BatchOperationResult,
} from '@/types/review-queue';
import { ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';

export default function ReviewQueuePage() {
  // State
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [filters, setFilters] = useState<ReviewQueueFilters>({
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [batchResults, setBatchResults] = useState<{
    results: BatchOperationResult;
    operation: BatchOperation;
  } | null>(null);
  const [comparisonItem, setComparisonItem] = useState<ReviewQueueItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data fetching
  const stats = useMemo(() => getReviewQueueStats(), [refreshKey]);

  const items = useMemo(() => {
    const tabFilters: ReviewQueueFilters = {
      ...filters,
      status: activeTab === 'all' ? undefined : activeTab as ReviewQueueFilters['status'],
    };
    return getReviewQueue(tabFilters);
  }, [activeTab, filters, refreshKey]);

  // Filter only pending items for selection
  const pendingItems = useMemo(
    () => items.filter((item) => item.status === 'pending'),
    [items]
  );

  const highConfidenceCount = useMemo(
    () => pendingItems.filter((item) => item.confidenceLevel === 'high').length,
    [pendingItems]
  );

  // Handlers
  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setSelectedIds(new Set());
    setBatchResults(null);
  }, []);

  const handleSelectChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(pendingItems.map((item) => item.id)));
  }, [pendingItems]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleApprove = useCallback((id: string) => {
    updateReviewItem(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
    });
    refreshData();
  }, [refreshData]);

  const handleReject = useCallback((id: string) => {
    updateReviewItem(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
    });
    refreshData();
  }, [refreshData]);

  const handleEdit = useCallback((id: string) => {
    // For MVP, we'll just approve with edit status
    updateReviewItem(id, {
      status: 'edited',
      reviewedAt: new Date().toISOString(),
      reviewNotes: 'Edited during review',
    });
    refreshData();
  }, [refreshData]);

  const handleReassign = useCallback((id: string, clientId: string) => {
    const client = getClientById(clientId);
    if (client) {
      updateReviewItem(id, {
        suggestedClientId: clientId,
        suggestedClientName: client.name,
        matchReason: 'Manually reassigned',
      });
      refreshData();
    }
  }, [refreshData]);

  const handleViewComparison = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setComparisonItem(item);
    }
  }, [items]);

  const handleBatchOperation = useCallback((operation: BatchOperation) => {
    const results = batchUpdateReviewItems(
      Array.from(selectedIds),
      operation === 'approve' ? 'approved' : operation === 'reject' ? 'rejected' : 'merged'
    );
    setBatchResults({ results, operation });
    setSelectedIds(new Set());
    setRefreshKey((prev) => prev + 1);
  }, [selectedIds]);

  // Get existing client data for comparison
  const getExistingClientData = useCallback((item: ReviewQueueItem) => {
    if (!item.suggestedClientId) return {};
    const client = getClientById(item.suggestedClientId);
    if (!client) return {};
    return {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      portfolioValue: client.portfolioValue,
      riskProfile: client.riskProfile,
    };
  }, []);

  // Tab counts
  const tabCounts = {
    pending: stats.pending,
    approved: stats.approved,
    rejected: stats.rejected,
    all: stats.total,
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Review Queue</h1>
          <p className="text-muted-foreground">
            Review AI-extracted data and approve matches
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <ReviewStatsDisplay stats={stats} />

      {/* Breakdown toggle */}
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        <span className="text-sm font-medium">
          {showBreakdown ? 'Hide breakdown' : 'Show breakdown by source and type'}
        </span>
        {showBreakdown ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {showBreakdown && <ReviewBreakdown stats={stats} />}

      {/* Batch results */}
      {batchResults && (
        <BatchResults
          results={batchResults.results}
          operation={batchResults.operation}
          onDismiss={() => setBatchResults(null)}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {tabCounts.pending > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 px-1.5 text-xs bg-amber-100 text-amber-800"
              >
                {tabCounts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {tabCounts.approved > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 px-1.5 text-xs bg-green-100 text-green-800"
              >
                {tabCounts.approved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {tabCounts.rejected > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 px-1.5 text-xs"
              >
                {tabCounts.rejected}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            All
            <Badge
              variant="secondary"
              className="ml-2 h-5 px-1.5 text-xs"
            >
              {tabCounts.all}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="mt-4">
          <ReviewFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Batch actions for pending tab */}
        {activeTab === 'pending' && pendingItems.length > 0 && (
          <div className="mt-4">
            <BatchActions
              selectedCount={selectedIds.size}
              totalCount={pendingItems.length}
              highConfidenceCount={highConfidenceCount}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBatchOperation={handleBatchOperation}
            />
          </div>
        )}

        {/* Content */}
        <TabsContent value={activeTab} className="mt-4">
          <ReviewList
            items={items}
            selectedIds={selectedIds}
            onSelectChange={handleSelectChange}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
            onReassign={handleReassign}
            onViewComparison={handleViewComparison}
          />
        </TabsContent>
      </Tabs>

      {/* Comparison dialog */}
      {comparisonItem && (
        <ComparisonView
          item={comparisonItem}
          existingData={getExistingClientData(comparisonItem)}
          open={!!comparisonItem}
          onOpenChange={(open) => !open && setComparisonItem(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
