import type { Message, Card } from './chat';
import type { Task } from './task';
import type { Client } from './client';

export interface ChatState {
  messages: Message[];
  tasks: Task[];
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  currentContext: {
    focusedTaskId?: string;
    focusedClientId?: string;
    lastIntent?: string;
  };
}

export interface ChatContext extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  handleApproveTask: (taskId: string) => Promise<void>;
  handleRejectTask: (taskId: string) => Promise<void>;
  handleCompleteTask: (taskId: string) => Promise<void>;
  handleViewClient: (clientId: string) => void;
  handleUndo: () => void;
  handleResetChat: () => void;
}

export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string; cards?: Card[] } }
  | { type: 'APPEND_TO_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'SET_CONTEXT'; payload: Partial<ChatState['currentContext']> }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'RESET_CHAT' };
