'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, DollarSign, Calendar } from 'lucide-react';
import type { PolicyListCardData } from '@/types/chat';
import { formatCurrency, formatDueDate } from '@/lib/utils/format';

interface PolicyListCardProps {
  data: PolicyListCardData;
}

export function PolicyListCard({ data }: PolicyListCardProps) {
  const { title, policies, client_name } = data;

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Lapsed':
      case 'Cancelled':
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Matured':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-lg">{title || 'Policies'}</CardTitle>
        {client_name && (
          <p className="text-sm text-muted-foreground">For {client_name}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.policy_id}
              className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Shield className="h-4 w-4 text-primary mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-sm">{policy.policy_number}</p>
                    <Badge
                      variant="outline"
                      className={getStatusColor(policy.policy_status)}
                    >
                      {policy.policy_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>{policy.policy_type}</span>
                    {policy.product_name && (
                      <>
                        <span>•</span>
                        <span>{policy.product_name}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    {policy.coverage_amount && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span>{formatCurrency(policy.coverage_amount)}</span>
                      </div>
                    )}
                    {policy.premium_amount && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {formatCurrency(policy.premium_amount)}
                          {policy.premium_frequency && `/${policy.premium_frequency.toLowerCase().slice(0, 3)}`}
                        </span>
                      </div>
                    )}
                    {policy.renewal_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>Renews {formatDueDate(policy.renewal_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
