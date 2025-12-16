'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { OpportunityStats } from '@/types/opportunity';
import { TrendingUp, Clock, AlertCircle, DollarSign } from 'lucide-react';

interface OpportunityStatsDisplayProps {
  stats: OpportunityStats;
}

export function OpportunityStatsDisplay({ stats }: OpportunityStatsDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const activeCount = stats.byStatus.new + stats.byStatus.viewed;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Active Opportunities */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-blue-600">{stats.byStatus.new} new</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-gray-600">{stats.byStatus.viewed} viewed</span>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Value */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalEstimatedValue)}</p>
              <p className="text-xs text-muted-foreground">Potential Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready to Action */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.byReadiness.ready}</p>
              <p className="text-xs text-muted-foreground">Ready to Action</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {stats.byReadiness.needs_prep} need prep
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.expiringThisWeek}</p>
              <p className="text-xs text-muted-foreground">Expiring This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface OpportunityBreakdownProps {
  stats: OpportunityStats;
}

export function OpportunityBreakdown({ stats }: OpportunityBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* By Type */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-3">By Type</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm">Contract</span>
              </div>
              <span className="text-sm font-medium">{stats.byType.contract}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm">Milestone</span>
              </div>
              <span className="text-sm font-medium">{stats.byType.milestone}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Market</span>
              </div>
              <span className="text-sm font-medium">{stats.byType.market}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By Impact */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-3">By Impact</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm">High</span>
              </div>
              <span className="text-sm font-medium">{stats.byImpact.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm">Medium</span>
              </div>
              <span className="text-sm font-medium">{stats.byImpact.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-sm">Low</span>
              </div>
              <span className="text-sm font-medium">{stats.byImpact.low}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-3">By Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">New</span>
              <span className="text-sm font-medium text-blue-600">{stats.byStatus.new}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Snoozed</span>
              <span className="text-sm font-medium text-yellow-600">{stats.byStatus.snoozed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Actioned</span>
              <span className="text-sm font-medium text-green-600">{stats.byStatus.actioned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dismissed</span>
              <span className="text-sm font-medium text-gray-500">{stats.byStatus.dismissed}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
