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
  const { title, summary, action_type, confidence, task } = data;
  // Support both 'message' and 'content' fields (backend sends 'message')
  const displayContent = data.message || data.content || data.generated_content;
  // Get task_id from task object or directly from data
  const taskId = data.task_id || task?.task_id;
  const [isExpanded, setIsExpanded] = useState(true);

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      email_draft: 'Email Draft',
      portfolio_review: 'Portfolio Review',
      meeting_notes: 'Meeting Notes',
      policy_summary: 'Policy Summary',
      client_summary: 'Client Summary',
      compliance_check: 'Compliance Check',
      report: 'Report',
      reminder: 'Reminder',
      analysis: 'Analysis',
    };
    return labels[type] || type;
  };

  const handleReject = () => {
    if (!taskId) return;
    const reason = prompt('Please provide a reason for rejection (optional):');
    handleRejectTask(taskId, reason || undefined);
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
            <p className="text-sm text-muted-foreground">{summary}</p>
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
              {action_type && (
                <Badge variant="secondary" className="text-xs">
                  {getActionTypeLabel(action_type)}
                </Badge>
              )}
            </div>
            {confidence && (
              <Badge variant="outline" className="text-xs">
                {confidence}% confident
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {displayContent && (
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
                      Hide content
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show content
                    </>
                  )}
                </Button>

                {isExpanded && (
                  <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                    {displayContent}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {taskId && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleApproveTask(taskId)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Send
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
