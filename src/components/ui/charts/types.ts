export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  width?: number | string;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  className?: string;
}

export interface LineChartProps extends ChartProps {
  xAxisKey?: string;
  yAxisKey?: string;
  lines?: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
}

export interface BarChartProps extends ChartProps {
  xAxisKey?: string;
  bars?: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  layout?: 'vertical' | 'horizontal';
}

export interface PieChartProps extends ChartProps {
  dataKey?: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
}

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showDot?: boolean;
  className?: string;
}
