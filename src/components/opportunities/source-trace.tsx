'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Opportunity, OpportunitySourceType } from '@/types/opportunity';
import {
  FileText,
  Calendar,
  DollarSign,
  Cake,
  Heart,
  TrendingUp,
  Package,
  Scale,
  BarChart3,
  MessageSquare,
  UserPlus,
} from 'lucide-react';

interface SourceTraceProps {
  sourceType: OpportunitySourceType;
  sourceDescription: string;
  sourceId?: string;
  className?: string;
}

export function SourceTrace({
  sourceType,
  sourceDescription,
  sourceId,
  className = '',
}: SourceTraceProps) {
  const getSourceIcon = () => {
    switch (sourceType) {
      case 'policy_renewal':
        return <FileText className="h-4 w-4" />;
      case 'contract_expiry':
        return <Calendar className="h-4 w-4" />;
      case 'contribution_room':
        return <DollarSign className="h-4 w-4" />;
      case 'life_event':
        return <Heart className="h-4 w-4" />;
      case 'milestone_birthday':
        return <Cake className="h-4 w-4" />;
      case 'milestone_anniversary':
        return <Heart className="h-4 w-4" />;
      case 'market_condition':
        return <TrendingUp className="h-4 w-4" />;
      case 'product_launch':
        return <Package className="h-4 w-4" />;
      case 'regulatory_change':
        return <Scale className="h-4 w-4" />;
      case 'portfolio_analysis':
        return <BarChart3 className="h-4 w-4" />;
      case 'communication_analysis':
        return <MessageSquare className="h-4 w-4" />;
      case 'manual':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceTypeLabel = (): string => {
    const labels: Record<OpportunitySourceType, string> = {
      policy_renewal: 'Policy Renewal',
      contract_expiry: 'Contract Expiry',
      contribution_room: 'Contribution Room',
      life_event: 'Life Event',
      milestone_birthday: 'Birthday Milestone',
      milestone_anniversary: 'Anniversary Milestone',
      market_condition: 'Market Condition',
      product_launch: 'Product Launch',
      regulatory_change: 'Regulatory Change',
      portfolio_analysis: 'Portfolio Analysis',
      communication_analysis: 'Communication Analysis',
      manual: 'Manual Entry',
    };
    return labels[sourceType] || 'Unknown Source';
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="p-2 rounded-lg bg-muted">
        {getSourceIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{getSourceTypeLabel()}</p>
        <p className="text-sm text-muted-foreground">{sourceDescription}</p>
        {sourceId && (
          <p className="text-xs text-muted-foreground mt-1">
            Reference: {sourceId}
          </p>
        )}
      </div>
    </div>
  );
}

interface SourceTraceCardProps {
  opportunity: Opportunity;
}

export function SourceTraceCard({ opportunity }: SourceTraceCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <h4 className="text-sm font-medium mb-3">Source Tracing</h4>
        <SourceTrace
          sourceType={opportunity.sourceType}
          sourceDescription={opportunity.sourceDescription}
          sourceId={opportunity.sourceId}
        />
      </CardContent>
    </Card>
  );
}
