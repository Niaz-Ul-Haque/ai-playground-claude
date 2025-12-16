'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OpportunityFilters } from '@/types/opportunity';
import {
  OPPORTUNITY_TYPE_LABELS,
  IMPACT_LEVEL_LABELS,
  READINESS_LABELS,
  STATUS_LABELS,
} from '@/types/opportunity';
import { Search, X, Filter } from 'lucide-react';

interface OpportunityFiltersComponentProps {
  filters: OpportunityFilters;
  onFiltersChange: (filters: OpportunityFilters) => void;
  showAdvanced?: boolean;
}

export function OpportunityFiltersComponent({
  filters,
  onFiltersChange,
  showAdvanced = false,
}: OpportunityFiltersComponentProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as OpportunityFilters['type']),
    });
  };

  const handleImpactChange = (value: string) => {
    onFiltersChange({
      ...filters,
      impactLevel: value === 'all' ? undefined : (value as OpportunityFilters['impactLevel']),
    });
  };

  const handleReadinessChange = (value: string) => {
    onFiltersChange({
      ...filters,
      readiness: value === 'all' ? undefined : (value as OpportunityFilters['readiness']),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as OpportunityFilters['status']),
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as OpportunityFilters['sortBy'],
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.type ||
    filters.impactLevel ||
    filters.readiness ||
    filters.status ||
    filters.searchTerm;

  return (
    <div className="space-y-4">
      {/* Search and Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Impact Filter */}
        <Select value={filters.impactLevel || 'all'} onValueChange={handleImpactChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact</SelectItem>
            {Object.entries(IMPACT_LEVEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sortBy || 'impact'} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="impact">Impact Score</SelectItem>
            <SelectItem value="date">Date Surfaced</SelectItem>
            <SelectItem value="expiry">Expiry Date</SelectItem>
            <SelectItem value="client">Client Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Readiness Filter */}
          <Select value={filters.readiness || 'all'} onValueChange={handleReadinessChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Readiness" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Readiness</SelectItem>
              {Object.entries(READINESS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filters.type && (
            <FilterBadge
              label={`Type: ${OPPORTUNITY_TYPE_LABELS[filters.type]}`}
              onRemove={() => onFiltersChange({ ...filters, type: undefined })}
            />
          )}
          {filters.impactLevel && (
            <FilterBadge
              label={`Impact: ${IMPACT_LEVEL_LABELS[filters.impactLevel]}`}
              onRemove={() => onFiltersChange({ ...filters, impactLevel: undefined })}
            />
          )}
          {filters.readiness && (
            <FilterBadge
              label={`Readiness: ${READINESS_LABELS[filters.readiness]}`}
              onRemove={() => onFiltersChange({ ...filters, readiness: undefined })}
            />
          )}
          {filters.status && (
            <FilterBadge
              label={`Status: ${STATUS_LABELS[filters.status]}`}
              onRemove={() => onFiltersChange({ ...filters, status: undefined })}
            />
          )}
          {filters.searchTerm && (
            <FilterBadge
              label={`Search: "${filters.searchTerm}"`}
              onRemove={() => onFiltersChange({ ...filters, searchTerm: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface FilterBadgeProps {
  label: string;
  onRemove: () => void;
}

function FilterBadge({ label, onRemove }: FilterBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
