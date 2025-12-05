'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { ReviewCardData } from '@/types/chat';
import { useChatContext } from '@/context/chat-context';

interface ReviewCardProps {
  data: ReviewCardData;
}

export function ReviewCard({ data }: ReviewCardProps) {
  const { handleApproveTask, handleRejectTask } = useChatContext();
  const { task, title, message } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      email_draft: 'Email Draft',
      portfolio_review: 'Portfolio Review',
      meeting_notes: 'Meeting Notes',
      report: 'Report',
      reminder: 'Reminder',
      analysis: 'Analysis',
    };
    return labels[type] || type;
  };

  return (
    <Card className="my-4 border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Needs Review
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{task.title}</p>
              {task.aiActionType && (
                <Badge variant="secondary" className="text-xs">
                  {getActionTypeLabel(task.aiActionType)}
                </Badge>
              )}
            </div>
            {task.aiCompletionData && (
              <Badge variant="outline" className="text-xs">
                {task.aiCompletionData.confidence}% confident
              </Badge>
            )}
          </div>

          {task.aiCompletionData && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {task.aiCompletionData.summary}
              </p>

              {task.aiCompletionData.details && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 text-xs p-0 hover:bg-transparent"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show details
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                      {task.aiCompletionData.details}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleApproveTask(task.id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve & Send
          </Button>
          <Button
            onClick={() => handleRejectTask(task.id)}
            variant="outline"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
