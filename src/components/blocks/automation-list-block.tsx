'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import type { AutomationListBlockData } from '@/types/chat-blocks';
import {
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATION_STATUS_LABELS,
} from '@/types/automation';
import { formatRelativeDate } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface AutomationListBlockProps {
  data: AutomationListBlockData;
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  stopped: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  running: Play,
  paused: Pause,
  stopped: XCircle,
};

export function AutomationListBlock({ data }: AutomationListBlockProps) {
  const { sendMessage } = useChatContext();
  const { title, automations = [], suggestions = [], exceptions = [], showActions = true } = data;

  const handlePause = async (automationId: string) => {
    await sendMessage(`Pause automation ${automationId}`);
  };

  const handleResume = async (automationId: string) => {
    await sendMessage(`Resume automation ${automationId}`);
  };

  const handleApprove = async (suggestionId: string) => {
    await sendMessage(`Approve automation suggestion ${suggestionId}`);
  };

  const handleReject = async (suggestionId: string) => {
    await sendMessage(`Reject automation suggestion ${suggestionId}`);
  };

  const handleResolve = async (exceptionId: string) => {
    await sendMessage(`Resolve automation exception ${exceptionId}`);
  };

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {automations.length > 0 && (
              <Badge variant="secondary">{automations.length} active</Badge>
            )}
            {suggestions.length > 0 && (
              <Badge variant="outline">{suggestions.length} suggestions</Badge>
            )}
            {exceptions.length > 0 && (
              <Badge variant="destructive">{exceptions.length} exceptions</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Automations */}
        {automations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Active Automations</h4>
            <div className="space-y-3">
              {automations.map((automation) => {
                const StatusIcon = STATUS_ICONS[automation.status] || Play;
                return (
                  <div
                    key={automation.id}
                    className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium">{automation.name}</span>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[automation.status]}
                          >
                            {AUTOMATION_STATUS_LABELS[automation.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {automation.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{AUTOMATION_CATEGORY_LABELS[automation.category]}</span>
                          <span>•</span>
                          <span>{automation.successCount} runs</span>
                          {automation.lastRunAt && (
                            <>
                              <span>•</span>
                              <span>Last: {formatRelativeDate(automation.lastRunAt)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {showActions && (
                        <div className="flex items-center gap-2">
                          {automation.status === 'running' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePause(automation.id)}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResume(automation.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Automation Suggestions</h4>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded-lg border bg-card p-4 border-dashed border-primary/30 bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="font-medium">{suggestion.automationDescription}</span>
                        <Badge variant="secondary">
                          {suggestion.confidenceScore}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Pattern: </span>
                        {suggestion.patternDescription}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Benefit: </span>
                        {suggestion.expectedBenefit}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{AUTOMATION_CATEGORY_LABELS[suggestion.category]}</span>
                        <span>•</span>
                        <span>Observed {suggestion.occurrenceCount} times</span>
                        {suggestion.estimatedTimeSaved && (
                          <>
                            <span>•</span>
                            <span>~{suggestion.estimatedTimeSaved} min/week saved</span>
                          </>
                        )}
                      </div>
                    </div>

                    {showActions && suggestion.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(suggestion.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(suggestion.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exceptions */}
        {exceptions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Exceptions Requiring Attention
            </h4>
            <div className="space-y-3">
              {exceptions.map((exception) => (
                <div
                  key={exception.id}
                  className={cn(
                    'rounded-lg border bg-card p-4',
                    exception.severity === 'critical' && 'border-red-300 bg-red-50',
                    exception.severity === 'high' && 'border-orange-300 bg-orange-50',
                    exception.severity === 'medium' && 'border-yellow-300 bg-yellow-50',
                    exception.severity === 'low' && 'border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          className={cn(
                            'h-4 w-4',
                            exception.severity === 'critical' && 'text-red-600',
                            exception.severity === 'high' && 'text-orange-600',
                            exception.severity === 'medium' && 'text-yellow-600',
                            exception.severity === 'low' && 'text-gray-600'
                          )}
                        />
                        <span className="font-medium">{exception.automationName}</span>
                        <Badge
                          variant={exception.severity === 'critical' ? 'destructive' : 'outline'}
                        >
                          {exception.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{exception.reason}</p>
                      {exception.details && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {exception.details}
                        </p>
                      )}
                      {exception.affectedClientName && (
                        <p className="text-xs text-muted-foreground">
                          Affected: {exception.affectedClientName}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>{formatRelativeDate(exception.occurredAt)}</span>
                        {exception.suggestedAction && (
                          <>
                            <span>•</span>
                            <span>Suggested: {exception.suggestedAction}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {showActions && exception.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(exception.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {automations.length === 0 && suggestions.length === 0 && exceptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No automations to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
