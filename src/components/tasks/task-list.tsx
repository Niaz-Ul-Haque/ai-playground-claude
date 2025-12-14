'use client';

import React from 'react';
import type { Task } from '@/types/task';
import { TaskCard } from './task-card';
import { ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onMarkComplete?: (taskId: string) => void;
  showClient?: boolean;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onApprove,
  onReject,
  onMarkComplete,
  showClient = true,
  emptyMessage = 'No tasks found.',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onApprove={onApprove}
          onReject={onReject}
          onMarkComplete={onMarkComplete}
          showClient={showClient}
        />
      ))}
    </div>
  );
}
