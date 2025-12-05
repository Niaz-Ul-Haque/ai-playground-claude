'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { TaskListCardData } from '@/types/chat';
import { formatDueDate } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface TaskListCardProps {
  data: TaskListCardData;
}

export function TaskListCard({ data }: TaskListCardProps) {
  const { handleApproveTask, handleRejectTask } = useChatContext();
  const { title, tasks, showActions = false } = data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'needs-review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            return (
              <div
                key={task.id}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.aiCompleted && (
                        <Badge variant="secondary" className="text-xs">
                          AI Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{formatDueDate(task.dueDate)}</span>
                      {task.clientName && (
                        <>
                          <span>•</span>
                          <span>{task.clientName}</span>
                        </>
                      )}
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                {showActions && task.status === 'needs-review' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveTask(task.id)}
                      className="h-8 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectTask(task.id)}
                      className="h-8 text-xs"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
