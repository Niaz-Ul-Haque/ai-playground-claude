/**
 * Mock Analytics Data
 * Sample data for Business Metrics Dashboard
 */

import type {
  KPIMetric,
  ChartConfig,
  DashboardInsight,
  FocusRecommendation,
  SavedView,
  ClientMetrics,
  RevenueMetrics,
  PipelineMetrics,
  PerformanceMetrics,
  DrillDownRecord,
} from '@/types/analytics';

// ============================================================================
// KPI Metrics
// ============================================================================

export const mockKPIs: KPIMetric[] = [
  {
    id: 'kpi-1',
    name: 'Total Clients',
    value: 247,
    formattedValue: '247',
    previousValue: 238,
    change: 9,
    changePercent: 3.8,
    trend: 'up',
    category: 'clients',
    description: 'Total number of active clients',
  },
  {
    id: 'kpi-2',
    name: 'Assets Under Management',
    value: 48500000,
    formattedValue: '$48.5M',
    previousValue: 45200000,
    change: 3300000,
    changePercent: 7.3,
    trend: 'up',
    unit: 'CAD',
    category: 'revenue',
    description: 'Total assets under management',
  },
  {
    id: 'kpi-3',
    name: 'Pipeline Value',
    value: 2850000,
    formattedValue: '$2.85M',
    previousValue: 3100000,
    change: -250000,
    changePercent: -8.1,
    trend: 'down',
    unit: 'CAD',
    category: 'pipeline',
    description: 'Total value of opportunities in pipeline',
  },
  {
    id: 'kpi-4',
    name: 'Conversion Rate',
    value: 34.5,
    formattedValue: '34.5%',
    previousValue: 32.1,
    change: 2.4,
    changePercent: 7.5,
    trend: 'up',
    unit: '%',
    category: 'performance',
    description: 'Opportunity to client conversion rate',
  },
  {
    id: 'kpi-5',
    name: 'Avg Response Time',
    value: 4.2,
    formattedValue: '4.2h',
    previousValue: 5.8,
    change: -1.6,
    changePercent: -27.6,
    trend: 'up',
    unit: 'hours',
    category: 'performance',
    description: 'Average client response time',
  },
  {
    id: 'kpi-6',
    name: 'Client Retention',
    value: 94.2,
    formattedValue: '94.2%',
    previousValue: 93.8,
    change: 0.4,
    changePercent: 0.4,
    trend: 'up',
    unit: '%',
    category: 'clients',
    description: 'Annual client retention rate',
  },
  {
    id: 'kpi-7',
    name: 'Active Opportunities',
    value: 28,
    formattedValue: '28',
    previousValue: 24,
    change: 4,
    changePercent: 16.7,
    trend: 'up',
    category: 'pipeline',
    description: 'Opportunities being actively worked',
  },
  {
    id: 'kpi-8',
    name: 'Tasks Completed',
    value: 156,
    formattedValue: '156',
    previousValue: 142,
    change: 14,
    changePercent: 9.9,
    trend: 'up',
    category: 'performance',
    description: 'Tasks completed this month',
  },
];

// ============================================================================
// Chart Data
// ============================================================================

const generateTimeSeriesData = (months: number, baseValue: number, variance: number) => {
  const data = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue + (Math.random() - 0.5) * variance),
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
  }
  return data;
};

export const mockCharts: ChartConfig[] = [
  {
    id: 'chart-aum',
    title: 'Assets Under Management',
    type: 'area',
    datasets: [
      {
        id: 'aum',
        label: 'AUM',
        data: [
          { date: '2024-07-01', value: 42000000, label: 'Jul' },
          { date: '2024-08-01', value: 43500000, label: 'Aug' },
          { date: '2024-09-01', value: 44200000, label: 'Sep' },
          { date: '2024-10-01', value: 45800000, label: 'Oct' },
          { date: '2024-11-01', value: 47100000, label: 'Nov' },
          { date: '2024-12-01', value: 48500000, label: 'Dec' },
        ],
        color: '#10b981',
      },
    ],
    yAxisLabel: 'Amount ($)',
    showLegend: false,
    showGrid: true,
  },
  {
    id: 'chart-clients',
    title: 'Client Growth',
    type: 'line',
    datasets: [
      {
        id: 'total',
        label: 'Total Clients',
        data: [
          { date: '2024-07-01', value: 225, label: 'Jul' },
          { date: '2024-08-01', value: 230, label: 'Aug' },
          { date: '2024-09-01', value: 235, label: 'Sep' },
          { date: '2024-10-01', value: 240, label: 'Oct' },
          { date: '2024-11-01', value: 243, label: 'Nov' },
          { date: '2024-12-01', value: 247, label: 'Dec' },
        ],
        color: '#3b82f6',
      },
      {
        id: 'new',
        label: 'New Clients',
        data: [
          { date: '2024-07-01', value: 8, label: 'Jul' },
          { date: '2024-08-01', value: 6, label: 'Aug' },
          { date: '2024-09-01', value: 7, label: 'Sep' },
          { date: '2024-10-01', value: 9, label: 'Oct' },
          { date: '2024-11-01', value: 5, label: 'Nov' },
          { date: '2024-12-01', value: 7, label: 'Dec' },
        ],
        color: '#8b5cf6',
      },
    ],
    yAxisLabel: 'Clients',
    showLegend: true,
    showGrid: true,
  },
  {
    id: 'chart-pipeline',
    title: 'Pipeline by Stage',
    type: 'bar',
    datasets: [
      {
        id: 'pipeline',
        label: 'Value',
        data: [
          { date: 'Discovery', value: 850000, label: 'Discovery' },
          { date: 'Proposal', value: 650000, label: 'Proposal' },
          { date: 'Negotiation', value: 450000, label: 'Negotiation' },
          { date: 'Closing', value: 350000, label: 'Closing' },
          { date: 'Won', value: 550000, label: 'Won' },
        ],
        color: '#f59e0b',
      },
    ],
    xAxisLabel: 'Stage',
    yAxisLabel: 'Value ($)',
    showLegend: false,
    showGrid: true,
  },
  {
    id: 'chart-performance',
    title: 'Task Completion Trend',
    type: 'line',
    datasets: [
      {
        id: 'completed',
        label: 'Tasks Completed',
        data: generateTimeSeriesData(6, 150, 40),
        color: '#10b981',
      },
    ],
    yAxisLabel: 'Tasks',
    showLegend: false,
    showGrid: true,
  },
];

// ============================================================================
// Dashboard Insights
// ============================================================================

export const mockInsights: DashboardInsight[] = [
  {
    id: 'insight-1',
    type: 'trend',
    title: 'AUM Growth Accelerating',
    description: 'Your assets under management have grown 7.3% this quarter, outpacing the 5% target.',
    severity: 'info',
    relatedMetricId: 'kpi-2',
    suggestedAction: 'Consider reaching out to high-value prospects to capitalize on momentum.',
    detectedAt: new Date().toISOString(),
  },
  {
    id: 'insight-2',
    type: 'bottleneck',
    title: 'Pipeline Velocity Slowing',
    description: 'Average deal cycle time has increased by 12 days compared to last quarter.',
    severity: 'warning',
    relatedMetricId: 'kpi-3',
    suggestedAction: 'Review stalled opportunities and identify common blockers.',
    detectedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'insight-3',
    type: 'opportunity',
    title: 'High-Value Segment Opportunity',
    description: '15 clients in the $500K+ segment have renewal dates in the next 60 days.',
    severity: 'info',
    suggestedAction: 'Schedule proactive review meetings to discuss portfolio optimization.',
    detectedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'insight-4',
    type: 'anomaly',
    title: 'Unusual Activity Pattern',
    description: 'Client engagement via email has dropped 23% this week compared to average.',
    severity: 'alert',
    suggestedAction: 'Check if there are any deliverability issues with your email system.',
    detectedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

// ============================================================================
// Focus Recommendations
// ============================================================================

export const mockFocusRecommendations: FocusRecommendation[] = [
  {
    id: 'focus-1',
    title: 'Contact High-Value Renewals',
    description: 'Reach out to 8 clients with >$250K AUM whose policies renew in the next 30 days.',
    priority: 'critical',
    expectedImpact: 'Potential $2.1M in retained assets',
    estimatedEffort: '4-6 hours',
    category: 'Client Retention',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'focus-2',
    title: 'Follow Up on Stalled Proposals',
    description: '5 proposals have been pending response for over 14 days.',
    priority: 'high',
    expectedImpact: 'Potential $450K in new business',
    estimatedEffort: '2-3 hours',
    category: 'Pipeline Management',
    relatedClientId: 'client-1',
    relatedClientName: 'Multiple Clients',
    status: 'in_progress',
    progress: 40,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'focus-3',
    title: 'RRSP Contribution Deadline Outreach',
    description: 'Send RRSP contribution room reminders to 45 eligible clients before March 1st deadline.',
    priority: 'high',
    expectedImpact: 'Potential $180K in new contributions',
    estimatedEffort: '1-2 hours (automated campaign)',
    category: 'Seasonal Campaign',
    status: 'pending',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'focus-4',
    title: 'Review Underperforming Portfolios',
    description: '12 client portfolios are underperforming their benchmarks by >5%.',
    priority: 'medium',
    expectedImpact: 'Improved client satisfaction and retention',
    estimatedEffort: '3-4 hours',
    category: 'Portfolio Management',
    status: 'pending',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'focus-5',
    title: 'Complete Pending Client Documentation',
    description: '7 client files are missing required KYC documentation.',
    priority: 'medium',
    expectedImpact: 'Compliance requirement',
    estimatedEffort: '2-3 hours',
    category: 'Compliance',
    status: 'completed',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    outcome: 'All documentation collected and filed',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

// ============================================================================
// Saved Views
// ============================================================================

export const mockSavedViews: SavedView[] = [
  {
    id: 'view-1',
    name: 'Monthly Overview',
    description: 'Standard monthly performance view',
    filters: {
      timePeriod: 'month',
      comparisonPeriod: 'month',
    },
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isDefault: true,
  },
  {
    id: 'view-2',
    name: 'Quarterly Pipeline',
    description: 'Focus on pipeline metrics',
    filters: {
      timePeriod: 'quarter',
    },
    layout: {
      kpiOrder: ['kpi-3', 'kpi-7', 'kpi-4'],
      chartOrder: ['chart-pipeline'],
    },
    createdAt: new Date(Date.now() - 1296000000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'view-3',
    name: 'High Net Worth Clients',
    description: 'Filtered to show only HNW client metrics',
    filters: {
      timePeriod: 'month',
      clientSegment: 'hnw',
    },
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

// ============================================================================
// Client Metrics
// ============================================================================

export const mockClientMetrics: ClientMetrics = {
  totalClients: 247,
  totalClientsChange: 3.8,
  activeClients: 235,
  activeClientsChange: 2.5,
  newClients: 7,
  newClientsChange: 16.7,
  churnedClients: 2,
  churnedClientsChange: -50,
  avgClientValue: 196356,
  avgClientValueChange: 4.2,
  clientsByRisk: [
    { risk: 'Conservative', count: 89 },
    { risk: 'Moderate', count: 112 },
    { risk: 'Aggressive', count: 46 },
  ],
  clientsBySegment: [
    { segment: 'High Net Worth', count: 45 },
    { segment: 'Affluent', count: 98 },
    { segment: 'Mass Affluent', count: 78 },
    { segment: 'Standard', count: 26 },
  ],
};

// ============================================================================
// Revenue Metrics
// ============================================================================

export const mockRevenueMetrics: RevenueMetrics = {
  totalAUM: 48500000,
  aumChange: 7.3,
  recurringRevenue: 485000,
  recurringRevenueChange: 5.2,
  newRevenue: 62000,
  newRevenueChange: 12.8,
  projectedRevenue: 580000,
  revenueByProduct: [
    { product: 'Managed Portfolios', value: 285000 },
    { product: 'Insurance', value: 95000 },
    { product: 'Retirement Plans', value: 72000 },
    { product: 'Tax Planning', value: 33000 },
  ],
  revenueBySegment: [
    { segment: 'High Net Worth', value: 245000 },
    { segment: 'Affluent', value: 156000 },
    { segment: 'Mass Affluent', value: 68000 },
    { segment: 'Standard', value: 16000 },
  ],
};

// ============================================================================
// Pipeline Metrics
// ============================================================================

export const mockPipelineMetrics: PipelineMetrics = {
  totalPipelineValue: 2850000,
  pipelineValueChange: -8.1,
  opportunityCount: 28,
  opportunityCountChange: 16.7,
  avgOpportunityValue: 101786,
  weightedPipeline: 1425000,
  pipelineByStage: [
    { stage: 'Discovery', value: 850000, count: 12 },
    { stage: 'Proposal', value: 650000, count: 7 },
    { stage: 'Negotiation', value: 450000, count: 5 },
    { stage: 'Closing', value: 350000, count: 3 },
    { stage: 'Won', value: 550000, count: 1 },
  ],
  expectedCloseThisMonth: 450000,
  expectedCloseNextMonth: 650000,
};

// ============================================================================
// Performance Metrics
// ============================================================================

export const mockPerformanceMetrics: PerformanceMetrics = {
  conversionRate: 34.5,
  conversionRateChange: 7.5,
  avgDealSize: 185000,
  avgDealSizeChange: 3.2,
  avgCycleTime: 45,
  avgCycleTimeChange: 12,
  retentionRate: 94.2,
  retentionRateChange: 0.4,
  responseTime: 4.2,
  responseTimeChange: -27.6,
  satisfactionScore: 4.6,
  satisfactionScoreChange: 0.2,
};

// ============================================================================
// Drill-Down Records (sample)
// ============================================================================

export const mockDrillDownRecords: DrillDownRecord[] = [
  {
    id: 'drill-1',
    type: 'client',
    name: 'Michael Johnson',
    value: 450000,
    date: '2024-12-01',
    status: 'Active',
  },
  {
    id: 'drill-2',
    type: 'client',
    name: 'Sarah Chen',
    value: 380000,
    date: '2024-11-15',
    status: 'Active',
  },
  {
    id: 'drill-3',
    type: 'client',
    name: 'Robert Thompson',
    value: 520000,
    date: '2024-10-20',
    status: 'Active',
  },
  {
    id: 'drill-4',
    type: 'opportunity',
    name: 'RRSP Top-Up - James Wilson',
    value: 85000,
    date: '2024-12-10',
    status: 'In Progress',
  },
  {
    id: 'drill-5',
    type: 'task',
    name: 'Annual Review - Emily Davis',
    date: '2024-12-08',
    status: 'Completed',
  },
];
