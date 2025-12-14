'use client';

import React from 'react';
import type { TaskStats } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  ListTodo,
  Bot,
} from 'lucide-react';

interface TaskStatsProps {
  stats: TaskStats;
}

export function TaskStatsDisplay({ stats }: TaskStatsProps) {
  const statCards = [
    {
      label: 'Needs Review',
      value: stats.needsReview,
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: PlayCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: ListTodo,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Due Today',
      value: stats.dueToday,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'AI Completed',
      value: stats.aiCompleted,
      icon: Bot,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function TaskStatsSummary({ stats }: TaskStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-orange-500" />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{stats.needsReview}</span> needs review
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{stats.inProgress}</span> in progress
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{stats.pending}</span> pending
        </span>
      </div>
      {stats.overdue > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-red-500 font-medium">
            {stats.overdue} overdue
          </span>
        </div>
      )}
    </div>
  );
}
