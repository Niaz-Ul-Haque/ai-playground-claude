// Chat Session Types - Phase 1: Core Infrastructure
// Extended session types for the interactive chat system
// Note: Basic ChatSession is defined in session.ts

import type { Message } from './chat';
import type { IntentRoutingContext, PendingAction } from './execution-plan';
import type { EntityType } from './tools';
import type { Block } from './chat-blocks';

/**
 * Extended chat session with full message history and context
 */
export interface ExtendedChatSession {
  /** Session ID */
  id: string;
  /** Session title (auto-generated or custom) */
  title: string;
  /** Full message history */
  messages: Message[];
  /** When session was created */
  createdAt: string;
  /** When session was last updated */
  updatedAt: string;
  /** Whether session is pinned */
  isPinned: boolean;
  /** Entity context for the session */
  entityContext?: {
    focusedClientId?: string;
    focusedClientName?: string;
    focusedTaskId?: string;
    focusedTaskTitle?: string;
    focusedOpportunityId?: string;
  };
  /** Tags for organization */
  tags?: string[];
  /** Session metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Summary version for sidebar display
 */
export interface ChatSessionSummary {
  /** Session ID */
  id: string;
  /** Session title */
  title: string;
  /** Preview of last message */
  lastMessage: string;
  /** Message count */
  messageCount: number;
  /** When created */
  createdAt: string;
  /** When last updated */
  updatedAt: string;
  /** Whether pinned */
  isPinned: boolean;
  /** Primary entity type discussed */
  primaryEntityType?: EntityType;
}

/**
 * Streaming status for the chat
 */
export type StreamingStatus =
  | 'idle'          // Not streaming
  | 'thinking'      // AI is processing
  | 'searching'     // Searching data
  | 'processing'    // Processing tool
  | 'streaming'     // Streaming response
  | 'rendering'     // Rendering blocks
  | 'done'          // Complete
  | 'error';        // Error occurred

/**
 * Stream chunk types for real-time updates
 */
export type StreamChunk =
  | { type: 'thinking'; status: string }        // "Searching clients..."
  | { type: 'text'; content: string }           // Incremental text
  | { type: 'blocks'; blocks: Block[] }         // UI blocks to render
  | { type: 'context'; context: ChatStreamContext } // Updated context
  | { type: 'done' }                            // Stream complete
  | { type: 'error'; message: string; code?: string }; // Error occurred

/**
 * Context passed in stream updates
 */
export interface ChatStreamContext {
  /** Updated focused entities */
  focusedClientId?: string;
  focusedTaskId?: string;
  focusedOpportunityId?: string;
  /** Last intent processed */
  lastIntent?: string;
  /** Pending action for confirmation */
  pendingAction?: PendingAction;
  /** Tasks were updated */
  tasksUpdated?: boolean;
  /** Clients were updated */
  clientsUpdated?: boolean;
}

/**
 * Full chat state with sessions
 */
export interface ChatSessionState {
  /** All sessions */
  sessions: ChatSessionSummary[];
  /** Current active session ID */
  currentSessionId: string | null;
  /** Current session's messages */
  messages: Message[];
  /** Current session's intent context */
  intentContext: IntentRoutingContext;
  /** Streaming status */
  streamingStatus: StreamingStatus;
  /** Current streaming text (partial) */
  streamingText: string;
  /** Current streaming blocks */
  streamingBlocks: Block[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Session storage interface for localStorage
 */
export interface SessionStorage {
  /** Get all session summaries */
  getSessions: () => ChatSessionSummary[];
  /** Get a full session by ID */
  getSession: (id: string) => ExtendedChatSession | null;
  /** Save a session */
  saveSession: (session: ExtendedChatSession) => void;
  /** Delete a session */
  deleteSession: (id: string) => boolean;
  /** Pin/unpin a session */
  togglePin: (id: string) => boolean;
  /** Update session title */
  updateTitle: (id: string, title: string) => boolean;
  /** Search sessions */
  searchSessions: (query: string) => ChatSessionSummary[];
  /** Clear all sessions */
  clearAll: () => void;
}

/**
 * Session manager actions
 */
export type SessionManagerAction =
  | { type: 'CREATE_SESSION' }
  | { type: 'SELECT_SESSION'; sessionId: string }
  | { type: 'DELETE_SESSION'; sessionId: string }
  | { type: 'PIN_SESSION'; sessionId: string }
  | { type: 'UNPIN_SESSION'; sessionId: string }
  | { type: 'RENAME_SESSION'; sessionId: string; title: string }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_CONTEXT'; context: Partial<IntentRoutingContext> }
  | { type: 'SET_STREAMING_STATUS'; status: StreamingStatus }
  | { type: 'APPEND_STREAMING_TEXT'; text: string }
  | { type: 'SET_STREAMING_BLOCKS'; blocks: Block[] }
  | { type: 'CLEAR_STREAMING' }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOAD_SESSIONS'; sessions: ChatSessionSummary[] };

/**
 * Auto-generated title patterns
 */
export interface TitleGenerationConfig {
  /** Max length for title */
  maxLength: number;
  /** Patterns to use for different intent types */
  patterns: Record<string, string>;
  /** Fallback pattern */
  fallback: string;
}

/**
 * Session export format
 */
export interface SessionExport {
  /** Export version */
  version: string;
  /** When exported */
  exportedAt: string;
  /** Sessions included */
  sessions: ExtendedChatSession[];
}
