'use client';

import type { ProgressTrackerCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useChatContext } from '@/context/chat-context';

interface ProgressTrackerCardProps {
  data: ProgressTrackerCardData;
}

export function ProgressTrackerCard({ data }: ProgressTrackerCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (): number | null => {
    if (!data.estimated_completion) return null;
    const diff = new Date(data.estimated_completion).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const completedSteps = data.steps.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedSteps / data.steps.length) * 100);
  const daysRemaining = getDaysRemaining();

  const handleAdvanceStep = async () => {
    setActionLoading('advance');
    try {
      await handleExecuteAction('advance_step', 'progress', data.process_id, {
        current_step: data.current_step,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async (stepId: string) => {
    await handleExecuteAction('add_note', 'progress', data.process_id, {
      step_id: stepId,
    });
  };

  const handleEscalate = async () => {
    setActionLoading('escalate');
    try {
      await handleExecuteAction('escalate', 'progress', data.process_id, {});
    } finally {
      setActionLoading(null);
    }
  };

  const getStepIcon = (status: string, index: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'current':
        return (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {index + 1}
          </div>
        );
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const actions = data.available_actions || ['advance_step', 'add_note'];

  return (
    <Card className="my-4 border-l-4 border-l-teal-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </div>
          <Badge variant={progressPercent === 100 ? 'default' : 'outline'} className={progressPercent === 100 ? 'bg-green-500' : ''}>
            {progressPercent}% Complete
          </Badge>
        </div>
        {data.client_name && (
          <CardDescription>Client: {data.client_name}</CardDescription>
        )}
        {data.description && (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Step {data.current_step + 1} of {data.steps.length}
            </span>
            {daysRemaining !== null && (
              <span className={`flex items-center gap-1 ${daysRemaining < 0 ? 'text-red-500' : daysRemaining <= 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {daysRemaining < 0 ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    {Math.abs(daysRemaining)} days overdue
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    {daysRemaining} days remaining
                  </>
                )}
              </span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {data.steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < data.steps.length - 1 && (
                <div
                  className={`absolute left-3 top-8 w-0.5 h-full ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
              
              <div
                className={`relative flex gap-4 pb-6 cursor-pointer ${
                  step.status === 'current' ? 'bg-primary/5 -mx-4 px-4 py-2 rounded-lg' : ''
                }`}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 z-10 bg-background">
                  {getStepIcon(step.status, index)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-medium ${step.status === 'completed' ? 'text-muted-foreground' : ''}`}>
                      {step.label}
                    </h4>
                    <div className="flex items-center gap-2">
                      {step.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(step.completed_at)}
                        </span>
                      )}
                      {(step.description || step.notes) && (
                        expandedStep === step.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedStep === step.id && (
                    <div className="mt-2 space-y-2">
                      {step.description && (
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      )}
                      {step.notes && (
                        <div className="p-2 bg-muted/50 rounded text-sm">
                          <span className="text-muted-foreground">Notes:</span> {step.notes}
                        </div>
                      )}
                      {actions.includes('add_note') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleAddNote(step.id); }}
                        >
                          <MessageSquare className="w-3 h-3 mr-2" />
                          Add Note
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date Info */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
          <div>
            <p className="text-muted-foreground">Started</p>
            <p className="font-medium">{formatDate(data.start_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {data.actual_completion ? 'Completed' : 'Est. Completion'}
            </p>
            <p className="font-medium">
              {formatDate(data.actual_completion || data.estimated_completion)}
            </p>
          </div>
        </div>
      </CardContent>

      {(actions.includes('advance_step') || actions.includes('escalate')) && data.current_step < data.steps.length - 1 && (
        <CardFooter className="flex gap-2 pt-4 border-t">
          {actions.includes('advance_step') && (
            <Button
              onClick={handleAdvanceStep}
              disabled={actionLoading === 'advance'}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {actionLoading === 'advance' ? 'Advancing...' : 'Advance to Next Step'}
            </Button>
          )}
          {actions.includes('escalate') && (
            <Button
              variant="outline"
              onClick={handleEscalate}
              disabled={actionLoading === 'escalate'}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Escalate
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
