'use client';

import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ActivityFilters, ActivityCategory, ActivityActor } from '@/types/activity';
import { ACTIVITY_CATEGORY_LABELS } from '@/types/activity';

// ============================================================================
// Activity Filters Component
// ============================================================================

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
}

export function ActivityFiltersComponent({ filters, onFiltersChange }: ActivityFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      onFiltersChange({ ...filters, categories: undefined });
    } else {
      onFiltersChange({ ...filters, categories: [category as ActivityCategory] });
    }
  };

  const handleActorToggle = (actor: ActivityActor, checked: boolean) => {
    const currentActors = filters.actors || [];
    const newActors = checked
      ? [...currentActors, actor]
      : currentActors.filter(a => a !== actor);
    onFiltersChange({
      ...filters,
      actors: newActors.length > 0 ? newActors : undefined,
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      [type === 'start' ? 'startDate' : 'endDate']: value || undefined,
    });
  };

  const handleToggleChange = (field: 'isImportant' | 'isError', checked: boolean) => {
    onFiltersChange({
      ...filters,
      [field]: checked || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = [
    filters.search,
    filters.categories?.length,
    filters.actors?.length,
    filters.startDate,
    filters.endDate,
    filters.isImportant,
    filters.isError,
  ].filter(Boolean).length;

  const selectedCategory = filters.categories?.[0] || 'all';

  return (
    <div className="space-y-4">
      {/* Main filters row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(ACTIVITY_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced filters toggle */}
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Advanced Filters</h4>

              {/* Actor filters */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Actor</Label>
                <div className="flex flex-wrap gap-4">
                  {(['user', 'automation', 'system'] as ActivityActor[]).map((actor) => (
                    <div key={actor} className="flex items-center gap-2">
                      <Checkbox
                        id={`actor-${actor}`}
                        checked={filters.actors?.includes(actor) || false}
                        onCheckedChange={(checked) => handleActorToggle(actor, checked as boolean)}
                      />
                      <Label htmlFor={`actor-${actor}`} className="text-sm capitalize">
                        {actor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start-date" className="text-xs">From</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs">To</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Show Only</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="important-only"
                      checked={filters.isImportant || false}
                      onCheckedChange={(checked) => handleToggleChange('isImportant', checked as boolean)}
                    />
                    <Label htmlFor="important-only" className="text-sm">
                      Important
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="errors-only"
                      checked={filters.isError || false}
                      onCheckedChange={(checked) => handleToggleChange('isError', checked as boolean)}
                    />
                    <Label htmlFor="errors-only" className="text-sm">
                      Errors
                    </Label>
                  </div>
                </div>
              </div>

              {/* Clear button */}
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {ACTIVITY_CATEGORY_LABELS[category]}
              <button
                onClick={() => handleCategoryChange('all')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.actors?.map((actor) => (
            <Badge key={actor} variant="secondary" className="gap-1 capitalize">
              {actor}
              <button
                onClick={() => handleActorToggle(actor, false)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              From: {filters.startDate}
              <button
                onClick={() => handleDateRangeChange('start', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="gap-1">
              To: {filters.endDate}
              <button
                onClick={() => handleDateRangeChange('end', '')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.isImportant && (
            <Badge variant="secondary" className="gap-1">
              Important Only
              <button
                onClick={() => handleToggleChange('isImportant', false)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.isError && (
            <Badge variant="secondary" className="gap-1">
              Errors Only
              <button
                onClick={() => handleToggleChange('isError', false)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
