'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, BarChart3, LineChart, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChartConfig, TimePeriod } from '@/types/analytics';
import { TIME_PERIOD_LABELS } from '@/types/analytics';

// ============================================================================
// Simple Bar Chart (CSS-based)
// ============================================================================

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  color?: string;
  showValues?: boolean;
}

export function SimpleBarChart({ data, maxValue, color = '#3b82f6', showValues = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            {showValues && <span className="font-medium">{formatValue(item.value)}</span>}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Simple Line Chart (CSS-based)
// ============================================================================

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleLineChart({ data, color = '#3b82f6', height = 200 }: LineChartProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data.map(d => d.value)) * 0.9;
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  const range = max - min;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  // Create SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 100;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M 0,100 L ${points.join(' L ')} L 100,100 Z`;

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-muted-foreground">
        <span>{formatValue(max)}</span>
        <span>{formatValue((max + min) / 2)}</span>
        <span>{formatValue(min)}</span>
      </div>

      {/* Chart area */}
      <div className="absolute left-16 right-0 top-0 bottom-8">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />

          {/* Area fill */}
          <path d={areaPath} fill={color} opacity="0.1" />

          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.value - min) / range) * 100;
            return (
              <circle key={i} cx={x} cy={y} r="3" fill={color} />
            );
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="absolute left-16 right-0 bottom-0 h-8 flex justify-between text-xs text-muted-foreground">
        {data.map((d, i) => (
          <span key={i} className="text-center" style={{ width: `${100 / data.length}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Donut Chart (CSS-based)
// ============================================================================

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}

export function SimpleDonutChart({ data, size = 200, strokeWidth = 30 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${circumference * percentage} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          currentOffset += circumference * percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">
              {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Chart Card Component
// ============================================================================

interface ChartCardProps {
  config: ChartConfig;
  className?: string;
}

export function ChartCard({ config, className }: ChartCardProps) {
  const [period, setPeriod] = useState<TimePeriod>('month');

  const getChartIcon = () => {
    switch (config.type) {
      case 'bar':
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
      case 'pie':
      case 'donut':
        return <PieChart className="h-4 w-4 text-muted-foreground" />;
      default:
        return <LineChart className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderChart = () => {
    const dataset = config.datasets[0];
    if (!dataset) return null;

    const chartData = dataset.data.map(d => ({
      label: d.label || d.date,
      value: d.value,
    }));

    switch (config.type) {
      case 'bar':
        return <SimpleBarChart data={chartData} color={dataset.color} />;
      case 'line':
      case 'area':
        return <SimpleLineChart data={chartData} color={dataset.color} height={200} />;
      default:
        return <SimpleLineChart data={chartData} color={dataset.color} height={200} />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{config.title}</CardTitle>
          {config.yAxisLabel && (
            <CardDescription>{config.yAxisLabel}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_PERIOD_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getChartIcon()}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Metrics Breakdown Cards
// ============================================================================

interface BreakdownCardProps {
  title: string;
  data: { label: string; value: number; change?: number }[];
  valuePrefix?: string;
  valueSuffix?: string;
}

export function BreakdownCard({ title, data, valuePrefix = '', valueSuffix = '' }: BreakdownCardProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${valuePrefix}${(value / 1000000).toFixed(1)}M${valueSuffix}`;
    if (value >= 1000) return `${valuePrefix}${(value / 1000).toFixed(0)}K${valueSuffix}`;
    return `${valuePrefix}${value}${valueSuffix}`;
  };

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatValue(item.value)}</span>
                {item.change !== undefined && (
                  <span className={cn(
                    'flex items-center text-xs',
                    item.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {item.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(item.change)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(item.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Pipeline Stage Chart
// ============================================================================

interface PipelineChartProps {
  stages: { stage: string; value: number; count: number }[];
}

export function PipelineChart({ stages }: PipelineChartProps) {
  const maxValue = Math.max(...stages.map(s => s.value));

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline by Stage</CardTitle>
        <CardDescription>Value and count by pipeline stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.stage} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{stage.count} deals</span>
                  <span className="font-medium">{formatValue(stage.value)}</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(stage.value / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
