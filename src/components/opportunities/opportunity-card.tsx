'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { Opportunity } from '@/types/opportunity';
import {
  OPPORTUNITY_TYPE_LABELS,
  IMPACT_LEVEL_LABELS,
  READINESS_LABELS,
} from '@/types/opportunity';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  PlayCircle,
  AlarmClock,
  XCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Ban,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStartWorkflow?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onMarkActioned?: (id: string) => void;
}

export function OpportunityCard({
  opportunity,
  onStartWorkflow,
  onSnooze,
  onDismiss,
  onMarkActioned,
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTypeBadgeColor = (type: Opportunity['type']) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'milestone':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'market':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getImpactBadgeColor = (level: Opportunity['impactLevel']) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getReadinessIcon = (readiness: Opportunity['readiness']) => {
    switch (readiness) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_prep':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'blocked':
        return <Ban className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusStyle = () => {
    switch (opportunity.status) {
      case 'snoozed':
        return 'border-l-4 border-l-yellow-400';
      case 'dismissed':
        return 'border-l-4 border-l-gray-400 opacity-60';
      case 'actioned':
        return 'border-l-4 border-l-green-400';
      default:
        return '';
    }
  };

  const isActionable = opportunity.status === 'new' || opportunity.status === 'viewed';

  return (
    <Card className={`transition-all ${getStatusStyle()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Type and Status Badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={getTypeBadgeColor(opportunity.type)}>
                {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
              </Badge>
              <Badge variant="outline" className={getImpactBadgeColor(opportunity.impactLevel)}>
                {IMPACT_LEVEL_LABELS[opportunity.impactLevel]}
              </Badge>
              {opportunity.status === 'new' && (
                <Badge className="bg-blue-500">New</Badge>
              )}
              {opportunity.status === 'snoozed' && (
                <Badge variant="secondary">Snoozed</Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg">{opportunity.title}</h3>

            {/* Client Link */}
            <Link
              href={`/clients/${opportunity.clientId}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-1"
            >
              <User className="h-3 w-3" />
              {opportunity.clientName}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Impact Score */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{opportunity.impactScore}</div>
            <div className="text-xs text-muted-foreground">Impact</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Why Now Summary */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-medium text-muted-foreground mb-1">Why Now</p>
          <p className="text-sm">{opportunity.whyNow}</p>
        </div>

        {/* Key Metrics Row */}
        <div className="flex flex-wrap gap-4 text-sm">
          {/* Estimated Value */}
          {opportunity.estimatedValue && (
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(opportunity.estimatedValue)}</span>
            </div>
          )}

          {/* Readiness */}
          <div className="flex items-center gap-1">
            {getReadinessIcon(opportunity.readiness)}
            <span>{READINESS_LABELS[opportunity.readiness]}</span>
          </div>

          {/* Expiry */}
          {opportunity.expiresAt && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {getDaysUntilExpiry(opportunity.expiresAt)} days left
              </span>
            </div>
          )}

          {/* Surfaced Date */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Surfaced {formatDate(opportunity.surfacedAt)}</span>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full gap-1">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {/* Full Description */}
            {opportunity.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{opportunity.description}</p>
              </div>
            )}

            {/* Why Now Details */}
            {opportunity.whyNowDetails && (
              <div>
                <p className="text-sm font-medium mb-1">Why This Opportunity</p>
                <p className="text-sm text-muted-foreground">{opportunity.whyNowDetails}</p>
              </div>
            )}

            {/* Prerequisites */}
            {opportunity.prerequisites && opportunity.prerequisites.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Prerequisites</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {opportunity.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Readiness Notes */}
            {opportunity.readinessNotes && (
              <div>
                <p className="text-sm font-medium mb-1">Readiness Notes</p>
                <p className="text-sm text-muted-foreground">{opportunity.readinessNotes}</p>
              </div>
            )}

            {/* Source Trace */}
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Source</p>
              <p className="text-sm">{opportunity.sourceDescription}</p>
            </div>

            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {opportunity.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        {isActionable && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {/* Start Workflow - Primary Action */}
            <Button
              size="sm"
              className="gap-1"
              onClick={() => onStartWorkflow?.(opportunity.id)}
            >
              <PlayCircle className="h-4 w-4" />
              {opportunity.suggestedWorkflowName || 'Start Workflow'}
            </Button>

            {/* Mark as Actioned */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => onMarkActioned?.(opportunity.id)}
            >
              <CheckCircle className="h-4 w-4" />
              Mark Done
            </Button>

            {/* Snooze */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => onSnooze?.(opportunity.id)}
            >
              <AlarmClock className="h-4 w-4" />
              Snooze
            </Button>

            {/* Dismiss */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => onDismiss?.(opportunity.id)}
            >
              <XCircle className="h-4 w-4" />
              Dismiss
            </Button>
          </div>
        )}

        {/* Snoozed Status */}
        {opportunity.status === 'snoozed' && opportunity.snoozedUntil && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            <AlarmClock className="h-4 w-4 inline mr-1" />
            Snoozed until {formatDate(opportunity.snoozedUntil)}
            {opportunity.snoozeReason && ` - ${opportunity.snoozeReason}`}
          </div>
        )}

        {/* Actioned Status */}
        {opportunity.status === 'actioned' && opportunity.actionedAt && (
          <div className="text-sm text-green-600 border-t pt-3">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Completed on {formatDate(opportunity.actionedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OpportunityListProps {
  opportunities: Opportunity[];
  onStartWorkflow?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onMarkActioned?: (id: string) => void;
  emptyMessage?: string;
}

export function OpportunityList({
  opportunities,
  onStartWorkflow,
  onSnooze,
  onDismiss,
  onMarkActioned,
  emptyMessage = 'No opportunities found',
}: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Connect more data sources to discover new opportunities
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          onStartWorkflow={onStartWorkflow}
          onSnooze={onSnooze}
          onDismiss={onDismiss}
          onMarkActioned={onMarkActioned}
        />
      ))}
    </div>
  );
}
