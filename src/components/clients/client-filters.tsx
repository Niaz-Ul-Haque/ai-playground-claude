'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, X } from 'lucide-react';
import type { ClientFilters } from '@/lib/mock-data';

interface ClientFiltersProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
}

const riskProfiles = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' },
];

const portfolioRanges = [
  { value: '0-500000', label: 'Under $500K', min: 0, max: 500000 },
  { value: '500000-1000000', label: '$500K - $1M', min: 500000, max: 1000000 },
  { value: '1000000-2000000', label: '$1M - $2M', min: 1000000, max: 2000000 },
  { value: '2000000+', label: 'Over $2M', min: 2000000, max: undefined },
];

const commonTags = [
  'retirement-planning',
  'tax-optimization',
  'estate-planning',
  'education-planning',
  'high-value',
  'esg-interest',
];

export function ClientFiltersComponent({ filters, onFiltersChange }: ClientFiltersProps) {
  const activeFilterCount = [
    filters.riskProfile,
    filters.minPortfolioValue !== undefined || filters.maxPortfolioValue !== undefined,
    filters.tags && filters.tags.length > 0,
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, name: value || undefined });
  };

  const handleRiskProfileChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, riskProfile: value });
  };

  const handlePortfolioRangeChange = (range: typeof portfolioRanges[0] | null) => {
    if (range) {
      onFiltersChange({
        ...filters,
        minPortfolioValue: range.min,
        maxPortfolioValue: range.max,
      });
    } else {
      onFiltersChange({
        ...filters,
        minPortfolioValue: undefined,
        maxPortfolioValue: undefined,
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({ name: filters.name });
  };

  const getCurrentPortfolioRange = () => {
    if (filters.minPortfolioValue === undefined && filters.maxPortfolioValue === undefined) {
      return null;
    }
    return portfolioRanges.find(
      (r) => r.min === filters.minPortfolioValue && r.max === filters.maxPortfolioValue
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or email..."
            value={filters.name || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Risk Profile</DropdownMenuLabel>
            {riskProfiles.map((profile) => (
              <DropdownMenuCheckboxItem
                key={profile.value}
                checked={filters.riskProfile === profile.value}
                onCheckedChange={(checked) =>
                  handleRiskProfileChange(checked ? profile.value : undefined)
                }
              >
                {profile.label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Portfolio Value</DropdownMenuLabel>
            {portfolioRanges.map((range) => (
              <DropdownMenuCheckboxItem
                key={range.value}
                checked={getCurrentPortfolioRange()?.value === range.value}
                onCheckedChange={(checked) =>
                  handlePortfolioRangeChange(checked ? range : null)
                }
              >
                {range.label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Tags</DropdownMenuLabel>
            {commonTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={filters.tags?.includes(tag) || false}
                onCheckedChange={() => handleTagToggle(tag)}
              >
                {tag.replace(/-/g, ' ')}
              </DropdownMenuCheckboxItem>
            ))}

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.riskProfile && (
            <Badge variant="secondary" className="gap-1">
              {filters.riskProfile}
              <button
                onClick={() => handleRiskProfileChange(undefined)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {getCurrentPortfolioRange() && (
            <Badge variant="secondary" className="gap-1">
              {getCurrentPortfolioRange()!.label}
              <button
                onClick={() => handlePortfolioRangeChange(null)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag.replace(/-/g, ' ')}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
