/**
 * State Types for Chat Context
 */

import type { Message, Card, ChatContext as ApiChatContext, EmailComposerCardData } from './chat';
import type { Task } from './task';
import type { Client } from './client';

export interface ChatState {
  messages: Message[];
  tasks: Task[];
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  currentContext: {
    focused_task_id?: string;
    focused_client_id?: string;
    focused_policy_id?: string;
    current_view?: string;
    last_intent?: string;
  };
}

export interface ChatContextValue extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  handleApproveTask: (taskId: string) => Promise<void>;
  handleRejectTask: (taskId: string, reason?: string) => Promise<void>;
  handleCompleteTask: (taskId: string) => Promise<void>;
  handleViewClient: (clientId: string) => void;
  handleUndo: () => void;
  handleResetChat: () => void;
  refreshTasks: () => Promise<void>;
  refreshClients: () => Promise<void>;
  // Phase 1: Action handlers
  handleSendEmail: (emailData: EmailComposerCardData) => Promise<void>;
  handleCopyToClipboard: (content: string) => Promise<void>;
  handleExecuteAction: (actionType: string, entityType: string, entityId: string, payload?: Record<string, unknown>) => Promise<void>;
}

export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'APPEND_TO_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONTEXT'; payload: Partial<ChatState['currentContext']> }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'RESET_CHAT' };

// Re-export for convenience
export type { ApiChatContext as ChatContext };
