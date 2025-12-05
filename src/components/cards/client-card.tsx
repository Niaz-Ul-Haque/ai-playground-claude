'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Calendar, TrendingUp, Shield } from 'lucide-react';
import type { ClientCardData } from '@/types/chat';
import { formatCurrency, formatDueDate, getInitials } from '@/lib/utils/format';

interface ClientCardProps {
  data: ClientCardData;
}

export function ClientCard({ data }: ClientCardProps) {
  const { client, recentTasks } = data;

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
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

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{client.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={getRiskProfileColor(client.riskProfile)}
              >
                <Shield className="h-3 w-3 mr-1" />
                {client.riskProfile} risk
              </Badge>
              <Badge variant="secondary">
                {client.accountType}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(client.portfolioValue)}
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground">{client.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-muted-foreground">{client.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">
                {client.address}
                <br />
                {client.city}, {client.province} {client.postalCode}
              </p>
            </div>
          </div>

          {client.nextMeeting && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Next Meeting</p>
                <p className="text-muted-foreground">
                  {formatDueDate(client.nextMeeting)}
                </p>
              </div>
            </div>
          )}
        </div>

        {client.notes && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{client.notes}</p>
          </div>
        )}

        {client.tags && client.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {client.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {recentTasks && recentTasks.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">Recent Tasks</p>
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="text-sm p-2 rounded bg-muted/50"
                >
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDueDate(task.dueDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
