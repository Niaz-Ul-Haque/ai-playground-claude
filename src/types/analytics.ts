/**
 * Analytics Types
 * Type definitions for Business Metrics Dashboard
 */

// ============================================================================
// KPI Types
// ============================================================================

export type KPITrend = 'up' | 'down' | 'stable';

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: KPITrend;
  unit?: string;
  description?: string;
  category: KPICategory;
}

export type KPICategory =
  | 'clients'
  | 'revenue'
  | 'pipeline'
  | 'performance'
  | 'engagement';

export const KPI_CATEGORY_LABELS: Record<KPICategory, string> = {
  clients: 'Clients',
  revenue: 'Revenue',
  pipeline: 'Pipeline',
  performance: 'Performance',
  engagement: 'Engagement',
};

// ============================================================================
// Chart Data Types
// ============================================================================

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartDataset {
  id: string;
  label: string;
  data: TimeSeriesDataPoint[];
  color?: string;
}

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  datasets: ChartDataset[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly',
};

// ============================================================================
// Drill-Down Types
// ============================================================================

export interface DrillDownRecord {
  id: string;
  type: 'client' | 'opportunity' | 'task' | 'policy' | 'transaction';
  name: string;
  value?: number;
  date: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface DrillDownData {
  metricId: string;
  metricName: string;
  records: DrillDownRecord[];
  totalCount: number;
  filteredCount: number;
}

// ============================================================================
// Focus Recommendations Types
// ============================================================================

export type FocusPriority = 'critical' | 'high' | 'medium' | 'low';

export interface FocusRecommendation {
  id: string;
  title: string;
  description: string;
  priority: FocusPriority;
  expectedImpact: string;
  estimatedEffort: string;
  category: string;
  relatedMetricId?: string;
  relatedClientId?: string;
  relatedClientName?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  progress?: number;
  outcome?: string;
  createdAt: string;
  completedAt?: string;
}

export const FOCUS_PRIORITY_LABELS: Record<FocusPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// ============================================================================
// Dashboard View Types
// ============================================================================

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: DashboardFilters;
  layout?: DashboardLayout;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  sharedWith?: string[];
}

export interface DashboardFilters {
  timePeriod: TimePeriod;
  startDate?: string;
  endDate?: string;
  clientSegment?: string;
  productType?: string;
  comparisonPeriod?: TimePeriod;
}

export interface DashboardLayout {
  kpiOrder?: string[];
  chartOrder?: string[];
  visibleSections?: string[];
}

// ============================================================================
// Bottleneck & Insights Types
// ============================================================================

export type InsightSeverity = 'info' | 'warning' | 'alert';

export interface DashboardInsight {
  id: string;
  type: 'bottleneck' | 'trend' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  severity: InsightSeverity;
  relatedMetricId?: string;
  suggestedAction?: string;
  detectedAt: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Performance Metrics Types
// ============================================================================

export interface PerformanceMetrics {
  conversionRate: number;
  conversionRateChange: number;
  avgDealSize: number;
  avgDealSizeChange: number;
  avgCycleTime: number;
  avgCycleTimeChange: number;
  retentionRate: number;
  retentionRateChange: number;
  responseTime: number;
  responseTimeChange: number;
  satisfactionScore: number;
  satisfactionScoreChange: number;
}

// ============================================================================
// Revenue Metrics Types
// ============================================================================

export interface RevenueMetrics {
  totalAUM: number;
  aumChange: number;
  recurringRevenue: number;
  recurringRevenueChange: number;
  newRevenue: number;
  newRevenueChange: number;
  projectedRevenue: number;
  revenueByProduct: { product: string; value: number }[];
  revenueBySegment: { segment: string; value: number }[];
}

// ============================================================================
// Client Metrics Types
// ============================================================================

export interface ClientMetrics {
  totalClients: number;
  totalClientsChange: number;
  activeClients: number;
  activeClientsChange: number;
  newClients: number;
  newClientsChange: number;
  churnedClients: number;
  churnedClientsChange: number;
  avgClientValue: number;
  avgClientValueChange: number;
  clientsByRisk: { risk: string; count: number }[];
  clientsBySegment: { segment: string; count: number }[];
}

// ============================================================================
// Pipeline Metrics Types
// ============================================================================

export interface PipelineMetrics {
  totalPipelineValue: number;
  pipelineValueChange: number;
  opportunityCount: number;
  opportunityCountChange: number;
  avgOpportunityValue: number;
  weightedPipeline: number;
  pipelineByStage: { stage: string; value: number; count: number }[];
  expectedCloseThisMonth: number;
  expectedCloseNextMonth: number;
}

// ============================================================================
// Dashboard Stats Summary
// ============================================================================

export interface DashboardStats {
  kpis: KPIMetric[];
  charts: ChartConfig[];
  insights: DashboardInsight[];
  focusRecommendations: FocusRecommendation[];
  savedViews: SavedView[];
  clientMetrics: ClientMetrics;
  revenueMetrics: RevenueMetrics;
  pipelineMetrics: PipelineMetrics;
  performanceMetrics: PerformanceMetrics;
}
