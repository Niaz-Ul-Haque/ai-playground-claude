'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  AlarmClock,
  XCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import type { OpportunityDetailBlockData } from '@/types/chat-blocks';
import { formatCurrency, formatRelativeDate, formatDueDate, getInitials } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface OpportunityDetailBlockProps {
  data: OpportunityDetailBlockData;
}

const OPPORTUNITY_TYPE_ICONS: Record<string, React.ElementType> = {
  contract: Calendar,
  milestone: Target,
  market: TrendingUp,
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const READINESS_COLORS: Record<string, string> = {
  ready: 'bg-green-100 text-green-800 border-green-200',
  needs_prep: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  viewed: 'bg-gray-100 text-gray-800 border-gray-200',
  snoozed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dismissed: 'bg-gray-100 text-gray-500 border-gray-200',
  actioned: 'bg-green-100 text-green-800 border-green-200',
};

export function OpportunityDetailBlock({ data }: OpportunityDetailBlockProps) {
  const { sendMessage } = useChatContext();
  const { opportunity, client, suggestedWorkflow, showActions = true } = data;

  const TypeIcon = OPPORTUNITY_TYPE_ICONS[opportunity.type] || Target;

  const handleAction = async () => {
    if (suggestedWorkflow) {
      await sendMessage(`Start ${suggestedWorkflow} workflow for ${opportunity.clientName}`);
    } else {
      await sendMessage(`Mark opportunity "${opportunity.title}" as actioned`);
    }
  };

  const handleSnoozeAction = async () => {
    await sendMessage(`Snooze opportunity "${opportunity.title}" for 1 week`);
  };

  const handleDismiss = async () => {
    await sendMessage(`Dismiss opportunity "${opportunity.title}"`);
  };

  const isExpiring = opportunity.expiresAt &&
    new Date(opportunity.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card className="my-4">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'h-12 w-12 rounded-lg flex items-center justify-center',
              opportunity.impactLevel === 'high' && 'bg-red-100',
              opportunity.impactLevel === 'medium' && 'bg-yellow-100',
              opportunity.impactLevel === 'low' && 'bg-green-100',
            )}>
              <TypeIcon className={cn(
                'h-6 w-6',
                opportunity.impactLevel === 'high' && 'text-red-600',
                opportunity.impactLevel === 'medium' && 'text-yellow-600',
                opportunity.impactLevel === 'low' && 'text-green-600',
              )} />
            </div>
            <div>
              <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={IMPACT_COLORS[opportunity.impactLevel]}>
                  {opportunity.impactLevel} impact
                </Badge>
                <Badge variant="outline" className={READINESS_COLORS[opportunity.readiness]}>
                  {opportunity.readiness.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={STATUS_COLORS[opportunity.status]}>
                  {opportunity.status}
                </Badge>
              </div>
            </div>
          </div>

          {opportunity.estimatedValue && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Value</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(opportunity.estimatedValue)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Client Info */}
        {client && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="font-medium">{formatCurrency(client.portfolioValue)}</p>
            </div>
          </div>
        )}

        {/* Impact Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Impact Score</span>
            <span className="text-sm font-bold">{opportunity.impactScore}/100</span>
          </div>
          <Progress value={opportunity.impactScore} className="h-3" />
        </div>

        {/* Why Now Section */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 mb-1">Why Now</p>
              <p className="text-sm text-amber-700">{opportunity.whyNow}</p>
              {opportunity.whyNowDetails && (
                <p className="text-sm text-amber-600 mt-2">{opportunity.whyNowDetails}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{opportunity.description}</p>
        </div>

        {/* Prerequisites */}
        {opportunity.prerequisites && opportunity.prerequisites.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
            <ul className="space-y-1">
              {opportunity.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Surfaced</span>
            </div>
            <p className="font-medium">{formatRelativeDate(opportunity.surfacedAt)}</p>
          </div>
          {opportunity.expiresAt && (
            <div className={cn(
              'p-3 rounded-lg border',
              isExpiring && 'border-amber-300 bg-amber-50'
            )}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={cn(
                  'h-4 w-4',
                  isExpiring ? 'text-amber-600' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'text-xs',
                  isExpiring ? 'text-amber-600' : 'text-muted-foreground'
                )}>
                  Expires
                </span>
              </div>
              <p className={cn(
                'font-medium',
                isExpiring && 'text-amber-700'
              )}>
                {formatDueDate(opportunity.expiresAt)}
              </p>
            </div>
          )}
        </div>

        {/* Suggested Workflow */}
        {opportunity.suggestedWorkflowName && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Suggested Workflow</span>
              </div>
              <Badge variant="secondary">{opportunity.suggestedWorkflowName}</Badge>
            </div>
          </div>
        )}

        {/* Source Information */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Source: {opportunity.sourceDescription}
          </p>
        </div>

        {/* Actions */}
        {showActions && opportunity.status !== 'actioned' && opportunity.status !== 'dismissed' && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button className="flex-1" onClick={handleAction}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {suggestedWorkflow ? `Start ${opportunity.suggestedWorkflowName || 'Workflow'}` : 'Mark as Actioned'}
            </Button>
            <Button variant="outline" onClick={handleSnoozeAction}>
              <AlarmClock className="h-4 w-4 mr-1" />
              Snooze
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              <XCircle className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        )}

        {/* Snoozed/Dismissed Info */}
        {opportunity.status === 'snoozed' && opportunity.snoozedUntil && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlarmClock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Snoozed until {formatDueDate(opportunity.snoozedUntil)}
              {opportunity.snoozeReason && ` - ${opportunity.snoozeReason}`}
            </span>
          </div>
        )}

        {opportunity.status === 'dismissed' && opportunity.dismissReason && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <XCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Dismissed: {opportunity.dismissReason}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
