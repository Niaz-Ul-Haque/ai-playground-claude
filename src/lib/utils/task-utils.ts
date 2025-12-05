import type { Task, TaskStatus } from '@/types/task';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  iconColor: string;
}

export function getStatusConfig(status: TaskStatus): StatusConfig {
  const configs: Record<TaskStatus, StatusConfig> = {
    'pending': {
      label: 'Pending',
      variant: 'outline',
      iconColor: 'text-gray-500'
    },
    'in-progress': {
      label: 'In Progress',
      variant: 'default',
      iconColor: 'text-blue-500'
    },
    'completed': {
      label: 'Completed',
      variant: 'secondary',
      iconColor: 'text-green-500'
    },
    'needs-review': {
      label: 'Needs Review',
      variant: 'destructive',
      iconColor: 'text-yellow-500'
    }
  };

  return configs[status];
}

export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    'pending': ['in-progress', 'completed'],
    'in-progress': ['completed', 'pending'],
    'completed': [], // Cannot transition from completed
    'needs-review': ['completed', 'pending']
  };

  return validTransitions[from]?.includes(to) ?? false;
}

export function getTasksForToday(tasks: Task[]): Task[] {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  return tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= startOfDay && dueDate < endOfDay && task.status !== 'completed';
  });
}

export function getPendingReviewTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.status === 'needs-review');
}

export function getTasksForClient(tasks: Task[], clientId: string): Task[] {
  return tasks.filter(task => task.clientId === clientId);
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: 'text-gray-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  return colors[priority];
}

export function isOverdue(task: Task): boolean {
  if (task.status === 'completed') {
    return false;
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);

  return dueDate < now;
}
