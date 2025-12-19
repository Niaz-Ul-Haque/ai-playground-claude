'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Target,
  History,
} from 'lucide-react';
import type { TimelineBlockData } from '@/types/chat-blocks';
import type { TimelineEventType } from '@/types/client';
import { formatRelativeDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface TimelineBlockProps {
  data: TimelineBlockData;
}

const EVENT_ICONS: Record<TimelineEventType, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  policy_change: AlertCircle,
  payment: DollarSign,
  milestone: Target,
  system: AlertCircle,
  task_completed: Clock,
};

const EVENT_COLORS: Record<TimelineEventType, string> = {
  email: 'bg-blue-100 text-blue-600 border-blue-200',
  call: 'bg-green-100 text-green-600 border-green-200',
  meeting: 'bg-purple-100 text-purple-600 border-purple-200',
  note: 'bg-gray-100 text-gray-600 border-gray-200',
  policy_change: 'bg-amber-100 text-amber-600 border-amber-200',
  payment: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  milestone: 'bg-pink-100 text-pink-600 border-pink-200',
  system: 'bg-slate-100 text-slate-600 border-slate-200',
  task_completed: 'bg-teal-100 text-teal-600 border-teal-200',
};

const EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  note: 'Note',
  policy_change: 'Policy Change',
  payment: 'Payment',
  milestone: 'Milestone',
  system: 'System',
  task_completed: 'Task Completed',
};

export function TimelineBlock({ data }: TimelineBlockProps) {
  const {
    title,
    events,
    clientName,
    collapsible = true,
    initialLimit = 5,
  } = data;

  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const displayedEvents = isExpanded ? events : events.slice(0, initialLimit);
  const hasMore = events.length > initialLimit;

  const toggleEventExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  // Group events by date
  const groupEventsByDate = (eventsList: typeof events) => {
    const groups: Record<string, typeof events> = {};

    eventsList.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });

    return groups;
  };

  const groupedEvents = groupEventsByDate(displayedEvents);

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {clientName && (
              <Badge variant="outline">{clientName}</Badge>
            )}
            <Badge variant="secondary">{events.length} events</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <h4 className="text-xs font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                {date}
              </h4>
              <div className="space-y-3">
                {dateEvents.map((event, index) => {
                  const Icon = EVENT_ICONS[event.type] || Clock;
                  const colorClass = EVENT_COLORS[event.type] || 'bg-gray-100 text-gray-600';
                  const isEventExpanded = expandedEventId === event.id;

                  return (
                    <div
                      key={event.id}
                      className="relative flex items-start gap-4"
                    >
                      {/* Timeline connector */}
                      {index < dateEvents.length - 1 && (
                        <div className="absolute left-[18px] top-[36px] w-0.5 h-[calc(100%+4px)] bg-gray-200" />
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center shrink-0 border z-10',
                          colorClass
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div
                        className={cn(
                          'flex-1 min-w-0 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer',
                          isEventExpanded && 'ring-1 ring-primary'
                        )}
                        onClick={() => toggleEventExpand(event.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{event.title}</p>
                              <Badge variant="secondary" className="text-xs">
                                {EVENT_TYPE_LABELS[event.type]}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className={cn(
                                'text-sm text-muted-foreground',
                                !isEventExpanded && 'line-clamp-2'
                              )}>
                                {event.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeDate(event.timestamp)}
                            </span>
                            {event.description && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventExpand(event.id);
                                }}
                              >
                                {isEventExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Metadata */}
                        {isEventExpanded && event.metadata && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/_/g, ' ')}:
                                  </span>{' '}
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Artifacts */}
                        {isEventExpanded && event.artifactIds && event.artifactIds.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">
                              Related Attachments:
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {event.artifactIds.map((artifactId) => (
                                <Badge key={artifactId} variant="outline" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {artifactId}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less */}
        {collapsible && hasMore && (
          <div className="mt-4 pt-4 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show {events.length - initialLimit} More Events
                </>
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No timeline events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
