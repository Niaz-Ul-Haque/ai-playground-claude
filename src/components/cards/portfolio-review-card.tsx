'use client';

import { useState } from 'react';
import type { PortfolioReviewCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Download,
  BarChart3,
  Shield,
} from 'lucide-react';
import { DonutChart, LineChart } from '@/components/ui/charts';
import { DataTable, type Column } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface PortfolioReviewCardProps {
  data: PortfolioReviewCardData;
}

export function PortfolioReviewCard({ data }: PortfolioReviewCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [activeView, setActiveView] = useState<'allocation' | 'holdings' | 'performance'>('allocation');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRebalance = async () => {
    setActionLoading('rebalance');
    try {
      await handleExecuteAction('rebalance', 'portfolio', data.client_id, {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    setActionLoading('export');
    try {
      await handleExecuteAction('export_portfolio', 'portfolio', data.client_id, {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompareBenchmark = async () => {
    setActionLoading('compare');
    try {
      await handleExecuteAction('compare_benchmark', 'portfolio', data.client_id, {});
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskBadge = (score?: number) => {
    if (score === undefined) return null;
    
    if (score <= 3) {
      return <Badge className="bg-green-500">Low Risk</Badge>;
    } else if (score <= 6) {
      return <Badge className="bg-amber-500">Moderate Risk</Badge>;
    } else {
      return <Badge className="bg-red-500">High Risk</Badge>;
    }
  };

  const allocationChartData = data.allocation.map(item => ({
    name: item.category,
    value: item.percent ?? 0,
  }));

  const performanceChartData = data.performance_history?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    value: item.value,
  })) || [];

  const holdingsColumns: Column[] = [
    { key: 'name', header: 'Asset', sortable: true },
    { key: 'ticker', header: 'Ticker', width: '80px' },
    { key: 'value', header: 'Value', format: 'currency', sortable: true },
    { key: 'change_percent', header: 'Change', format: 'percent', sortable: true },
  ];

  const holdingsRows = data.holdings?.map(h => ({
    ...h,
    change_display: `${(h.change ?? 0) >= 0 ? '+' : ''}${formatCurrency(h.change ?? 0)} (${(h.change_percent ?? 0) >= 0 ? '+' : ''}${(h.change_percent ?? 0).toFixed(2)}%)`,
  })) || [];

  const actions = data.available_actions || ['rebalance', 'export', 'compare_benchmark'];

  return (
    <Card className="my-4 border-l-4 border-l-emerald-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-500" />
            <CardTitle className="text-lg">Portfolio Review</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getRiskBadge(data.risk_score)}
            {data.risk_score !== undefined && (
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Risk Score: {data.risk_score}/10
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{data.client_name}</CardDescription>
        <Badge variant="outline" className="w-fit text-xs">Period: {data.period}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold">{formatCurrency(data.total_value ?? 0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Change</p>
            <div className="flex items-center gap-1">
              {(data.total_change ?? 0) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <p className={`text-xl font-bold ${(data.total_change ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {(data.total_change ?? 0) >= 0 ? '+' : ''}{formatCurrency(data.total_change ?? 0)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Return</p>
            <p className={`text-xl font-bold ${(data.total_change_percent ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {(data.total_change_percent ?? 0) >= 0 ? '+' : ''}{(data.total_change_percent ?? 0).toFixed(2)}%
            </p>
          </div>
          <div className="flex items-center justify-center">
            {data.risk_score !== undefined && data.risk_score > 6 && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">High Risk</span>
              </div>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeView === 'allocation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('allocation')}
          >
            <PieChartIcon className="w-4 h-4 mr-2" />
            Allocation
          </Button>
          {data.holdings && data.holdings.length > 0 && (
            <Button
              variant={activeView === 'holdings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('holdings')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Holdings
            </Button>
          )}
          {data.performance_history && data.performance_history.length > 0 && (
            <Button
              variant={activeView === 'performance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('performance')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </Button>
          )}
        </div>

        {/* Content based on active view */}
        {activeView === 'allocation' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-64">
              <DonutChart
                data={allocationChartData}
                centerLabel="Total"
                centerValue={formatCurrency(data.total_value ?? 0)}
              />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Asset Allocation</h4>
              {data.allocation.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm">{item.category}</span>
                  <div className="text-right">
                    <span className="font-medium">{(item.percent ?? 0).toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatCurrency(item.value ?? 0)})
                    </span>
                    {item.change !== undefined && (
                      <span className={`text-xs ml-2 ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'holdings' && data.holdings && (
          <DataTable
            columns={holdingsColumns}
            data={holdingsRows}
            sortable
            pageSize={5}
          />
        )}

        {activeView === 'performance' && performanceChartData.length > 0 && (
          <div className="h-64">
            <LineChart
              data={performanceChartData}
              xAxisKey="name"
              lines={[{ dataKey: 'value', name: 'Portfolio Value', color: '#10b981' }]}
              showGrid
            />
          </div>
        )}

        {/* Recommendation */}
        {data.recommendation && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-sm mb-1">AI Recommendation</h4>
            <p className="text-sm text-muted-foreground">{data.recommendation}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap pt-4 border-t">
        {actions.includes('rebalance') && (
          <Button
            onClick={handleRebalance}
            disabled={actionLoading === 'rebalance'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading === 'rebalance' ? 'animate-spin' : ''}`} />
            {actionLoading === 'rebalance' ? 'Rebalancing...' : 'Rebalance Portfolio'}
          </Button>
        )}
        {actions.includes('export') && (
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={actionLoading === 'export'}
          >
            <Download className="w-4 h-4 mr-2" />
            {actionLoading === 'export' ? 'Exporting...' : 'Export Report'}
          </Button>
        )}
        {actions.includes('compare_benchmark') && (
          <Button
            variant="ghost"
            onClick={handleCompareBenchmark}
            disabled={actionLoading === 'compare'}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Compare to Benchmark
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
