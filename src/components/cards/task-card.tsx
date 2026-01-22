'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, User, Calendar, Tag } from 'lucide-react';
import type { TaskCardData } from '@/types/chat';
import { formatDueDate } from '@/lib/utils/format';
import { getStatusConfig } from '@/lib/utils/task-utils';
import { useChatContext } from '@/context/chat-context';

interface TaskCardProps {
  data: TaskCardData;
}

export function TaskCard({ data }: TaskCardProps) {
  const { handleCompleteTask } = useChatContext();
  const { task, show_actions = true } = data;
  const statusConfig = getStatusConfig(task.status);

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
      case 'urgent':
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
              {task.priority && (
                <Badge
                  variant="outline"
                  className={getPriorityColor(task.priority)}
                >
                  {task.priority} priority
                </Badge>
              )}
              {task.ai_completed && (
                <Badge variant="secondary">AI Completed</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}

        <div className="grid gap-3 text-sm">
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Due:</span>
              <span>{formatDueDate(task.due_date)}</span>
            </div>
          )}

          {task.client_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Client:</span>
              <span>{task.client_name}</span>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tags:</span>
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {task.ai_completion_data && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-sm text-blue-900 mb-1">
              AI Completion Summary
            </p>
            <p className="text-sm text-blue-800">
              {task.ai_completion_data.summary}
            </p>
            {task.ai_completion_data.confidence && (
              <p className="text-xs text-blue-600 mt-2">
                Confidence: {task.ai_completion_data.confidence}%
              </p>
            )}
          </div>
        )}

        {show_actions && task.status !== 'completed' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleCompleteTask(task.task_id)}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          </div>
        )}

        {task.status === 'completed' && task.completed_at && (
          <div className="flex items-center gap-2 text-sm text-green-600 pt-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed {formatDueDate(task.completed_at)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
