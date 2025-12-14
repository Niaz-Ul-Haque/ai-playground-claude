'use client';

import React from 'react';
import type { ProcessRecommendation } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Bot,
  Clock,
  ArrowUpCircle,
  Users,
  Check,
  X,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecommendationsPanelProps {
  recommendations: ProcessRecommendation[];
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRevert?: (id: string) => void;
}

const getTypeIcon = (type: ProcessRecommendation['type']) => {
  switch (type) {
    case 'efficiency':
      return Zap;
    case 'automation':
      return Bot;
    case 'timing':
      return Clock;
    case 'priority':
      return ArrowUpCircle;
    case 'delegation':
      return Users;
    default:
      return Zap;
  }
};

const getImpactColor = (impact: ProcessRecommendation['impactLevel']) => {
  switch (impact) {
    case 'high':
      return 'bg-green-500/10 text-green-600';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getEffortColor = (effort: ProcessRecommendation['effort']) => {
  switch (effort) {
    case 'low':
      return 'bg-green-500/10 text-green-600';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600';
    default:
      return 'bg-red-500/10 text-red-600';
  }
};

function RecommendationCard({
  recommendation,
  onApply,
  onDismiss,
  onRevert,
}: {
  recommendation: ProcessRecommendation;
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRevert?: (id: string) => void;
}) {
  const Icon = getTypeIcon(recommendation.type);
  const isApplied = recommendation.status === 'applied';
  const hasOutcome = isApplied && recommendation.outcome?.tracked;

  return (
    <div className="p-4 rounded-lg border space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium">{recommendation.title}</h4>
            {isApplied && (
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                Applied
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {recommendation.description}
          </p>
        </div>
      </div>

      {/* Expected Benefit */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Expected benefit:</span>{' '}
          {recommendation.expectedBenefit}
        </p>
      </div>

      {/* Impact & Effort */}
      <div className="flex items-center gap-2">
        <Badge className={cn('text-xs', getImpactColor(recommendation.impactLevel))}>
          {recommendation.impactLevel} impact
        </Badge>
        <Badge className={cn('text-xs', getEffortColor(recommendation.effort))}>
          {recommendation.effort} effort
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto">
          Suggested {formatDistanceToNow(new Date(recommendation.suggestedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Outcome (if applied and tracked) */}
      {hasOutcome && recommendation.outcome && (
        <div className="p-3 bg-green-500/10 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <TrendingUp className="h-4 w-4" />
            Outcome Tracked
          </div>
          {recommendation.outcome.beforeMetrics && recommendation.outcome.afterMetrics && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.keys(recommendation.outcome.beforeMetrics).map((key) => {
                const before = recommendation.outcome!.beforeMetrics![key];
                const after = recommendation.outcome!.afterMetrics![key];
                const improved = after < before;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className={improved ? 'text-green-600' : 'text-red-600'}>
                      {before} → {after}
                    </span>
                    {improved ? (
                      <TrendingDown className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {recommendation.outcome.notes && (
            <p className="text-xs text-muted-foreground">
              {recommendation.outcome.notes}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {recommendation.status === 'pending' && (
        <div className="flex items-center gap-2 pt-2 border-t">
          {onApply && (
            <Button size="sm" className="flex-1 gap-1" onClick={() => onApply(recommendation.id)}>
              <Check className="h-4 w-4" />
              Apply
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => onDismiss(recommendation.id)}
            >
              <X className="h-4 w-4" />
              Dismiss
            </Button>
          )}
        </div>
      )}

      {isApplied && onRevert && (
        <div className="pt-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            className="w-full gap-1 text-muted-foreground"
            onClick={() => onRevert(recommendation.id)}
          >
            <RotateCcw className="h-4 w-4" />
            Revert
          </Button>
        </div>
      )}
    </div>
  );
}

export function RecommendationsPanel({
  recommendations,
  onApply,
  onDismiss,
  onRevert,
}: RecommendationsPanelProps) {
  const pending = recommendations.filter((r) => r.status === 'pending');
  const applied = recommendations.filter((r) => r.status === 'applied');

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Process Recommendations
          {pending.length > 0 && <Badge variant="secondary">{pending.length} new</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pending.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">New Recommendations</h4>
            {pending.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onApply={onApply}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}

        {applied.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Applied</h4>
            {applied.slice(0, 3).map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onRevert={onRevert}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
