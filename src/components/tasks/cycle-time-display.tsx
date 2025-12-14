'use client';

import React from 'react';
import type { CycleTimeStats } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CycleTimeDisplayProps {
  stats: CycleTimeStats;
  currentMinutes?: number;
}

const getTrendIcon = (trend: CycleTimeStats['trend']) => {
  switch (trend) {
    case 'improving':
      return TrendingDown;
    case 'declining':
      return TrendingUp;
    default:
      return Minus;
  }
};

const getTrendColor = (trend: CycleTimeStats['trend']) => {
  switch (trend) {
    case 'improving':
      return 'text-green-500';
    case 'declining':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export function CycleTimeCard({ stats, currentMinutes }: CycleTimeDisplayProps) {
  const TrendIcon = getTrendIcon(stats.trend);
  const percentile = currentMinutes
    ? Math.min(100, Math.round((currentMinutes / stats.maxMinutes) * 100))
    : undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Timer className="h-4 w-4" />
          Cycle Time: {stats.taskType.replace(/-/g, ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current vs Average */}
        {currentMinutes !== undefined && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{formatMinutes(currentMinutes)}</p>
              <p className="text-xs text-muted-foreground">Current task</p>
            </div>
            <div className="text-right">
              <p className="text-lg text-muted-foreground">
                {formatMinutes(stats.averageMinutes)}
              </p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
          </div>
        )}

        {/* Progress against range */}
        {percentile !== undefined && (
          <div className="space-y-1">
            <Progress value={percentile} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatMinutes(stats.minMinutes)}</span>
              <span>{formatMinutes(stats.maxMinutes)}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold">{formatMinutes(stats.minMinutes)}</p>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold">{formatMinutes(stats.averageMinutes)}</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold">{formatMinutes(stats.maxMinutes)}</p>
            <p className="text-xs text-muted-foreground">Longest</p>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            Based on {stats.sampleSize} tasks
          </span>
          <div className={cn('flex items-center gap-1 text-sm', getTrendColor(stats.trend))}>
            <TrendIcon className="h-4 w-4" />
            <span className="capitalize">{stats.trend}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CycleTimeListProps {
  stats: CycleTimeStats[];
}

export function CycleTimeList({ stats }: CycleTimeListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Cycle Time Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((stat) => {
            const TrendIcon = getTrendIcon(stat.trend);
            return (
              <div
                key={stat.taskType}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm capitalize">
                      {stat.taskType.replace(/-/g, ' ')}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn('text-xs gap-1', getTrendColor(stat.trend))}
                    >
                      <TrendIcon className="h-3 w-3" />
                      {stat.trend}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.sampleSize} tasks tracked
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMinutes(stat.averageMinutes)}</p>
                  <p className="text-xs text-muted-foreground">average</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
