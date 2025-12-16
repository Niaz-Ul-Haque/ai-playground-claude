'use client';

import { useState, useMemo } from 'react';
import { Download, RefreshCw, Bell, AlertCircle, CheckCircle2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityTimeline, ActivityFiltersComponent } from '@/components/activity';
import { mockActivityEntries, mockActivityStats } from '@/lib/mock-data/activity';
import type { ActivityFilters, ActivityEntry } from '@/types/activity';
import { ACTIVITY_TYPE_CATEGORIES } from '@/types/activity';

// ============================================================================
// Stats Cards
// ============================================================================

function ActivityStats() {
  const stats = mockActivityStats;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEntries}</div>
          <p className="text-xs text-muted-foreground">
            {stats.entriesThisWeek} this week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">User Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byActor.user}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.byActor.user / stats.totalEntries) * 100).toFixed(0)}% of total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Automations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byActor.automation + stats.byActor.system}</div>
          <p className="text-xs text-muted-foreground">
            System & automation actions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.errorCount}</div>
          <p className="text-xs text-muted-foreground">
            {stats.importantCount} important items
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Quick Stats Sidebar
// ============================================================================

function QuickStats() {
  const stats = mockActivityStats;
  const topCategories = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">By Category</p>
          {topCategories.map(([category, count]) => (
            <div key={category} className="flex justify-between text-sm">
              <span className="capitalize">{category}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground font-medium">By Actor</p>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              You
            </span>
            <span className="text-muted-foreground">{stats.byActor.user}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-500" />
              Automation
            </span>
            <span className="text-muted-foreground">{stats.byActor.automation}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              System
            </span>
            <span className="text-muted-foreground">{stats.byActor.system}</span>
          </div>
        </div>

        {stats.errorCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{stats.errorCount} errors need attention</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Activity Page
// ============================================================================

export default function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFilters>({});

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    let entries: ActivityEntry[] = [...mockActivityEntries];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      entries = entries.filter(e =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.clientName?.toLowerCase().includes(searchLower) ||
        e.automationName?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      entries = entries.filter(e => {
        const entryCategory = ACTIVITY_TYPE_CATEGORIES[e.type];
        return filters.categories!.includes(entryCategory);
      });
    }

    // Actor filter
    if (filters.actors && filters.actors.length > 0) {
      entries = entries.filter(e => filters.actors!.includes(e.actor));
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      entries = entries.filter(e => new Date(e.timestamp) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      entries = entries.filter(e => new Date(e.timestamp) <= endDate);
    }

    // Important filter
    if (filters.isImportant) {
      entries = entries.filter(e => e.isImportant);
    }

    // Error filter
    if (filters.isError) {
      entries = entries.filter(e => e.isError);
    }

    return entries;
  }, [filters]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            View system actions, audit trail, and historical activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ActivityStats />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Activity Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <ActivityFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />

          <div className="text-sm text-muted-foreground">
            Showing {filteredEntries.length} of {mockActivityEntries.length} entries
          </div>

          <ActivityTimeline entries={filteredEntries} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickStats />
        </div>
      </div>
    </div>
  );
}
