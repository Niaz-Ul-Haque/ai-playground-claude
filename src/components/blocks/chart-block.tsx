'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';
import type { ChartBlockData, ChartDataPoint } from '@/types/chat-blocks';
import { cn } from '@/lib/utils';

interface ChartBlockProps {
  data: ChartBlockData;
}

const PERIOD_LABELS: Record<string, string> = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
};

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function ChartBlock({ data }: ChartBlockProps) {
  const {
    title,
    chartType,
    datasets,
    xAxisLabel,
    yAxisLabel,
    showLegend = true,
    periodOptions,
    selectedPeriod: initialPeriod,
  } = data;

  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod || periodOptions?.[0]);

  // Calculate max value for scaling
  const allValues = datasets.flatMap((ds) => ds.data.map((d) => d.value));
  const maxValue = Math.max(...allValues, 0);

  // Get unique labels across all datasets
  const allLabels = [...new Set(datasets.flatMap((ds) => ds.data.map((d) => d.label)))];

  // Render different chart types
  const renderBarChart = () => (
    <div className="space-y-4">
      {allLabels.map((label) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
              {datasets.map((dataset, dsIndex) => {
                const dataPoint = dataset.data.find((d) => d.label === label);
                return dataPoint ? (
                  <span
                    key={dsIndex}
                    className="font-medium"
                    style={{ color: dataset.color || DEFAULT_COLORS[dsIndex % DEFAULT_COLORS.length] }}
                  >
                    {dataPoint.value.toLocaleString()}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <div className="flex gap-1 h-6">
            {datasets.map((dataset, dsIndex) => {
              const dataPoint = dataset.data.find((d) => d.label === label);
              const width = dataPoint && maxValue > 0 ? (dataPoint.value / maxValue) * 100 : 0;
              const color = dataPoint?.color || dataset.color || DEFAULT_COLORS[dsIndex % DEFAULT_COLORS.length];

              return (
                <div
                  key={dsIndex}
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${width}%`,
                    backgroundColor: color,
                    minWidth: width > 0 ? '4px' : '0',
                  }}
                  title={`${dataset.label}: ${dataPoint?.value.toLocaleString() || 0}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    const width = 400;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={width - padding.right}
              y2={padding.top + chartHeight * (1 - ratio)}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 8}
              y={padding.top + chartHeight * (1 - ratio) + 4}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {Math.round(maxValue * ratio).toLocaleString()}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {allLabels.map((label, index) => {
          const x = padding.left + (chartWidth / (allLabels.length - 1 || 1)) * index;
          return (
            <text
              key={label}
              x={x}
              y={height - 10}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}

        {/* Lines */}
        {datasets.map((dataset, dsIndex) => {
          const color = dataset.color || DEFAULT_COLORS[dsIndex % DEFAULT_COLORS.length];
          const points = allLabels.map((label, index) => {
            const dataPoint = dataset.data.find((d) => d.label === label);
            const x = padding.left + (chartWidth / (allLabels.length - 1 || 1)) * index;
            const y = maxValue > 0
              ? padding.top + chartHeight * (1 - (dataPoint?.value || 0) / maxValue)
              : padding.top + chartHeight;
            return `${x},${y}`;
          });

          return (
            <g key={dsIndex}>
              {/* Line */}
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Points */}
              {allLabels.map((label, index) => {
                const dataPoint = dataset.data.find((d) => d.label === label);
                const x = padding.left + (chartWidth / (allLabels.length - 1 || 1)) * index;
                const y = maxValue > 0
                  ? padding.top + chartHeight * (1 - (dataPoint?.value || 0) / maxValue)
                  : padding.top + chartHeight;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderDonutChart = () => {
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = datasets[0]?.data.reduce((sum, d) => sum + d.value, 0) || 0;

    let currentOffset = 0;

    return (
      <div className="flex items-center justify-center gap-8">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {datasets[0]?.data.map((dataPoint, index) => {
              const percentage = total > 0 ? dataPoint.value / total : 0;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset * circumference;
              currentOffset += percentage;

              const color = dataPoint.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{total.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="space-y-2">
          {datasets[0]?.data.map((dataPoint, index) => {
            const color = dataPoint.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
            const percentage = total > 0 ? ((dataPoint.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{dataPoint.label}</span>
                <span className="text-sm font-medium">{dataPoint.value.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const width = 400;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={width - padding.right}
              y2={padding.top + chartHeight * (1 - ratio)}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 8}
              y={padding.top + chartHeight * (1 - ratio) + 4}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {Math.round(maxValue * ratio).toLocaleString()}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {allLabels.map((label, index) => {
          const x = padding.left + (chartWidth / (allLabels.length - 1 || 1)) * index;
          return (
            <text
              key={label}
              x={x}
              y={height - 10}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}

        {/* Areas */}
        {datasets.map((dataset, dsIndex) => {
          const color = dataset.color || DEFAULT_COLORS[dsIndex % DEFAULT_COLORS.length];
          const points = allLabels.map((label, index) => {
            const dataPoint = dataset.data.find((d) => d.label === label);
            const x = padding.left + (chartWidth / (allLabels.length - 1 || 1)) * index;
            const y = maxValue > 0
              ? padding.top + chartHeight * (1 - (dataPoint?.value || 0) / maxValue)
              : padding.top + chartHeight;
            return { x, y };
          });

          const areaPath = `
            M ${points[0]?.x || padding.left} ${padding.top + chartHeight}
            ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')}
            L ${points[points.length - 1]?.x || padding.left} ${padding.top + chartHeight}
            Z
          `;

          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

          return (
            <g key={dsIndex}>
              <path
                d={areaPath}
                fill={color}
                fillOpacity="0.2"
              />
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'donut':
        return renderDonutChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {periodOptions && periodOptions.length > 1 && (
              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((period) => (
                    <SelectItem key={period} value={period}>
                      {PERIOD_LABELS[period] || period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <div className="mb-4">
          {renderChart()}
        </div>

        {/* Axis Labels */}
        {(xAxisLabel || yAxisLabel) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            {xAxisLabel && <span>{xAxisLabel}</span>}
            {yAxisLabel && <span>{yAxisLabel}</span>}
          </div>
        )}

        {/* Legend */}
        {showLegend && datasets.length > 1 && chartType !== 'donut' && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t flex-wrap">
            {datasets.map((dataset, index) => {
              const color = dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-muted-foreground">{dataset.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
