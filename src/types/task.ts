export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'needs-review';

export type AIActionType =
  | 'email_draft'
  | 'portfolio_review'
  | 'meeting_notes'
  | 'report'
  | 'reminder'
  | 'analysis';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string; // ISO string
  clientId?: string;
  clientName?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  // AI auto-completion fields
  aiCompleted?: boolean;
  aiActionType?: AIActionType;
  aiCompletionData?: {
    completedAt: string;
    summary: string;
    details: string;
    confidence: number; // 0-100
  };
}

export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
  clientName?: string;
  priority: 'low' | 'medium' | 'high';
  aiCompleted?: boolean;
}

export interface TaskFilters {
  status?: TaskStatus;
  clientId?: string;
  dueDate?: 'today' | 'week' | 'overdue';
  aiCompleted?: boolean;
}
