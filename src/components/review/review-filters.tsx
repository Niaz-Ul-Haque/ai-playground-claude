'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ReviewQueueFilters,
  ReviewSourceType,
  ReviewItemType,
  ConfidenceLevel,
  ReviewItemStatus,
} from '@/types/review-queue';
import {
  REVIEW_SOURCE_LABELS,
  REVIEW_ITEM_TYPE_LABELS,
  CONFIDENCE_LEVEL_LABELS,
  REVIEW_STATUS_LABELS,
} from '@/types/review-queue';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface ReviewFiltersProps {
  filters: ReviewQueueFilters;
  onFiltersChange: (filters: ReviewQueueFilters) => void;
}

export function ReviewFilters({ filters, onFiltersChange }: ReviewFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof ReviewQueueFilters>(
    key: K,
    value: ReviewQueueFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const activeFilterCount = [
    filters.status,
    filters.sourceType,
    filters.type,
    filters.confidenceLevel,
    filters.searchTerm,
    filters.dateRange && filters.dateRange !== 'all',
  ].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Main filters row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by source, client, or content..."
                value={filters.searchTerm || ''}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Confidence */}
            <Select
              value={filters.confidenceLevel || 'all'}
              onValueChange={(value) =>
                updateFilter('confidenceLevel', value === 'all' ? undefined : value as ConfidenceLevel)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                {Object.entries(CONFIDENCE_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source Type */}
            <Select
              value={filters.sourceType || 'all'}
              onValueChange={(value) =>
                updateFilter('sourceType', value === 'all' ? undefined : value as ReviewSourceType)
              }
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(REVIEW_SOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${filters.sortBy || 'date'}-${filters.sortOrder || 'desc'}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [
                  ReviewQueueFilters['sortBy'],
                  ReviewQueueFilters['sortOrder']
                ];
                onFiltersChange({ ...filters, sortBy, sortOrder });
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="confidence-desc">Highest Confidence</SelectItem>
                <SelectItem value="confidence-asc">Lowest Confidence</SelectItem>
                <SelectItem value="source-asc">Source A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t">
              {/* Status */}
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  updateFilter('status', value === 'all' ? undefined : value as ReviewItemStatus)
                }
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Item Type */}
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) =>
                  updateFilter('type', value === 'all' ? undefined : value as ReviewItemType)
                }
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(REVIEW_ITEM_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={(value) =>
                  updateFilter('dateRange', value as ReviewQueueFilters['dateRange'])
                }
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('searchTerm', undefined)}
                  />
                </Badge>
              )}

              {filters.confidenceLevel && (
                <Badge variant="secondary" className="gap-1">
                  {CONFIDENCE_LEVEL_LABELS[filters.confidenceLevel]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('confidenceLevel', undefined)}
                  />
                </Badge>
              )}

              {filters.sourceType && (
                <Badge variant="secondary" className="gap-1">
                  {REVIEW_SOURCE_LABELS[filters.sourceType]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('sourceType', undefined)}
                  />
                </Badge>
              )}

              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  {REVIEW_STATUS_LABELS[filters.status]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('status', undefined)}
                  />
                </Badge>
              )}

              {filters.type && (
                <Badge variant="secondary" className="gap-1">
                  {REVIEW_ITEM_TYPE_LABELS[filters.type]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('type', undefined)}
                  />
                </Badge>
              )}

              {filters.dateRange && filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.dateRange.charAt(0).toUpperCase() + filters.dateRange.slice(1)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('dateRange', 'all')}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
