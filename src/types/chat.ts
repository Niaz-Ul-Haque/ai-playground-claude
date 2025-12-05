import type { Task, TaskSummary } from './task';
import type { Client } from './client';

export type MessageRole = 'user' | 'assistant' | 'system';

export type CardType =
  | 'task-list'
  | 'task'
  | 'client'
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
  | { type: 'review'; data: ReviewCardData }
  | { type: 'confirmation'; data: ConfirmationCardData };

export interface TaskListCardData {
  title: string;
  tasks: TaskSummary[];
  showActions?: boolean;
}

export interface TaskCardData {
  task: Task;
  showActions?: boolean;
}

export interface ClientCardData {
  client: Client;
  recentTasks?: TaskSummary[];
}

export interface ReviewCardData {
  task: Task;
  title: string;
  message: string;
}

export interface ConfirmationCardData {
  type: 'success' | 'error' | 'info';
  message: string;
  undoable?: boolean;
  undoAction?: string;
}

export type ContentSegment =
  | { type: 'text'; content: string }
  | { type: 'card'; card: Card };
