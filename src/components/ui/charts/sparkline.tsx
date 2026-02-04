'use client';

import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { SparklineProps } from './types';

export function SparklineComponent({
  data,
  color = '#3b82f6',
  height = 30,
  width = 100,
  showDot = false,
  className,
}: SparklineProps) {
  // Convert number array to chart data format
  const chartData = data.map((value, index) => ({ index, value }));
  
  // Determine trend color (green if trending up, red if down)
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const trendColor = trend >= 0 ? '#10b981' : '#ef4444';
  const finalColor = color === 'auto' ? trendColor : color;

  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={finalColor}
            strokeWidth={1.5}
            dot={showDot ? { r: 2, fill: finalColor } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
