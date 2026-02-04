'use client';

import { useState } from 'react';
import type { DashboardCardData, ChartCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { Sparkline } from '@/components/ui/charts';
import { ChartCard } from './chart-card';
import { formatCurrency } from '@/lib/utils/format';

interface DashboardCardProps {
  data: DashboardCardData;
}

export function DashboardCard({ data }: DashboardCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(data.period);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // In a real implementation, this would trigger a data refresh
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatValue = (value: number | string, format?: string): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getChangeIndicator = (change?: number) => {
    if (change === undefined || change === null) return null;
    
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{change.toFixed(1)}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{change.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-medium">0%</span>
        </div>
      );
    }
  };

  return (
    <Card className="my-4 border-l-4 border-l-violet-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-violet-500" />
            <CardTitle className="text-lg">{data.title || 'Dashboard'}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            {data.available_periods && data.available_periods.length > 0 && (
              <div className="flex gap-1">
                {data.available_periods.map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePeriodChange(period)}
                    className="px-2 py-1 h-7 text-xs"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          Period: {selectedPeriod}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 bg-muted/30 rounded-lg border"
            >
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format)}
                  </p>
                  {getChangeIndicator(metric.change)}
                  {metric.change_period && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      vs {metric.change_period}
                    </p>
                  )}
                </div>
                {metric.sparkline && metric.sparkline.length > 0 && (
                  <div className="w-20 h-10">
                    <Sparkline
                      data={metric.sparkline}
                      color={metric.change && metric.change >= 0 ? '#22c55e' : '#ef4444'}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {data.charts && data.charts.length > 0 && (
          <div className="space-y-4">
            {data.charts.map((chartData: ChartCardData, idx: number) => (
              <ChartCard key={idx} data={chartData} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
