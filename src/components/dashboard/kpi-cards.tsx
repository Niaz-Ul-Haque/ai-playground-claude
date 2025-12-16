'use client';

import { TrendingUp, TrendingDown, Minus, Users, DollarSign, Target, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { KPIMetric, KPICategory } from '@/types/analytics';

// ============================================================================
// Category Icons
// ============================================================================

const categoryIcons: Record<KPICategory, React.ElementType> = {
  clients: Users,
  revenue: DollarSign,
  pipeline: Target,
  performance: Activity,
  engagement: Clock,
};

// ============================================================================
// Single KPI Card
// ============================================================================

interface KPICardProps {
  metric: KPIMetric;
  onClick?: () => void;
  isSelected?: boolean;
}

export function KPICard({ metric, onClick, isSelected }: KPICardProps) {
  const Icon = categoryIcons[metric.category] || Activity;

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    // For response time, down is good
    if (metric.name.toLowerCase().includes('response time') || metric.name.toLowerCase().includes('cycle time')) {
      return metric.trend === 'down' ? 'text-green-600' : metric.trend === 'up' ? 'text-red-600' : 'text-gray-600';
    }
    // For most metrics, up is good
    return metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.name}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.formattedValue}</div>
        {metric.changePercent !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs mt-1', getTrendColor())}>
            {getTrendIcon()}
            <span>
              {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}% from last period
            </span>
          </div>
        )}
        {metric.description && (
          <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// KPI Grid
// ============================================================================

interface KPIGridProps {
  metrics: KPIMetric[];
  selectedMetricId?: string;
  onMetricSelect?: (metric: KPIMetric) => void;
}

export function KPIGrid({ metrics, selectedMetricId, onMetricSelect }: KPIGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <KPICard
          key={metric.id}
          metric={metric}
          isSelected={selectedMetricId === metric.id}
          onClick={() => onMetricSelect?.(metric)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Metrics Summary Cards
// ============================================================================

interface MetricsSummaryProps {
  clientMetrics: {
    totalClients: number;
    totalClientsChange: number;
    activeClients: number;
    newClients: number;
  };
  revenueMetrics: {
    totalAUM: number;
    aumChange: number;
    recurringRevenue: number;
  };
  pipelineMetrics: {
    totalPipelineValue: number;
    opportunityCount: number;
  };
  performanceMetrics: {
    conversionRate: number;
    tasksCompleted?: number;
  };
}

export function MetricsSummary({
  clientMetrics,
  revenueMetrics,
  pipelineMetrics,
  performanceMetrics
}: MetricsSummaryProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientMetrics.totalClients}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="h-4 w-4" />
            <span>+{clientMetrics.newClients} new this month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalAUM)}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="h-4 w-4" />
            <span>+{revenueMetrics.aumChange.toFixed(1)}% from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pipelineMetrics.totalPipelineValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {pipelineMetrics.opportunityCount} opportunities
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performanceMetrics.conversionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Opportunity to client
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
