# Ciri - Data Models

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Ciri - Financial Advisor Assistant |
| **Version** | 1.0.0 (MVP) |
| **Date** | December 4, 2025 |
| **Author** | spec-architect |
| **Status** | Draft |

---

## Overview

This document defines all TypeScript interfaces and types used in Ciri. These models are organized by domain: Tasks, Clients, Chat, and State Management.

---

## Core Entity Models

### Task Model

```typescript
// src/types/task.ts

/**
 * Status of a task in the system
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'needs-review';

/**
 * Type of action the AI completed for auto-completed tasks
 */
export type AIActionType =
  | 'email_draft'
  | 'portfolio_review'
  | 'meeting_notes'
  | 'report'
  | 'reminder'
  | 'analysis';

/**
 * Core task entity representing advisor work items
 */
export interface Task {
  /** Unique identifier */
  id: string;

  /** Task title - displayed in lists and cards */
  title: string;

  /** Detailed description of the task */
  description: string;

  /** Associated client ID */
  clientId: string;

  /** Client name (denormalized for display) */
  clientName: string;

  /** Due date and time in ISO 8601 format */
  dueDate: string;

  /** Current status of the task */
  status: TaskStatus;

  /** Whether this task was auto-completed by AI */
  aiCompleted: boolean;

  /** When AI completed the task (if applicable) */
  aiCompletedAt?: string;

  /** Type of AI action performed */
  aiActionType?: AIActionType;

  /** Summary of what AI did */
  aiSummary?: string;

  /** Detailed content of AI work (e.g., email draft) */
  aiContent?: string;

  /** When the task was created */
  createdAt: string;

  /** When the task was last updated */
  updatedAt: string;
}

/**
 * Summary version for list displays
 */
export interface TaskSummary {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  dueDate: string;
  status: TaskStatus;
  aiCompleted: boolean;
}

/**
 * Filters for querying tasks
 */
export interface TaskFilters {
  /** Filter by status */
  status?: TaskStatus | TaskStatus[];

  /** Filter by client ID */
  clientId?: string;

  /** Filter by due date (start of range) */
  dueDateFrom?: string;

  /** Filter by due date (end of range) */
  dueDateTo?: string;

  /** Filter by AI completed flag */
  aiCompleted?: boolean;

  /** Sort field */
  sortBy?: 'dueDate' | 'status' | 'clientName' | 'createdAt';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';

  /** Maximum number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Task update payload
 */
export interface TaskUpdate {
  status?: TaskStatus;
  title?: string;
  description?: string;
  dueDate?: string;
}

/**
 * Status transition validation
 */
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  'pending': ['in-progress', 'completed'],
  'in-progress': ['completed', 'pending'],
  'needs-review': ['completed', 'pending'],
  'completed': [], // Cannot transition from completed in MVP
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
```

### Client Model

```typescript
// src/types/client.ts

/**
 * Risk profile for client portfolio
 */
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

/**
 * Core client entity representing advisor's customers
 */
export interface Client {
  /** Unique identifier */
  id: string;

  /** Full name of the client */
  name: string;

  /** Primary email address */
  email: string;

  /** Phone number (optional) */
  phone?: string;

  /** Total portfolio value in CAD */
  portfolioValue: number;

  /** Investment risk profile */
  riskProfile: RiskProfile;

  /** Last contact date in ISO 8601 format */
  lastContact: string;

  /** Notes about the client */
  notes?: string;

  /** When the client record was created */
  createdAt: string;

  /** When the client record was last updated */
  updatedAt: string;
}

/**
 * Client with task count for display
 */
export interface ClientWithTasks extends Client {
  /** Number of active tasks for this client */
  taskCount: number;

  /** Number of tasks needing review */
  pendingReviewCount: number;
}

/**
 * Summary version for card displays
 */
export interface ClientSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  portfolioValue: number;
  riskProfile: RiskProfile;
  lastContact: string;
  taskCount: number;
}

/**
 * Filters for querying clients
 */
export interface ClientFilters {
  /** Search by name (partial match) */
  nameSearch?: string;

  /** Filter by risk profile */
  riskProfile?: RiskProfile;

  /** Filter by minimum portfolio value */
  minPortfolioValue?: number;

  /** Sort field */
  sortBy?: 'name' | 'portfolioValue' | 'lastContact';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';

  /** Maximum number of results */
  limit?: number;
}
```

---

## Chat and Message Models

### Message Model

```typescript
// src/types/chat.ts

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Types of cards that can be embedded in messages
 */
export type CardType =
  | 'task-card'
  | 'task-list'
  | 'client-card'
  | 'review-card'
  | 'confirmation';

/**
 * Base message structure
 */
export interface Message {
  /** Unique identifier */
  id: string;

  /** Role: user, assistant, or system */
  role: MessageRole;

  /** Text content of the message */
  content: string;

  /** Timestamp in ISO 8601 format */
  timestamp: string;

  /** Type of embedded card (if any) */
  cardType?: CardType;

  /** Data for embedded card */
  cardData?: CardData;

  /** Whether this message contains an error */
  isError?: boolean;

  /** Error details if isError is true */
  error?: MessageError;

  /** Whether the message is still streaming */
  isStreaming?: boolean;
}

/**
 * Discriminated union for card data
 */
export type CardData =
  | { type: 'task-card'; data: TaskCardData }
  | { type: 'task-list'; data: TaskListCardData }
  | { type: 'client-card'; data: ClientCardData }
  | { type: 'review-card'; data: ReviewCardData }
  | { type: 'confirmation'; data: ConfirmationCardData };

/**
 * Error information in messages
 */
export interface MessageError {
  code: string;
  message: string;
  retryable: boolean;
  originalContent?: string;
}

/**
 * Parsed content segment (text or card)
 */
export type ContentSegment =
  | { type: 'text'; content: string }
  | { type: 'card'; cardType: CardType; data: unknown };

/**
 * Parsed message content
 */
export interface ParsedContent {
  segments: ContentSegment[];
}
```

### Card Data Models

```typescript
// src/types/chat.ts (continued)

/**
 * Data for TaskListCard component
 */
export interface TaskListCardData {
  /** Optional title for the list */
  title?: string;

  /** Array of tasks to display */
  tasks: TaskSummary[];

  /** Filter applied to the list */
  filter?: 'today' | 'pending-review' | 'all' | 'client';

  /** Client ID if filtered by client */
  clientId?: string;

  /** Whether more tasks are available */
  hasMore?: boolean;

  /** Total count of tasks matching filter */
  totalCount?: number;
}

/**
 * Data for TaskCard component
 */
export interface TaskCardData {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  status: TaskStatus;
  aiCompleted: boolean;
  aiCompletedAt?: string;
  aiSummary?: string;
  aiContent?: string;
  lastUpdated: string;
}

/**
 * Data for ClientCard component
 */
export interface ClientCardData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  portfolioValue: number;
  riskProfile: RiskProfile;
  lastContact: string;
  taskCount: number;
}

/**
 * Data for ReviewCard component
 */
export interface ReviewCardData {
  taskId: string;
  taskTitle: string;
  clientId: string;
  clientName: string;
  completedAt: string;
  actionType: AIActionType;
  summary: string;
  details: string;
  previewContent?: string;
}

/**
 * Data for ConfirmationCard component
 */
export interface ConfirmationCardData {
  success: boolean;
  action: 'approved' | 'rejected' | 'completed' | 'updated';
  taskId?: string;
  taskTitle?: string;
  clientName?: string;
  message: string;
  undoable: boolean;
  previousState?: TaskStatus;
}
```

---

## Intent and AI Models

```typescript
// src/types/intent.ts

/**
 * Recognized user intents
 */
export type UserIntent =
  | 'show_todays_tasks'
  | 'show_pending_reviews'
  | 'show_task_status'
  | 'show_client_info'
  | 'approve_task'
  | 'reject_task'
  | 'complete_task'
  | 'general_question';

/**
 * Extracted entities from user message
 */
export interface ExtractedEntities {
  /** Task name or partial match */
  taskName?: string;

  /** Task ID if explicitly referenced */
  taskId?: string;

  /** Client name or partial match */
  clientName?: string;

  /** Client ID if explicitly referenced */
  clientId?: string;

  /** Date reference (today, tomorrow, specific date) */
  date?: string;

  /** Status mentioned */
  status?: TaskStatus;
}

/**
 * Intent classification result
 */
export interface IntentClassification {
  /** Identified intent */
  intent: UserIntent;

  /** Confidence score (0-1) */
  confidence: number;

  /** Extracted entities */
  entities: ExtractedEntities;

  /** Whether context resolution is needed */
  requiresContext: boolean;

  /** Resolved references (after context resolution) */
  resolved?: {
    taskId?: string;
    clientId?: string;
  };
}

/**
 * Conversation context for reference resolution
 */
export interface ConversationContext {
  /** Currently focused task ID */
  focusedTaskId: string | null;

  /** Currently focused client ID */
  focusedClientId: string | null;

  /** Last card type displayed */
  lastCardType: CardType | null;

  /** Last few messages for context */
  recentMessages: Message[];
}

/**
 * AI prompt configuration
 */
export interface PromptConfig {
  /** System prompt template */
  systemPrompt: string;

  /** Intent-specific instructions */
  intentInstructions: Record<UserIntent, string>;

  /** Maximum tokens for response */
  maxTokens: number;

  /** Temperature for AI responses */
  temperature: number;
}
```

---

## State Management Models

```typescript
// src/types/state.ts

import { Message, CardType } from './chat';
import { Task } from './task';
import { Client } from './client';

/**
 * Global application state
 */
export interface ChatState {
  /** Conversation message history */
  messages: Message[];

  /** All tasks */
  tasks: Task[];

  /** All clients */
  clients: Client[];

  /** Whether AI is currently responding */
  isLoading: boolean;

  /** Current error (if any) */
  error: Error | null;

  /** Conversation context for reference resolution */
  currentContext: ChatContext;

  /** Session metadata */
  session: SessionMeta;
}

/**
 * Context tracking for implicit references
 */
export interface ChatContext {
  /** Currently focused task ID */
  focusedTaskId: string | null;

  /** Currently focused client ID */
  focusedClientId: string | null;

  /** Last card type displayed */
  lastCardType: CardType | null;

  /** Last action performed (for undo) */
  lastAction?: UndoableAction;
}

/**
 * Session metadata
 */
export interface SessionMeta {
  /** Session start time */
  startedAt: string;

  /** Total messages sent */
  messageCount: number;

  /** Last activity time */
  lastActivityAt: string;
}

/**
 * Undoable action for undo functionality
 */
export interface UndoableAction {
  /** Action type */
  type: 'approve' | 'reject' | 'complete';

  /** Target task ID */
  taskId: string;

  /** Previous status */
  previousStatus: TaskStatus;

  /** Timestamp of action */
  timestamp: string;
}

/**
 * State reducer action types
 */
export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'APPEND_TO_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_MESSAGE_COMPLETE'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'UPDATE_TASKS'; payload: Task[] }
  | { type: 'SET_CONTEXT'; payload: Partial<ChatContext> }
  | { type: 'SET_LAST_ACTION'; payload: UndoableAction }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'CLEAR_CHAT' }
  | { type: 'HYDRATE_FROM_STORAGE'; payload: Partial<ChatState> };

/**
 * Initial state factory
 */
export function createInitialState(
  tasks: Task[],
  clients: Client[]
): ChatState {
  return {
    messages: [],
    tasks,
    clients,
    isLoading: false,
    error: null,
    currentContext: {
      focusedTaskId: null,
      focusedClientId: null,
      lastCardType: null,
    },
    session: {
      startedAt: new Date().toISOString(),
      messageCount: 0,
      lastActivityAt: new Date().toISOString(),
    },
  };
}
```

---

## API Request/Response Models

```typescript
// src/types/api.ts

import { Message, CardType } from './chat';
import { TaskStatus } from './task';

/**
 * Chat API request body
 */
export interface ChatRequest {
  /** Conversation messages */
  messages: Message[];

  /** Optional context for reference resolution */
  context?: {
    focusedTaskId?: string | null;
    focusedClientId?: string | null;
    lastCardType?: CardType | null;
  };

  /** Optional action for card interactions */
  action?: CardAction;
}

/**
 * Card action payload
 */
export interface CardAction {
  /** Action type */
  type: 'approve' | 'reject' | 'complete' | 'view_tasks';

  /** Target task ID */
  taskId?: string;

  /** Target client ID */
  clientId?: string;
}

/**
 * Stream event types
 */
export type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'card'; cardType: CardType; data: unknown }
  | { type: 'done' }
  | { type: 'error'; error: ErrorPayload };

/**
 * Error payload in stream
 */
export interface ErrorPayload {
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

/**
 * API error response
 */
export interface APIError {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    retryAfter?: number;
    details?: Record<string, unknown>;
  };
}

/**
 * Error codes
 */
export const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  EMPTY_MESSAGE: 'EMPTY_MESSAGE',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  RATE_LIMITED: 'RATE_LIMITED',
  AI_ERROR: 'AI_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

---

## Mock Data Structure

```typescript
// src/lib/mock-data/tasks.ts

import { Task, TaskStatus, TaskFilters } from '@/types/task';

/**
 * Initial mock tasks
 */
export const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Call Robert Johnson about retirement plan adjustments',
    description: 'Discuss the proposed changes to his retirement portfolio allocation based on the recent market analysis.',
    clientId: 'client-001',
    clientName: 'Robert Johnson',
    dueDate: '2025-12-04T14:00:00Z',
    status: 'pending',
    aiCompleted: false,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'task-002',
    title: 'Review Chen portfolio rebalancing',
    description: 'Review and approve the Q4 portfolio rebalancing recommendations generated by the system.',
    clientId: 'client-002',
    clientName: 'Sarah Chen',
    dueDate: '2025-12-04T15:30:00Z',
    status: 'needs-review',
    aiCompleted: true,
    aiCompletedAt: '2025-12-04T08:00:00Z',
    aiActionType: 'portfolio_review',
    aiSummary: 'Rebalanced portfolio to maintain 60/40 allocation. Recommended selling AAPL and buying VTI.',
    aiContent: `Portfolio Rebalancing Recommendation

Current Allocation:
- Stocks: 65% (target: 60%)
- Bonds: 35% (target: 40%)

Recommended Trades:
1. Sell 50 shares AAPL at $190.25 = $9,512.50
2. Buy 100 shares VTI at $245.00 = $24,500.00
3. Buy 200 shares BND at $72.50 = $14,500.00

Expected Outcome:
- Stocks: 60.2%
- Bonds: 39.8%

Tax Implications:
- Short-term capital gains: $1,250
- Recommend harvesting losses from XYZ position to offset`,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2025-12-04T08:00:00Z',
  },
  {
    id: 'task-003',
    title: 'Send Michael Kim quarterly performance report',
    description: 'Prepare and send the Q4 portfolio performance summary to Michael Kim.',
    clientId: 'client-003',
    clientName: 'Michael Kim',
    dueDate: '2025-12-04T17:00:00Z',
    status: 'pending',
    aiCompleted: false,
    createdAt: '2025-12-02T10:00:00Z',
    updatedAt: '2025-12-02T10:00:00Z',
  },
  {
    id: 'task-004',
    title: 'Review Williams insurance analysis',
    description: 'Review the AI-generated insurance coverage analysis for the Williams family.',
    clientId: 'client-004',
    clientName: 'David Williams',
    dueDate: '2025-12-05T10:00:00Z',
    status: 'needs-review',
    aiCompleted: true,
    aiCompletedAt: '2025-12-04T07:30:00Z',
    aiActionType: 'analysis',
    aiSummary: 'Completed insurance coverage gap analysis. Identified potential underinsurance in life coverage.',
    aiContent: `Insurance Coverage Analysis - Williams Family

Current Coverage:
- Life Insurance: $500,000 term (David)
- Life Insurance: $250,000 term (Lisa)
- Disability: 60% income replacement
- Home Insurance: $450,000 dwelling coverage

Recommended Adjustments:
1. Increase David's life coverage to $1,000,000 (based on income replacement needs)
2. Add umbrella policy: $2,000,000
3. Consider adding critical illness coverage

Cost Impact:
- Additional monthly premium: ~$150-200
- Current gap in coverage: ~$500,000`,
    createdAt: '2025-12-03T09:00:00Z',
    updatedAt: '2025-12-04T07:30:00Z',
  },
  {
    id: 'task-005',
    title: 'Prepare Anderson estate planning meeting',
    description: 'Prepare materials for the upcoming estate planning discussion with the Andersons.',
    clientId: 'client-005',
    clientName: 'Patricia Anderson',
    dueDate: '2025-12-05T14:00:00Z',
    status: 'in-progress',
    aiCompleted: false,
    createdAt: '2025-12-02T11:00:00Z',
    updatedAt: '2025-12-04T09:00:00Z',
  },
  {
    id: 'task-006',
    title: 'Follow up on Johnson tax documents',
    description: 'Remind Robert Johnson to submit his year-end tax documents.',
    clientId: 'client-001',
    clientName: 'Robert Johnson',
    dueDate: '2025-12-06T09:00:00Z',
    status: 'pending',
    aiCompleted: false,
    createdAt: '2025-12-03T14:00:00Z',
    updatedAt: '2025-12-03T14:00:00Z',
  },
  {
    id: 'task-007',
    title: 'Draft Chen year-end summary email',
    description: 'Review the AI-drafted year-end portfolio summary email for Sarah Chen.',
    clientId: 'client-002',
    clientName: 'Sarah Chen',
    dueDate: '2025-12-06T12:00:00Z',
    status: 'needs-review',
    aiCompleted: true,
    aiCompletedAt: '2025-12-04T06:00:00Z',
    aiActionType: 'email_draft',
    aiSummary: 'Drafted year-end portfolio summary email highlighting 12.5% YTD returns.',
    aiContent: `Subject: Your 2025 Portfolio Year in Review

Dear Sarah,

I hope this message finds you well. As we approach the end of 2025, I wanted to share a summary of your portfolio's performance this year.

Key Highlights:
- Year-to-Date Return: +12.5%
- Total Portfolio Value: $1,406,250 (up from $1,250,000)
- Benchmark Comparison: Outperformed S&P 500 by 2.1%

Looking Ahead:
We'll be scheduling our annual review meeting in January to discuss your 2026 investment strategy and any adjustments to your financial plan.

Best regards,
[Your Name]
Financial Advisor`,
    createdAt: '2025-12-04T06:00:00Z',
    updatedAt: '2025-12-04T06:00:00Z',
  },
  {
    id: 'task-008',
    title: 'Complete Kim beneficiary update',
    description: 'Process the beneficiary designation update for Michael Kim\'s accounts.',
    clientId: 'client-003',
    clientName: 'Michael Kim',
    dueDate: '2025-12-03T16:00:00Z',
    status: 'completed',
    aiCompleted: false,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-03T15:45:00Z',
  },
  {
    id: 'task-009',
    title: 'Schedule Williams family annual review',
    description: 'Set up the annual financial review meeting with David and Lisa Williams.',
    clientId: 'client-004',
    clientName: 'David Williams',
    dueDate: '2025-12-07T11:00:00Z',
    status: 'pending',
    aiCompleted: false,
    createdAt: '2025-12-04T08:00:00Z',
    updatedAt: '2025-12-04T08:00:00Z',
  },
  {
    id: 'task-010',
    title: 'Process Anderson contribution',
    description: 'Process the year-end RRSP contribution for Patricia Anderson.',
    clientId: 'client-005',
    clientName: 'Patricia Anderson',
    dueDate: '2025-12-10T15:00:00Z',
    status: 'pending',
    aiCompleted: false,
    createdAt: '2025-12-04T07:00:00Z',
    updatedAt: '2025-12-04T07:00:00Z',
  },
];

// src/lib/mock-data/clients.ts

import { Client } from '@/types/client';

/**
 * Initial mock clients
 */
export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-001',
    name: 'Robert Johnson',
    email: 'robert.johnson@email.com',
    phone: '(416) 555-1234',
    portfolioValue: 850000,
    riskProfile: 'moderate',
    lastContact: '2025-12-02T14:30:00Z',
    notes: 'Retiring in 5 years. Focus on income generation.',
    createdAt: '2023-03-15T09:00:00Z',
    updatedAt: '2025-12-02T14:30:00Z',
  },
  {
    id: 'client-002',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '(416) 555-2345',
    portfolioValue: 1250000,
    riskProfile: 'moderate',
    lastContact: '2025-12-02T10:00:00Z',
    notes: 'Tech executive. Interested in ESG investments.',
    createdAt: '2022-08-10T09:00:00Z',
    updatedAt: '2025-12-02T10:00:00Z',
  },
  {
    id: 'client-003',
    name: 'Michael Kim',
    email: 'michael.kim@email.com',
    phone: '(416) 555-3456',
    portfolioValue: 450000,
    riskProfile: 'aggressive',
    lastContact: '2025-12-01T16:00:00Z',
    notes: 'Young professional. Long investment horizon.',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2025-12-01T16:00:00Z',
  },
  {
    id: 'client-004',
    name: 'David Williams',
    email: 'david.williams@email.com',
    phone: '(416) 555-4567',
    portfolioValue: 2100000,
    riskProfile: 'conservative',
    lastContact: '2025-11-28T11:00:00Z',
    notes: 'Family with two children. Focus on education savings and insurance.',
    createdAt: '2021-05-12T09:00:00Z',
    updatedAt: '2025-11-28T11:00:00Z',
  },
  {
    id: 'client-005',
    name: 'Patricia Anderson',
    email: 'patricia.anderson@email.com',
    phone: '(416) 555-5678',
    portfolioValue: 3500000,
    riskProfile: 'moderate',
    lastContact: '2025-11-25T09:00:00Z',
    notes: 'Retired. Estate planning focus. Charitable giving interests.',
    createdAt: '2019-11-03T09:00:00Z',
    updatedAt: '2025-11-25T09:00:00Z',
  },
];
```

---

## Utility Types

```typescript
// src/types/utils.ts

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

/**
 * Non-nullable array items
 */
export type NonNullableItems<T extends unknown[]> = {
  [K in keyof T]: NonNullable<T[K]>;
};
```

---

## Type Guards

```typescript
// src/lib/type-guards.ts

import { Message, CardType, CardData } from '@/types/chat';
import { TaskStatus } from '@/types/task';

/**
 * Check if value is a valid TaskStatus
 */
export function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === 'string' &&
    ['pending', 'in-progress', 'completed', 'needs-review'].includes(value)
  );
}

/**
 * Check if value is a valid CardType
 */
export function isCardType(value: unknown): value is CardType {
  return (
    typeof value === 'string' &&
    ['task-card', 'task-list', 'client-card', 'review-card', 'confirmation'].includes(value)
  );
}

/**
 * Check if message has card data
 */
export function hasCardData(message: Message): message is Message & { cardData: CardData } {
  return message.cardType !== undefined && message.cardData !== undefined;
}

/**
 * Check if message is an error
 */
export function isErrorMessage(message: Message): boolean {
  return message.isError === true && message.error !== undefined;
}

/**
 * Check if message is still streaming
 */
export function isStreamingMessage(message: Message): boolean {
  return message.isStreaming === true;
}
```

---

## Index Barrel Export

```typescript
// src/types/index.ts

// Task types
export type {
  Task,
  TaskSummary,
  TaskStatus,
  TaskFilters,
  TaskUpdate,
  AIActionType,
} from './task';

export { VALID_TRANSITIONS, isValidTransition } from './task';

// Client types
export type {
  Client,
  ClientWithTasks,
  ClientSummary,
  ClientFilters,
  RiskProfile,
} from './client';

// Chat types
export type {
  Message,
  MessageRole,
  MessageError,
  CardType,
  CardData,
  ContentSegment,
  ParsedContent,
  TaskListCardData,
  TaskCardData,
  ClientCardData,
  ReviewCardData,
  ConfirmationCardData,
} from './chat';

// Intent types
export type {
  UserIntent,
  ExtractedEntities,
  IntentClassification,
  ConversationContext,
  PromptConfig,
} from './intent';

// State types
export type {
  ChatState,
  ChatContext,
  SessionMeta,
  UndoableAction,
  ChatAction,
} from './state';

export { createInitialState } from './state';

// API types
export type {
  ChatRequest,
  CardAction,
  StreamEvent,
  ErrorPayload,
  APIError,
  ErrorCode,
} from './api';

export { ERROR_CODES } from './api';
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-architect | Initial data models document |
