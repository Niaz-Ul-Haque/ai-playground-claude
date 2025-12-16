'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lightbulb,
  RefreshCw,
  Brain,
  Sparkles,
  TrendingUp,
  Database,
} from 'lucide-react';
import type { AdaptationLogEntry, AdaptationLogType } from '@/types/automation';
import { ADAPTATION_TYPE_LABELS } from '@/types/automation';

interface AdaptationLogsProps {
  logs: AdaptationLogEntry[];
  maxHeight?: string;
}

const typeConfig: Record<AdaptationLogType, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  pattern_detected: {
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  sequence_adapted: {
    icon: <RefreshCw className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  preference_inferred: {
    icon: <Brain className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  automation_learned: {
    icon: <Sparkles className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
};

export function AdaptationLogs({ logs, maxHeight = '400px' }: AdaptationLogsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Learning in Progress</h3>
        <p className="text-muted-foreground text-sm">
          As you work, Ciri will learn your patterns and preferences.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          What Ciri Has Learned
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-4 pr-4">
            {logs.map((log) => {
              const config = typeConfig[log.type];
              return (
                <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${config.bgColor} flex items-center justify-center`}
                  >
                    <div className={`w-2 h-2 rounded-full ${config.color} bg-current`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
                          {config.icon}
                          <span className="ml-1">{ADAPTATION_TYPE_LABELS[log.type]}</span>
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">{log.title}</h4>
                      <p className="text-sm text-muted-foreground">{log.description}</p>
                    </div>

                    {/* Insights */}
                    {log.insights && log.insights.length > 0 && (
                      <div className="space-y-1">
                        {log.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-500" />
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Data Points */}
                    {log.dataPoints && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Database className="h-3 w-3" />
                        <span>Based on {log.dataPoints} data points</span>
                      </div>
                    )}

                    {/* Related Automation */}
                    {log.relatedAutomationName && (
                      <Badge variant="outline" className="text-xs">
                        Related to: {log.relatedAutomationName}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
