import type { Message, Card } from './chat';
import type { Task } from './task';
import type { Client } from './client';
import type { ChatSessionSummary, StreamingStatus } from './chat-session';

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
  // Session state (Phase 4)
  currentSessionId: string | null;
  sessions: ChatSessionSummary[];
  streamingStatus: StreamingStatus;
  streamingText: string;
  isSidebarOpen: boolean;
}

export interface ChatContext extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  handleApproveTask: (taskId: string) => Promise<void>;
  handleRejectTask: (taskId: string) => Promise<void>;
  handleCompleteTask: (taskId: string) => Promise<void>;
  handleViewClient: (clientId: string) => void;
  handleUndo: () => void;
  handleResetChat: () => void;
  // Session actions (Phase 4)
  createNewSession: () => void;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  pinSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  searchSessions: (query: string) => void;
  toggleSidebar: () => void;
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
  | { type: 'RESET_CHAT' }
  // Session actions (Phase 4)
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_CURRENT_SESSION'; payload: string | null }
  | { type: 'SET_SESSIONS'; payload: ChatSessionSummary[] }
  | { type: 'SET_STREAMING_STATUS'; payload: StreamingStatus }
  | { type: 'SET_STREAMING_TEXT'; payload: string }
  | { type: 'APPEND_STREAMING_TEXT'; payload: string }
  | { type: 'CLEAR_STREAMING' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean };
