'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, Calendar, CreditCard, Shield } from 'lucide-react';
import type { PolicyCardData } from '@/types/chat';
import { formatCurrency, formatDueDate } from '@/lib/utils/format';

interface PolicyCardProps {
  data: PolicyCardData;
}

export function PolicyCard({ data }: PolicyCardProps) {
  const { policy } = data;

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
      case 'Claim':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Current':
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{policy.policy_number}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">
                {policy.policy_type}
              </Badge>
              <Badge
                variant="outline"
                className={getStatusColor(policy.policy_status)}
              >
                {policy.policy_status}
              </Badge>
              {'payment_status' in policy && policy.payment_status && (
                <Badge
                  variant="outline"
                  className={getPaymentStatusColor(policy.payment_status)}
                >
                  Payment: {policy.payment_status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {'product_name' in policy && policy.product_name && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Product</p>
              <p className="text-sm text-muted-foreground">{policy.product_name}</p>
              {'carrier_name' in policy && policy.carrier_name && (
                <p className="text-xs text-muted-foreground">by {policy.carrier_name}</p>
              )}
            </div>
          </div>
        )}

        {policy.coverage_amount && (
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Coverage Amount
              </span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(policy.coverage_amount)}
            </p>
          </div>
        )}

        <div className="grid gap-3 text-sm">
          {policy.premium_amount && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Premium:</span>
              <span>
                {formatCurrency(policy.premium_amount)}
                {policy.premium_frequency && ` (${policy.premium_frequency})`}
              </span>
            </div>
          )}

          {'renewal_date' in policy && policy.renewal_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Renewal Date:</span>
              <span>{formatDueDate(policy.renewal_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
