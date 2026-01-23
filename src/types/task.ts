/**
 * Task Types - Matches backend schema
 */

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'needs-review';

export type AIActionType =
  | 'email_draft'
  | 'meeting_notes'
  | 'portfolio_review'
  | 'policy_summary'
  | 'client_summary'
  | 'compliance_check'
  | 'report'
  | 'reminder'
  | 'analysis'
  | 'proposal'
  | 'birthday_greeting'
  | 'renewal_notice';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AICompletionData {
  completed_at: string;
  summary: string;
  details?: string;
  confidence?: number;
  action_type: AIActionType;
  generated_content?: string;
  metadata?: Record<string, unknown>;
}

export interface Task {
  task_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;

  // Relationships
  client_id?: string;
  client_name?: string;
  policy_id?: string;
  assigned_to?: string;

  // Task metadata
  priority?: TaskPriority;
  tags?: string[];
  task_type?: string;

  // AI completion data
  ai_completed?: boolean;
  ai_action_type?: AIActionType;
  ai_completion_data?: AICompletionData;

  // Audit
  created_by?: string;
  updated_by?: string;
}

export interface TaskSummary {
  task_id: string;
  title: string;
  status: TaskStatus;
  due_date?: string;
  priority?: TaskPriority;
  client_name?: string;
  ai_completed?: boolean;
  ai_action_type?: AIActionType;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
  priority?: TaskPriority;
  tags?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  client_id?: string;
  priority?: TaskPriority;
  ai_completed?: boolean;
  assigned_to?: string;
  due_date?: 'today' | 'week' | 'overdue' | 'upcoming';
}
