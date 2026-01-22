'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, TrendingUp } from 'lucide-react';
import type { ClientListCardData } from '@/types/chat';
import { getClientFullName } from '@/types/client';
import { formatCurrency, getInitials } from '@/lib/utils/format';

interface ClientListCardProps {
  data: ClientListCardData;
}

export function ClientListCard({ data }: ClientListCardProps) {
  const { title, clients } = data;

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Prospect':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dormant':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-lg">{title || 'Clients'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients.map((client) => {
            const fullName = getClientFullName(client);
            return (
              <div
                key={client.client_id}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {getInitials(fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{fullName}</p>
                      {client.client_status && (
                        <Badge
                          variant="outline"
                          className={getStatusColor(client.client_status)}
                        >
                          {client.client_status}
                        </Badge>
                      )}
                      {client.client_segment && (
                        <Badge variant="secondary" className="text-xs">
                          {client.client_segment}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      {client.primary_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{client.primary_email}</span>
                        </div>
                      )}
                      {client.portfolio_value && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{formatCurrency(client.portfolio_value)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
