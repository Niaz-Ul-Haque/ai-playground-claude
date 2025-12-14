'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, PieChart } from 'lucide-react';

interface ClientStatsProps {
  stats: {
    totalClients: number;
    activeClients: number;
    totalAUM: number;
    avgPortfolioValue: number;
    byRiskProfile: {
      conservative: number;
      moderate: number;
      aggressive: number;
    };
  };
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export function ClientStats({ stats }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
              <p className="text-xs text-muted-foreground">Total Clients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalAUM)}</p>
              <p className="text-xs text-muted-foreground">Total AUM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.avgPortfolioValue)}</p>
              <p className="text-xs text-muted-foreground">Avg Portfolio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <PieChart className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{stats.byRiskProfile.conservative}C</span>
                <span className="text-yellow-600">{stats.byRiskProfile.moderate}M</span>
                <span className="text-red-600">{stats.byRiskProfile.aggressive}A</span>
              </div>
              <p className="text-xs text-muted-foreground">By Risk Profile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
