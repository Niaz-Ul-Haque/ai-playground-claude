'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download } from 'lucide-react';
import { LineChartComponent } from '@/components/ui/charts/line-chart';
import { BarChartComponent } from '@/components/ui/charts/bar-chart';
import { PieChartComponent } from '@/components/ui/charts/pie-chart';
import { DonutChartComponent } from '@/components/ui/charts/donut-chart';
import type { ChartCardData } from '@/types/chat';

interface ChartCardProps {
  data: ChartCardData;
}

export function ChartCard({ data }: ChartCardProps) {
  const {
    title,
    description,
    chart_type,
    data: chartData,
    x_axis_key,
    series,
    show_legend,
    show_grid,
    height,
    time_periods,
    selected_period,
    center_label,
    center_value,
  } = data;

  const [activePeriod, setActivePeriod] = useState(selected_period || time_periods?.[0]);

  // Convert series to chart format
  const chartSeries = series?.map(s => ({
    dataKey: s.key,
    name: s.name || s.key,
    color: s.color,
  }));

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      height: height || 300,
      showLegend: show_legend !== false,
      showGrid: show_grid !== false,
    };

    switch (chart_type) {
      case 'line':
        return (
          <LineChartComponent
            {...commonProps}
            xAxisKey={x_axis_key || 'name'}
            lines={chartSeries}
          />
        );
      
      case 'bar':
        return (
          <BarChartComponent
            {...commonProps}
            xAxisKey={x_axis_key || 'name'}
            bars={chartSeries}
          />
        );
      
      case 'pie':
        return (
          <PieChartComponent
            {...commonProps}
            dataKey="value"
            nameKey="name"
          />
        );
      
      case 'donut':
        return (
          <DonutChartComponent
            {...commonProps}
            dataKey="value"
            nameKey="name"
            centerLabel={center_label}
            centerValue={center_value}
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Unsupported chart type: {chart_type}
          </div>
        );
    }
  };

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{title || 'Chart'}</CardTitle>
            </div>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="text-xs capitalize">
            {chart_type}
          </Badge>
        </div>
        
        {/* Time period selector */}
        {time_periods && time_periods.length > 0 && (
          <div className="flex gap-1 mt-3">
            {time_periods.map(period => (
              <Button
                key={period}
                variant={activePeriod === period ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActivePeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
