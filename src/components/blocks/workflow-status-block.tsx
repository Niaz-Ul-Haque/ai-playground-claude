'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import type { WorkflowStatusBlockData } from '@/types/chat-blocks';
import { formatRelativeDate, formatDueDate } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface WorkflowStatusBlockProps {
  data: WorkflowStatusBlockData;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const WORKFLOW_TYPE_LABELS: Record<string, string> = {
  client_onboarding: 'Client Onboarding',
  annual_review: 'Annual Review',
  portfolio_rebalance: 'Portfolio Rebalance',
  insurance_renewal: 'Insurance Renewal',
  estate_planning: 'Estate Planning',
  tax_planning: 'Tax Planning',
};

export function WorkflowStatusBlock({ data }: WorkflowStatusBlockProps) {
  const { sendMessage } = useChatContext();
  const { workflow, materials = [], showCompleteStepAction = true, progress } = data;

  const handleCompleteStep = async (stepId: string) => {
    await sendMessage(`Complete step ${stepId} of workflow ${workflow.id}`);
  };

  const handleSkipStep = async (stepId: string) => {
    await sendMessage(`Skip step ${stepId} of workflow ${workflow.id}`);
  };

  const handleStartStep = async (stepId: string) => {
    await sendMessage(`Start step ${stepId} of workflow ${workflow.id}`);
  };

  const handlePauseWorkflow = async () => {
    await sendMessage(`Pause workflow ${workflow.id}`);
  };

  const handleResumeWorkflow = async () => {
    await sendMessage(`Resume workflow ${workflow.id}`);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'skipped':
        return <SkipForward className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const currentStepIndex = workflow.steps.findIndex(
    (step) => step.status === 'in_progress' || step.status === 'pending'
  );

  return (
    <Card className="my-4">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-2">{workflow.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={STATUS_COLORS[workflow.status]}>
                {workflow.status}
              </Badge>
              <Badge variant="secondary">
                {WORKFLOW_TYPE_LABELS[workflow.type] || workflow.type}
              </Badge>
              {workflow.clientName && (
                <Badge variant="outline">{workflow.clientName}</Badge>
              )}
            </div>
          </div>

          {workflow.status === 'active' && (
            <Button variant="outline" size="sm" onClick={handlePauseWorkflow}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          {workflow.status === 'paused' && (
            <Button variant="outline" size="sm" onClick={handleResumeWorkflow}>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.completed} of {progress.total} steps ({progress.percentage}%)
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        {/* Description */}
        {workflow.description && (
          <p className="text-sm text-muted-foreground">{workflow.description}</p>
        )}

        {/* Steps */}
        <div>
          <h4 className="text-sm font-medium mb-3">Workflow Steps</h4>
          <div className="space-y-3">
            {workflow.steps.map((step, index) => {
              const isCurrentStep = currentStepIndex === index;
              const isPastStep = index < currentStepIndex || step.status === 'completed' || step.status === 'skipped';

              return (
                <div
                  key={step.id}
                  className={cn(
                    'relative flex items-start gap-4 p-3 rounded-lg border',
                    isCurrentStep && 'border-primary bg-primary/5',
                    step.status === 'completed' && 'bg-green-50/50',
                    step.status === 'skipped' && 'bg-gray-50 opacity-60'
                  )}
                >
                  {/* Connector Line */}
                  {index < workflow.steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[26px] top-[48px] w-0.5 h-[calc(100%-24px)]',
                        isPastStep ? 'bg-green-200' : 'bg-gray-200'
                      )}
                    />
                  )}

                  {/* Status Icon */}
                  <div className="shrink-0 z-10 bg-background rounded-full">
                    {getStepIcon(step.status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        'font-medium',
                        step.status === 'skipped' && 'line-through text-muted-foreground'
                      )}>
                        {step.order}. {step.name}
                      </p>
                      {step.isAutomated && (
                        <Badge variant="secondary" className="text-xs">Automated</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {step.estimatedMinutes && (
                        <span>Est: {step.estimatedMinutes} min</span>
                      )}
                      {step.actualMinutes && (
                        <span>Actual: {step.actualMinutes} min</span>
                      )}
                      {step.completedAt && (
                        <span>Completed: {formatRelativeDate(step.completedAt)}</span>
                      )}
                    </div>

                    {/* Step Actions */}
                    {showCompleteStepAction && step.status === 'pending' && isCurrentStep && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleStartStep(step.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSkipStep(step.id)}
                        >
                          <SkipForward className="h-4 w-4 mr-1" />
                          Skip
                        </Button>
                      </div>
                    )}

                    {showCompleteStepAction && step.status === 'in_progress' && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleCompleteStep(step.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSkipStep(step.id)}
                        >
                          <SkipForward className="h-4 w-4 mr-1" />
                          Skip
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Materials */}
        {materials.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Related Materials</h4>
            <div className="space-y-2">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.prefilledFields}/{material.totalFields} fields prefilled
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={material.status === 'ready' ? 'default' : 'outline'}
                  >
                    {material.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {formatRelativeDate(workflow.createdAt)}</span>
          {workflow.estimatedCompletionDate && (
            <span>Est. completion: {formatDueDate(workflow.estimatedCompletionDate)}</span>
          )}
          {workflow.completedAt && (
            <span className="text-green-600">Completed: {formatRelativeDate(workflow.completedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
