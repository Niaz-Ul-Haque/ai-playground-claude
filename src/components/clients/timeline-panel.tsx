'use client';

import React from 'react';
import type { TimelineEvent } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Bell,
  CheckCircle,
  MessageSquare,
  DollarSign,
  Star,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TimelinePanelProps {
  events: TimelineEvent[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const getEventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'call':
      return Phone;
    case 'meeting':
      return Calendar;
    case 'note':
      return MessageSquare;
    case 'policy_change':
      return FileText;
    case 'payment':
      return DollarSign;
    case 'milestone':
      return Star;
    case 'system':
      return Settings;
    case 'task_completed':
      return CheckCircle;
    default:
      return Bell;
  }
};

const getEventColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'email':
      return 'text-blue-500 bg-blue-500/10';
    case 'call':
      return 'text-green-500 bg-green-500/10';
    case 'meeting':
      return 'text-purple-500 bg-purple-500/10';
    case 'note':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'policy_change':
      return 'text-orange-500 bg-orange-500/10';
    case 'payment':
      return 'text-emerald-500 bg-emerald-500/10';
    case 'milestone':
      return 'text-pink-500 bg-pink-500/10';
    case 'system':
      return 'text-gray-500 bg-gray-500/10';
    case 'task_completed':
      return 'text-teal-500 bg-teal-500/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const getEventBadgeVariant = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'milestone':
      return 'default';
    case 'policy_change':
    case 'payment':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function TimelinePanel({ events, onLoadMore, hasMore }: TimelinePanelProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {events.map((event) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);

              return (
                <div key={event.id} className="relative pl-10">
                  {/* Icon */}
                  <div
                    className={`absolute left-0 p-2 rounded-full ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{event.title}</p>
                          <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                            {event.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                        {event.metadata && (
                          <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                            {typeof event.metadata.duration === 'number' && (
                              <span>Duration: {event.metadata.duration} min</span>
                            )}
                            {typeof event.metadata.amount === 'number' && (
                              <span>
                                Amount: ${event.metadata.amount.toLocaleString()}
                              </span>
                            )}
                            {Array.isArray(event.metadata.attendees) && (
                              <span>
                                Attendees: {(event.metadata.attendees as string[]).join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        <div>{format(new Date(event.timestamp), 'MMM d')}</div>
                        <div className="text-right">
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && onLoadMore && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={onLoadMore} className="gap-2">
                <ChevronDown className="h-4 w-4" />
                Load More
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
