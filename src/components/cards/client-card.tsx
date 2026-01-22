'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Calendar, TrendingUp, Shield } from 'lucide-react';
import type { ClientCardData } from '@/types/chat';
import { getClientFullName, type Client } from '@/types/client';
import { formatCurrency, formatDueDate, getInitials } from '@/lib/utils/format';

interface ClientCardProps {
  data: ClientCardData;
}

// Type guard to check if client has full Client properties
function isFullClient(client: ClientCardData['client']): client is Client {
  return 'address_line_1' in client || 'internal_notes' in client || 'client_tags' in client;
}

export function ClientCard({ data }: ClientCardProps) {
  const { client, recent_tasks } = data;
  const fullName = getClientFullName(client);

  const getRiskProfileColor = (profile: string | undefined) => {
    if (!profile) return 'bg-gray-100 text-gray-800 border-gray-200';
    const lowerProfile = profile.toLowerCase();
    switch (lowerProfile) {
      case 'aggressive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'conservative':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  // Safe access to full client properties
  const fullClient = isFullClient(client) ? client : null;

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{fullName}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {client.risk_profile && (
                <Badge
                  variant="outline"
                  className={getRiskProfileColor(client.risk_profile)}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {client.risk_profile} risk
                </Badge>
              )}
              {client.client_status && (
                <Badge
                  variant="outline"
                  className={getStatusColor(client.client_status)}
                >
                  {client.client_status}
                </Badge>
              )}
              {client.client_segment && (
                <Badge variant="secondary">
                  {client.client_segment}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {client.portfolio_value && (
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Portfolio Value
              </span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(client.portfolio_value)}
            </p>
          </div>
        )}

        <div className="grid gap-3 text-sm">
          {client.primary_email && (
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">{client.primary_email}</p>
              </div>
            </div>
          )}

          {client.primary_phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-muted-foreground">{client.primary_phone}</p>
              </div>
            </div>
          )}

          {fullClient && (fullClient.address_line_1 || fullClient.city) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-muted-foreground">
                  {fullClient.address_line_1}
                  {fullClient.address_line_2 && <><br />{fullClient.address_line_2}</>}
                  {fullClient.city && (
                    <>
                      <br />
                      {fullClient.city}{fullClient.state_province && `, ${fullClient.state_province}`} {fullClient.postal_code}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {client.next_meeting && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Next Meeting</p>
                <p className="text-muted-foreground">
                  {formatDueDate(client.next_meeting)}
                </p>
              </div>
            </div>
          )}
        </div>

        {fullClient?.internal_notes && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{fullClient.internal_notes}</p>
          </div>
        )}

        {fullClient?.client_tags && fullClient.client_tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {fullClient.client_tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {recent_tasks && recent_tasks.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">Recent Tasks</p>
            <div className="space-y-2">
              {recent_tasks.map((task) => (
                <div
                  key={task.task_id}
                  className="text-sm p-2 rounded bg-muted/50"
                >
                  <p className="font-medium">{task.title}</p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Due: {formatDueDate(task.due_date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
