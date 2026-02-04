'use client';

import { useState } from 'react';
import type { RenewalNoticeCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Phone,
  Scale,
  Bell,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface RenewalNoticeCardProps {
  data: RenewalNoticeCardData;
}

const URGENCY_COLORS = {
  low: 'border-l-blue-500',
  medium: 'border-l-amber-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

const URGENCY_BADGES = {
  low: <Badge variant="outline" className="border-blue-400 text-blue-600">Low Priority</Badge>,
  medium: <Badge variant="outline" className="border-amber-400 text-amber-600">Medium Priority</Badge>,
  high: <Badge className="bg-orange-500">High Priority</Badge>,
  critical: <Badge variant="destructive">Critical</Badge>,
};

export function RenewalNoticeCard({ data }: RenewalNoticeCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const policies = data.policies || [];

  const handleInitiateRenewal = async (policyId: string) => {
    setActionLoading(`renew-${policyId}`);
    try {
      await handleExecuteAction('initiate_renewal', 'policy', policyId, {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleContactClient = async (policyId: string) => {
    const policy = policies.find(p => p.policy_id === policyId);
    await handleExecuteAction('contact_client', 'policy', policyId, {
      client_name: policy?.client_name,
    });
  };

  const handleCompareQuotes = async (policyId: string) => {
    setActionLoading(`compare-${policyId}`);
    try {
      await handleExecuteAction('compare_quotes', 'policy', policyId, {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetReminder = async (policyId: string) => {
    const policy = policies.find(p => p.policy_id === policyId);
    await handleExecuteAction('set_reminder', 'policy', policyId, {
      title: `Renewal reminder: ${policy?.policy_number}`,
      due_date: policy?.expiry_date,
    });
  };

  const getPremiumChangeIndicator = (change?: number) => {
    if (change === undefined || change === null) return null;
    
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-red-500">
          <TrendingUp className="w-4 h-4" />
          +{change.toFixed(1)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-green-500">
          <TrendingDown className="w-4 h-4" />
          {change.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-4 h-4" />
        No change
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'renewed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Renewed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'due':
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Due</Badge>;
    }
  };

  const getDaysRemainingText = (days: number): React.ReactNode => {
    if (days < 0) {
      return (
        <span className="text-red-500 font-medium">
          {Math.abs(days)} days overdue
        </span>
      );
    } else if (days === 0) {
      return <span className="text-red-500 font-medium">Due today!</span>;
    } else if (days <= 7) {
      return <span className="text-orange-500 font-medium">{days} days left</span>;
    } else if (days <= 30) {
      return <span className="text-amber-500">{days} days left</span>;
    }
    return <span className="text-muted-foreground">{days} days left</span>;
  };

  const actions = data.available_actions || ['initiate_renewal', 'contact_client', 'compare_quotes'];

  return (
    <Card className={`my-4 border-l-4 ${URGENCY_COLORS[data.urgency]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">{data.title || 'Policy Renewals'}</CardTitle>
          </div>
          {URGENCY_BADGES[data.urgency]}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {policies.map(policy => (
          <div
            key={policy.policy_id}
            className={`p-4 border rounded-lg ${
              policy.status === 'overdue' ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' :
              policy.days_remaining <= 7 ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' :
              ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{policy.policy_number}</h4>
                  {getStatusBadge(policy.status)}
                </div>
                <p className="text-sm text-muted-foreground">{policy.type}</p>
                <p className="text-sm">{policy.client_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-medium">
                  {new Date(policy.expiry_date).toLocaleDateString()}
                </p>
                {getDaysRemainingText(policy.days_remaining)}
              </div>
            </div>

            {/* Premium Info */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Current Premium</p>
                <p className="font-medium">{formatCurrency(policy.current_premium)}</p>
              </div>
              {policy.projected_premium && (
                <div>
                  <p className="text-xs text-muted-foreground">Projected Premium</p>
                  <p className="font-medium">{formatCurrency(policy.projected_premium)}</p>
                </div>
              )}
              {policy.premium_change !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground">Change</p>
                  {getPremiumChangeIndicator(policy.premium_change)}
                </div>
              )}
            </div>

            {/* Actions */}
            {policy.status !== 'renewed' && policy.status !== 'cancelled' && (
              <div className="flex flex-wrap gap-2 mt-3">
                {actions.includes('initiate_renewal') && (
                  <Button
                    size="sm"
                    onClick={() => handleInitiateRenewal(policy.policy_id)}
                    disabled={actionLoading === `renew-${policy.policy_id}`}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading === `renew-${policy.policy_id}` ? 'animate-spin' : ''}`} />
                    Initiate Renewal
                  </Button>
                )}
                {actions.includes('contact_client') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContactClient(policy.policy_id)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Client
                  </Button>
                )}
                {actions.includes('compare_quotes') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompareQuotes(policy.policy_id)}
                    disabled={actionLoading === `compare-${policy.policy_id}`}
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Compare Quotes
                  </Button>
                )}
                {actions.includes('set_reminder') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetReminder(policy.policy_id)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>

      {policies.length > 1 && (
        <CardFooter className="pt-4 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {policies.length} policies
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {policies.filter(p => p.status === 'overdue' || p.days_remaining <= 7).length} urgent
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
