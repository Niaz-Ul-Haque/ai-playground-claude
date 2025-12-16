'use client';

import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Play,
  X,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { FocusRecommendation, FocusPriority } from '@/types/analytics';
import { FOCUS_PRIORITY_LABELS } from '@/types/analytics';

// ============================================================================
// Priority Badge
// ============================================================================

const priorityColors: Record<FocusPriority, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200',
};

const priorityIcons: Record<FocusPriority, React.ElementType> = {
  critical: AlertCircle,
  high: Target,
  medium: Clock,
  low: CheckCircle2,
};

interface PriorityBadgeProps {
  priority: FocusPriority;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const Icon = priorityIcons[priority];
  return (
    <Badge variant="outline" className={cn('gap-1', priorityColors[priority])}>
      <Icon className="h-3 w-3" />
      {FOCUS_PRIORITY_LABELS[priority]}
    </Badge>
  );
}

// ============================================================================
// Single Recommendation Card
// ============================================================================

interface FocusRecommendationCardProps {
  recommendation: FocusRecommendation;
  onStart?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export function FocusRecommendationCard({
  recommendation,
  onStart,
  onDismiss,
  onComplete,
}: FocusRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = recommendation.status === 'completed';
  const isDismissed = recommendation.status === 'dismissed';
  const isInProgress = recommendation.status === 'in_progress';

  return (
    <Card className={cn(
      'transition-all',
      (isCompleted || isDismissed) && 'opacity-60'
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={recommendation.priority} />
                <Badge variant="outline">{recommendation.category}</Badge>
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {isInProgress && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Play className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <CardDescription>{recommendation.description}</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Progress bar for in-progress items */}
          {isInProgress && recommendation.progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{recommendation.progress}%</span>
              </div>
              <Progress value={recommendation.progress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Impact and Effort */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Expected Impact</span>
                <p className="text-sm font-medium">{recommendation.expectedImpact}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Estimated Effort</span>
                <p className="text-sm font-medium">{recommendation.estimatedEffort}</p>
              </div>
            </div>

            {/* Related Client */}
            {recommendation.relatedClientName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Related:</span>
                <span className="font-medium">{recommendation.relatedClientName}</span>
              </div>
            )}

            {/* Outcome for completed items */}
            {isCompleted && recommendation.outcome && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Outcome</p>
                    <p className="text-sm text-green-700">{recommendation.outcome}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {!isCompleted && !isDismissed && (
              <div className="flex gap-2 pt-2">
                {!isInProgress && (
                  <Button
                    size="sm"
                    onClick={() => onStart?.(recommendation.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                {isInProgress && (
                  <Button
                    size="sm"
                    onClick={() => onComplete?.(recommendation.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDismiss?.(recommendation.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ============================================================================
// Focus Recommendations List
// ============================================================================

interface FocusRecommendationsListProps {
  recommendations: FocusRecommendation[];
  onStart?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
  showCompleted?: boolean;
}

export function FocusRecommendationsList({
  recommendations,
  onStart,
  onDismiss,
  onComplete,
  showCompleted = false,
}: FocusRecommendationsListProps) {
  const filtered = showCompleted
    ? recommendations
    : recommendations.filter(r => r.status !== 'completed' && r.status !== 'dismissed');

  // Sort by priority
  const priorityOrder: Record<FocusPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sorted = [...filtered].sort((a, b) => {
    // In-progress items first
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
    // Then by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No focus recommendations at this time</p>
          <p className="text-sm">Check back later for new suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((recommendation) => (
        <FocusRecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          onStart={onStart}
          onDismiss={onDismiss}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Focus Summary Card
// ============================================================================

interface FocusSummaryCardProps {
  recommendations: FocusRecommendation[];
  onViewAll?: () => void;
}

export function FocusSummaryCard({ recommendations, onViewAll }: FocusSummaryCardProps) {
  const active = recommendations.filter(r => r.status !== 'completed' && r.status !== 'dismissed');
  const critical = active.filter(r => r.priority === 'critical').length;
  const high = active.filter(r => r.priority === 'high').length;
  const inProgress = active.filter(r => r.status === 'in_progress').length;

  const topItems = active.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Focus Areas</CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
        <CardDescription>
          {active.length} recommendations • {inProgress} in progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority summary */}
        <div className="flex gap-4 text-sm">
          {critical > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{critical} critical</span>
            </div>
          )}
          {high > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Target className="h-4 w-4" />
              <span>{high} high priority</span>
            </div>
          )}
        </div>

        {/* Top items preview */}
        <div className="space-y-2">
          {topItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                item.priority === 'critical' && 'bg-red-500',
                item.priority === 'high' && 'bg-orange-500',
                item.priority === 'medium' && 'bg-yellow-500',
                item.priority === 'low' && 'bg-gray-400'
              )} />
              <span className="text-sm flex-1 truncate">{item.title}</span>
              {item.status === 'in_progress' && (
                <Badge variant="outline" className="text-xs">
                  {item.progress}%
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
