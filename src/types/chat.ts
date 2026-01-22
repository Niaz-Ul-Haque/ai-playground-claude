/**
 * Chat Types - Matches backend schema
 */

import type { Task, TaskSummary, AIActionType } from './task';
import type { Client, ClientSummary } from './client';
import type { Policy, PolicySummary } from './policy';

export type MessageRole = 'user' | 'assistant' | 'system';

export type CardType =
  | 'task-list'
  | 'task'
  | 'client'
  | 'client-list'
  | 'policy'
  | 'policy-list'
  | 'review'
  | 'confirmation';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  cards?: Card[];
}

export type Card =
  | { type: 'task-list'; data: TaskListCardData }
  | { type: 'task'; data: TaskCardData }
  | { type: 'client'; data: ClientCardData }
  | { type: 'client-list'; data: ClientListCardData }
  | { type: 'policy'; data: PolicyCardData }
  | { type: 'policy-list'; data: PolicyListCardData }
  | { type: 'review'; data: ReviewCardData }
  | { type: 'confirmation'; data: ConfirmationCardData };

export interface TaskListCardData {
  title?: string;
  description?: string;
  tasks: TaskSummary[];
  show_actions?: boolean;
}

export interface TaskCardData {
  task: Task;
  show_actions?: boolean;
}

export interface ClientCardData {
  client: Client | ClientSummary;
  show_policies?: boolean;
  recent_tasks?: TaskSummary[];
}

export interface ClientListCardData {
  title?: string;
  clients: ClientSummary[];
}

export interface PolicyCardData {
  policy: Policy | PolicySummary;
  show_claims?: boolean;
}

export interface PolicyListCardData {
  title?: string;
  policies: PolicySummary[];
  client_name?: string;
}

export interface ReviewCardData {
  task_id: string;
  title: string;
  action_type: AIActionType;
  content: string;
  summary: string;
  confidence?: number;
  task?: Task;
}

export interface ConfirmationCardData {
  type: 'success' | 'error' | 'info';
  message: string;
  details?: Record<string, unknown>;
  undoable?: boolean;
  undo_action?: string;
}

export type ContentSegment =
  | { type: 'text'; content: string }
  | { type: 'card'; card: Card };

// Chat Request/Response types
export interface ChatRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context?: ChatContext;
}

export interface ChatContext {
  current_client_id?: string;
  current_policy_id?: string;
  current_task_id?: string;
  current_view?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    cards?: Card[];
    intent?: string;
    context?: {
      client_id?: string;
      policy_id?: string;
      task_id?: string;
    };
  };
  error?: string;
  message?: string;
}
