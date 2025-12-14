'use client';

import React from 'react';
import Link from 'next/link';
import type { Workflow, WorkflowStep } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  GitBranch,
  CheckCircle,
  Circle,
  PlayCircle,
  SkipForward,
  User,
  Clock,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface WorkflowProgressProps {
  workflow: Workflow;
  showSteps?: boolean;
}

const getStepIcon = (status: WorkflowStep['status']) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in_progress':
      return PlayCircle;
    case 'skipped':
      return SkipForward;
    default:
      return Circle;
  }
};

const getStepColor = (status: WorkflowStep['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-500';
    case 'in_progress':
      return 'text-blue-500';
    case 'skipped':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground/50';
  }
};

export function WorkflowProgressCard({ workflow, showSteps = true }: WorkflowProgressProps) {
  const completedSteps = workflow.steps.filter((s) => s.status === 'completed').length;
  const totalSteps = workflow.steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  const currentStep = workflow.steps.find((s) => s.status === 'in_progress');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
            </div>
          </div>
          <Badge
            variant={workflow.status === 'active' ? 'default' : 'secondary'}
          >
            {workflow.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedSteps} of {totalSteps} steps ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg text-sm">
            <PlayCircle className="h-4 w-4 text-blue-500" />
            <span className="text-blue-600 font-medium">Current: {currentStep.name}</span>
            {currentStep.isAutomated && (
              <Badge variant="outline" className="text-xs gap-1">
                <Bot className="h-3 w-3" />
                Automated
              </Badge>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {workflow.clientId && workflow.clientName && (
            <Link
              href={`/clients/${workflow.clientId}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>{workflow.clientName}</span>
            </Link>
          )}
          {workflow.estimatedCompletionDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Est. {format(new Date(workflow.estimatedCompletionDate), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Steps */}
        {showSteps && (
          <div className="space-y-1 pt-2 border-t">
            {workflow.steps.map((step, index) => {
              const Icon = getStepIcon(step.status);
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors',
                    step.status === 'in_progress' && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', getStepColor(step.status))} />
                    <span className="text-xs text-muted-foreground w-5">{index + 1}</span>
                  </div>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      step.status === 'completed' && 'line-through text-muted-foreground',
                      step.status === 'skipped' && 'line-through text-muted-foreground'
                    )}
                  >
                    {step.name}
                  </span>
                  {step.isAutomated && (
                    <Bot className="h-3 w-3 text-muted-foreground" />
                  )}
                  {step.actualMinutes && (
                    <span className="text-xs text-muted-foreground">
                      {step.actualMinutes}m
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface WorkflowListProps {
  workflows: Workflow[];
  maxDisplay?: number;
}

export function WorkflowList({ workflows, maxDisplay = 3 }: WorkflowListProps) {
  const activeWorkflows = workflows.filter((w) => w.status === 'active');

  if (activeWorkflows.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Active Workflows
          <Badge variant="secondary">{activeWorkflows.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeWorkflows.slice(0, maxDisplay).map((workflow) => {
          const completedSteps = workflow.steps.filter((s) => s.status === 'completed').length;
          const totalSteps = workflow.steps.length;
          const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

          return (
            <div
              key={workflow.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{workflow.name}</h4>
                  {workflow.clientName && (
                    <Badge variant="outline" className="text-xs">
                      {workflow.clientName}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={progressPercentage} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {completedSteps}/{totalSteps}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        })}
        {activeWorkflows.length > maxDisplay && (
          <Button variant="ghost" className="w-full text-sm">
            View all {activeWorkflows.length} workflows
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
