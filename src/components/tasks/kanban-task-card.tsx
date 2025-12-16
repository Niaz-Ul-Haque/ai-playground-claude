'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Sparkles } from 'lucide-react';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface KanbanTaskCardProps {
  task: Task;
  onClick: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20';
    case 'medium':
      return 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20';
    case 'low':
      return 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20';
    default:
      return '';
  }
};

export function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className={cn(
          'p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4',
          getPriorityColor(task.priority)
        )}
        onClick={onClick}
      >
        {/* Title */}
        <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs px-1.5 py-0"
                style={{
                  backgroundColor: `${label.color}15`,
                  borderColor: label.color,
                  color: label.color,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Client */}
        {task.clientName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">
                {task.clientName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{task.clientName}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
              </div>
            )}
            {task.aiCompleted && (
              <Sparkles className="h-3 w-3 text-purple-500" aria-label="Ciri Completed" />
            )}
          </div>
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
