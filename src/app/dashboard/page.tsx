'use client';

import { useState } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  Share2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  KPIGrid,
  MetricsSummary,
  ChartCard,
  BreakdownCard,
  PipelineChart,
  FocusRecommendationsList,
  FocusSummaryCard,
} from '@/components/dashboard';
import {
  mockKPIs,
  mockCharts,
  mockInsights,
  mockFocusRecommendations,
  mockClientMetrics,
  mockRevenueMetrics,
  mockPipelineMetrics,
  mockPerformanceMetrics,
} from '@/lib/mock-data/analytics';
import type { FocusRecommendation, TimePeriod, DashboardInsight } from '@/types/analytics';
import { TIME_PERIOD_LABELS } from '@/types/analytics';
import { cn } from '@/lib/utils';

// ============================================================================
// Insight Card Component
// ============================================================================

interface InsightCardProps {
  insight: DashboardInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'bottleneck':
        return <AlertCircle className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'opportunity':
        return <Target className="h-4 w-4" />;
      case 'anomaly':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSeverityColor = () => {
    switch (insight.severity) {
      case 'alert':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = () => {
    switch (insight.severity) {
      case 'alert':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={cn('p-4 rounded-lg border', getSeverityColor())}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', getIconColor())}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{insight.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
          {insight.suggestedAction && (
            <p className="text-sm mt-2">
              <span className="font-medium">Suggested: </span>
              {insight.suggestedAction}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Dashboard Page
// ============================================================================

export default function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [focusRecommendations, setFocusRecommendations] = useState<FocusRecommendation[]>(
    mockFocusRecommendations
  );
  const [showCompleted, setShowCompleted] = useState(false);

  // Handle focus recommendation actions
  const handleStartRecommendation = (id: string) => {
    setFocusRecommendations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'in_progress', progress: 0 } : r)
    );
  };

  const handleDismissRecommendation = (id: string) => {
    setFocusRecommendations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r)
    );
  };

  const handleCompleteRecommendation = (id: string) => {
    setFocusRecommendations(prev =>
      prev.map(r => r.id === id ? {
        ...r,
        status: 'completed',
        completedAt: new Date().toISOString(),
        progress: 100,
      } : r)
    );
  };

  const activeInsights = mockInsights.filter(i => i.severity !== 'info').slice(0, 3);
  const pendingFocusCount = focusRecommendations.filter(
    r => r.status !== 'completed' && r.status !== 'dismissed'
  ).length;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Business metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[140px]">
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
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts/Insights Banner */}
      {activeInsights.length > 0 && (
        <div className="space-y-2">
          {activeInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="focus">
            Focus
            {pendingFocusCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingFocusCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary KPIs */}
          <MetricsSummary
            clientMetrics={mockClientMetrics}
            revenueMetrics={mockRevenueMetrics}
            pipelineMetrics={mockPipelineMetrics}
            performanceMetrics={mockPerformanceMetrics}
          />

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {mockCharts.slice(0, 2).map((chart) => (
              <ChartCard key={chart.id} config={chart} />
            ))}
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Pipeline Breakdown */}
            <PipelineChart stages={mockPipelineMetrics.pipelineByStage} />

            {/* Revenue by Product */}
            <BreakdownCard
              title="Revenue by Product"
              data={mockRevenueMetrics.revenueByProduct.map(p => ({
                label: p.product,
                value: p.value,
              }))}
              valuePrefix="$"
            />

            {/* Focus Recommendations Summary */}
            <FocusSummaryCard recommendations={focusRecommendations} />
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockClientMetrics.totalClients}</div>
                <p className="text-xs text-green-600">
                  +{mockClientMetrics.totalClientsChange}% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockClientMetrics.activeClients}</div>
                <p className="text-xs text-muted-foreground">
                  {((mockClientMetrics.activeClients / mockClientMetrics.totalClients) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockClientMetrics.newClients}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Client Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(mockClientMetrics.avgClientValue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-green-600">
                  +{mockClientMetrics.avgClientValueChange}% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <BreakdownCard
              title="Clients by Risk Profile"
              data={mockClientMetrics.clientsByRisk.map(r => ({
                label: r.risk,
                value: r.count,
              }))}
            />
            <BreakdownCard
              title="Clients by Segment"
              data={mockClientMetrics.clientsBySegment.map(s => ({
                label: s.segment,
                value: s.count,
              }))}
            />
          </div>

          <ChartCard config={mockCharts[1]} />
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(mockPipelineMetrics.totalPipelineValue / 1000000).toFixed(2)}M
                </div>
                <p className={cn(
                  'text-xs',
                  mockPipelineMetrics.pipelineValueChange >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {mockPipelineMetrics.pipelineValueChange >= 0 ? '+' : ''}
                  {mockPipelineMetrics.pipelineValueChange}% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPipelineMetrics.opportunityCount}</div>
                <p className="text-xs text-green-600">
                  +{mockPipelineMetrics.opportunityCountChange}% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(mockPipelineMetrics.avgOpportunityValue / 1000).toFixed(0)}K
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weighted Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(mockPipelineMetrics.weightedPipeline / 1000000).toFixed(2)}M
                </div>
                <p className="text-xs text-muted-foreground">Probability-adjusted</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <PipelineChart stages={mockPipelineMetrics.pipelineByStage} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expected Close</CardTitle>
                <CardDescription>Upcoming expected revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="text-xl font-bold">
                    ${(mockPipelineMetrics.expectedCloseThisMonth / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Month</span>
                  <span className="text-xl font-bold">
                    ${(mockPipelineMetrics.expectedCloseNextMonth / 1000).toFixed(0)}K
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceMetrics.conversionRate}%</div>
                <p className="text-xs text-green-600">
                  +{mockPerformanceMetrics.conversionRateChange}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(mockPerformanceMetrics.avgDealSize / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-green-600">
                  +{mockPerformanceMetrics.avgDealSizeChange}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Cycle Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceMetrics.avgCycleTime} days</div>
                <p className="text-xs text-red-600">
                  +{mockPerformanceMetrics.avgCycleTimeChange} days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceMetrics.retentionRate}%</div>
                <p className="text-xs text-green-600">
                  +{mockPerformanceMetrics.retentionRateChange}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceMetrics.responseTime}h</div>
                <p className="text-xs text-green-600">
                  {mockPerformanceMetrics.responseTimeChange}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPerformanceMetrics.satisfactionScore}/5</div>
                <p className="text-xs text-green-600">
                  +{mockPerformanceMetrics.satisfactionScoreChange}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard config={mockCharts[3]} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockInsights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2',
                      insight.severity === 'alert' && 'bg-red-500',
                      insight.severity === 'warning' && 'bg-yellow-500',
                      insight.severity === 'info' && 'bg-blue-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Focus Tab */}
        <TabsContent value="focus" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Focus Recommendations</h2>
              <p className="text-sm text-muted-foreground">
                AI-suggested actions to improve your business
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showCompleted ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide Completed' : 'Show Completed'}
              </Button>
            </div>
          </div>

          <FocusRecommendationsList
            recommendations={focusRecommendations}
            showCompleted={showCompleted}
            onStart={handleStartRecommendation}
            onDismiss={handleDismissRecommendation}
            onComplete={handleCompleteRecommendation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
