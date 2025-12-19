'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  AlarmClock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
} from 'lucide-react';
import type { OpportunityListBlockData } from '@/types/chat-blocks';
import type { Opportunity } from '@/types/opportunity';
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface OpportunityListBlockProps {
  data: OpportunityListBlockData;
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

export function OpportunityListBlock({ data }: OpportunityListBlockProps) {
  const { sendMessage } = useChatContext();
  const { title, opportunities, stats, showActions = true, groupByType = false } = data;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSnooze = async (opportunity: Opportunity) => {
    await sendMessage(`Snooze opportunity "${opportunity.title}" for 1 week`);
  };

  const handleDismiss = async (opportunity: Opportunity) => {
    await sendMessage(`Dismiss opportunity "${opportunity.title}"`);
  };

  const handleAction = async (opportunity: Opportunity) => {
    await sendMessage(`Tell me more about the opportunity "${opportunity.title}"`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const groupedOpportunities = groupByType
    ? opportunities.reduce((acc, opp) => {
        if (!acc[opp.type]) acc[opp.type] = [];
        acc[opp.type].push(opp);
        return acc;
      }, {} as Record<string, Opportunity[]>)
    : { all: opportunities };

  const OpportunityItem = ({ opportunity }: { opportunity: Opportunity }) => {
    const TypeIcon = OPPORTUNITY_TYPE_ICONS[opportunity.type] || Target;
    const isExpanded = expandedId === opportunity.id;

    return (
      <div
        key={opportunity.id}
        className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{opportunity.title}</span>
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={IMPACT_COLORS[opportunity.impactLevel]}>
                {opportunity.impactLevel} impact
              </Badge>
              <Badge variant="outline" className={READINESS_COLORS[opportunity.readiness]}>
                {opportunity.readiness.replace('_', ' ')}
              </Badge>
              {opportunity.estimatedValue && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(opportunity.estimatedValue)}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{opportunity.clientName}</p>

            {/* Impact Score Bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Impact Score:</span>
              <Progress value={opportunity.impactScore} className="flex-1 h-2" />
              <span className="text-xs font-medium">{opportunity.impactScore}%</span>
            </div>

            {/* Why Now */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Why now: </span>
              {opportunity.whyNow}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <p className="text-sm">{opportunity.description}</p>
                {opportunity.expiresAt && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    Expires: {formatRelativeDate(opportunity.expiresAt)}
                  </div>
                )}
                {opportunity.suggestedWorkflowName && (
                  <div className="text-xs text-muted-foreground">
                    Suggested workflow: {opportunity.suggestedWorkflowName}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => toggleExpand(opportunity.id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {opportunity.expiresAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(opportunity.expiresAt)}
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={() => handleAction(opportunity)}
            >
              Take Action
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSnooze(opportunity)}
            >
              <AlarmClock className="h-4 w-4 mr-1" />
              Snooze
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDismiss(opportunity)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{opportunities.length} opportunities</Badge>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-600">{stats.byImpact.high}</p>
              <p className="text-xs text-muted-foreground">High Impact</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-600">{stats.byReadiness.ready}</p>
              <p className="text-xs text-muted-foreground">Ready</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-50">
              <p className="text-2xl font-bold text-amber-600">{stats.expiringThisWeek}</p>
              <p className="text-xs text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {groupByType ? (
            Object.entries(groupedOpportunities).map(([type, opps]) => (
              <div key={type}>
                <h4 className="text-sm font-medium mb-2 capitalize">{type} Opportunities</h4>
                <div className="space-y-3">
                  {opps.map((opp) => (
                    <OpportunityItem key={opp.id} opportunity={opp} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            opportunities.map((opp) => (
              <OpportunityItem key={opp.id} opportunity={opp} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
