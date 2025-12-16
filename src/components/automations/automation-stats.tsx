'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Play,
  Pause,
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { AutomationStats } from '@/types/automation';

interface AutomationStatsDisplayProps {
  stats: AutomationStats;
}

export function AutomationStatsDisplay({ stats }: AutomationStatsDisplayProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
          <Lightbulb className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingSuggestions}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting your review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
          <Zap className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Play className="h-3 w-3 mr-1" />
              {stats.runningAutomations} Running
            </Badge>
            {stats.pausedAutomations > 0 && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <Pause className="h-3 w-3 mr-1" />
                {stats.pausedAutomations} Paused
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalActive} total configured
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingExceptions}</div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          <Clock className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.timeSavedThisWeek >= 60
              ? `${Math.floor(stats.timeSavedThisWeek / 60)}h ${stats.timeSavedThisWeek % 60}m`
              : `${stats.timeSavedThisWeek}m`}
          </div>
          <p className="text-xs text-muted-foreground">
            This week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface AutomationBreakdownProps {
  stats: AutomationStats;
}

export function AutomationBreakdown({ stats }: AutomationBreakdownProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalRunsToday}</div>
          <p className="text-xs text-muted-foreground">
            Automation runs today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.successRateToday}%</div>
          <p className="text-xs text-muted-foreground">
            Today's success rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Total Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalSuggestions}</div>
          <p className="text-xs text-muted-foreground">
            Detected patterns
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
