# Chat Interactive System - Complete Implementation Plan

> **Scope Confirmation**: These changes are **primarily focused on the chat/messaging system**. The existing pages (Clients, Opportunities, Tasks, Workflows, Automations, Integrations) remain unchanged. We are enhancing the chat to act as a universal command interface that can interact with the same mock data those pages use.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Codebase Analysis](#current-codebase-analysis)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Phases](#implementation-phases)
5. [Tool Definitions](#tool-definitions)
6. [UI Blocks Specification](#ui-blocks-specification)
7. [File Structure](#file-structure)
8. [Testing Checklist](#testing-checklist)

---

## Executive Summary

### Goal
Transform Ciri's chat into a **universal command interface** where financial advisors can:
- Create, read, update, and delete all entities from chat
- See results as interactive UI blocks (tables, cards, charts, timelines)
- Manage conversation sessions with history
- Have safety patterns for destructive actions

### Key Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tool System | Custom prompt-based | Model-agnostic, not tied to Gemini |
| Scope | Full implementation in phases | All 41 tools, 13 UI blocks |
| Chat Sidebar | Yes, localStorage | Session management with pinning |
| Streaming | Yes, with indicators | Better UX, "thinking..." status |

### What Changes
- **Chat API** (`src/app/api/chat/route.ts`) - Major rewrite for streaming + tool execution
- **Chat Components** (`src/components/chat/*`) - New blocks, sidebar, streaming support
- **Types** (`src/types/*`) - New type definitions for tools, blocks, sessions
- **AI Logic** (`src/lib/ai/*`) - Intent router, tool executor, response builder
- **Mock Data** (`src/lib/mock-data/index.ts`) - Add missing CRUD functions

### What Stays the Same
- All existing pages (Clients, Opportunities, Tasks, etc.)
- Existing UI components in those pages
- Mock data structure
- Authentication flow (mock)
- Settings page

---

## Current Codebase Analysis

### Chat Implementation (Explored)

#### API Endpoint: `src/app/api/chat/route.ts`
- **AI Model**: Google Gemini (gemini-2.5-flash) via Vercel AI SDK
- **Response Type**: Non-streaming JSON
- **Request Schema**:
  ```typescript
  {
    message: string;
    context?: {
      focusedTaskId?: string;
      focusedClientId?: string;
      lastIntent?: string;
    }
  }
  ```
- **Response Schema**:
  ```typescript
  {
    content: string;      // Text with embedded card markers
    cards: Card[];        // Explicit cards array
    context: ChatContext; // Updated context for next request
    tasksUpdated: boolean;
  }
  ```

#### Intent System: `src/lib/ai/parse-intent.ts`
- **Current Intents** (8 total, regex-based):
  1. `show_todays_tasks` - "What do I have today?"
  2. `show_task_status` - "What's the status on client A?"
  3. `show_pending_reviews` - "What needs my approval?"
  4. `approve_task` - "Approve that"
  5. `reject_task` - "Don't send that"
  6. `show_client_info` - "Tell me about John Smith"
  7. `complete_task` - "Mark as done"
  8. `general_question` - Fallback

- **Limitations**:
  - Regex patterns cannot scale to 40+ intents
  - No create/update/delete capabilities
  - No disambiguation for ambiguous queries
  - No confirmation for destructive actions

#### Card Embedding: `src/lib/ai/parse-content.ts`
- **Format**: `<<<CARD:card-type:{"json":"data"}>>>`
- **Parser**: Handles arbitrary JSON depth, escaped quotes
- **Extraction**: Returns array of `{ type, data }` objects

#### Current Card Types: `src/types/chat.ts`
```typescript
type CardType = 'task-list' | 'task' | 'client' | 'review' | 'confirmation';

// Card data interfaces:
- TaskListCardData: { title, tasks[], showActions? }
- TaskCardData: { task, showActions? }
- ClientCardData: { client, recentTasks? }
- ReviewCardData: { task, title, message }
- ConfirmationCardData: { type, message, undoable?, undoAction? }
```

#### Chat Context: `src/context/chat-context.tsx`
- **State Management**: useReducer pattern
- **State Shape**:
  ```typescript
  {
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
  ```
- **Actions**: ADD_MESSAGE, UPDATE_TASK, SET_CONTEXT, RESET_CHAT
- **Handlers**: sendMessage, handleApproveTask, handleRejectTask, handleCompleteTask

#### Chat Components: `src/components/chat/`
| Component | Purpose |
|-----------|---------|
| `chat-container.tsx` | Main wrapper with message count |
| `message-list.tsx` | Scrollable messages, auto-scroll |
| `message-item.tsx` | Individual message with card parsing |
| `chat-input.tsx` | Textarea with voice input, char limit |
| `typing-indicator.tsx` | Animated dots during loading |
| `welcome-message.tsx` | Initial screen with suggestions |
| `card-renderer.tsx` | Routes card types to components |

#### Card Components: `src/components/cards/`
| Component | Features |
|-----------|----------|
| `task-card.tsx` | Status, priority, AI completion badge, Mark Complete |
| `task-list-card.tsx` | Multiple tasks, Approve/Reject for reviews |
| `client-card.tsx` | Avatar, portfolio, contact info, tags |
| `review-card.tsx` | AI-completed action, expandable, Approve/Reject |
| `confirmation-card.tsx` | Success/error/info with optional Undo |

---

### Mock Data Layer (Explored)

#### Data Location: `src/lib/mock-data/`
| File | Entity | Records |
|------|--------|---------|
| `clients.ts` | Client profiles | 10 clients |
| `tasks.ts` | Tasks with labels | ~15 tasks |
| `opportunities.ts` | Detected opportunities | ~8 opportunities |
| `workflows.ts` | Multi-step workflows | ~5 workflows |
| `automations.ts` | Automation suggestions | ~10 items |
| `integrations.ts` | Connected providers | 8 integrations |
| `timeline.ts` | Activity events | ~30 events |
| `artifacts.ts` | Documents | ~20 artifacts |
| `assets.ts` | Financial assets | ~25 assets |
| `index.ts` | Central CRUD hub | 50+ functions |

#### Existing CRUD Functions (in `index.ts`)

**Clients:**
- `getClients(filters?)` - List with filters
- `getClientById(id)` - Single client
- `getClientByName(name)` - Search by name
- `searchClients(filters)` - Full search
- `getClientWithDetails(id)` - With relationships, timeline, assets
- **Missing**: `createClient`, `updateClient`, `deleteClient`

**Tasks:**
- `getTasks(filters?)` - List with filters
- `getTaskById(id)` - Single task
- `updateTask(id, updates)` - Update fields
- `getTasksByStatus(status)` - Filter by status
- `addCommentToTask(id, text, author)` - Add comment
- **Missing**: `createTask`, `deleteTask`

**Opportunities:**
- `getOpportunities(filters?)` - List with filters
- `getOpportunityById(id)` - Single opportunity
- `updateOpportunity(id, updates)` - Update fields
- `snoozeOpportunity(id, options)` - Snooze
- `dismissOpportunity(id, reason)` - Dismiss
- `markOpportunityActioned(id)` - Mark actioned
- **Missing**: `createOpportunity`, `deleteOpportunity`

**Workflows:**
- `getWorkflows(status?)` - List by status
- `getWorkflowById(id)` - Single workflow
- `getWorkflowProgress(id)` - Progress calculation
- **Missing**: `startWorkflow`, `pauseWorkflow`, `completeStep`

**Automations:**
- `getAutomationSuggestions(status?)` - List suggestions
- `getActiveAutomations(filters?)` - List active
- `approveAutomationSuggestion(id)` - Approve
- `pauseAutomation(id)` - Pause
- `resumeAutomation(id)` - Resume
- Already complete

**Integrations:**
- `getIntegrations(filters?)` - List
- `connectIntegration(provider)` - Connect new
- `disconnectIntegration(id)` - Disconnect
- `triggerSync(id)` - Manual sync
- Already complete

#### Entity Types (from `src/types/`)

**Client** (`src/types/client.ts`):
```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  portfolioValue: number;
  accountType: string;
  birthDate?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  notes?: string;
  nextMeeting?: string;
  lastContact?: string;
  tags: string[];
  createdAt: string;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  status: 'active' | 'inactive' | 'prospect';
}
```

**Task** (`src/types/task.ts`):
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  dueDate?: string;
  clientId?: string;
  clientName?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  labels: Label[];
  comments: Comment[];
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  aiCompleted?: boolean;
  aiActionType?: 'email_draft' | 'portfolio_review' | 'meeting_notes' | 'report' | 'reminder' | 'analysis';
  aiCompletionData?: {
    completedAt: string;
    summary: string;
    details: string;
    confidence: number;
  };
}
```

**Opportunity** (`src/types/opportunity.ts`):
```typescript
interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  type: 'contract' | 'milestone' | 'market';
  title: string;
  description: string;
  whyNow: string;
  impactScore: number;
  impactLevel: 'high' | 'medium' | 'low';
  estimatedValue: number;
  readiness: 'ready' | 'needs_prep' | 'blocked';
  sourceType: string;
  status: 'new' | 'viewed' | 'snoozed' | 'dismissed' | 'actioned';
  surfacedAt: string;
  expiresAt?: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

### UI Components Available (Explored)

#### Shadcn UI Components (`src/components/ui/`)
All standard components available: Button, Card, Badge, Avatar, Input, Textarea, Table, Dialog, Sheet, Tabs, Select, Checkbox, Progress, etc.

#### Existing Page Components (can adapt for chat blocks)

**Tables:**
- `ClientTable` - Sortable client list with avatar, portfolio, risk
- `AssetTable` - Client assets display

**Charts:**
- `SimpleBarChart` - CSS-based horizontal bars
- `SimpleLineChart` - SVG line chart with area fill

**Cards:**
- `OpportunityCard` - Impact score, expiry, actions
- `IntegrationCard` - Status, sync info, actions
- `ActiveAutomationCard` - Status, run count, pause/resume
- `SuggestionCard` - Automation suggestions

**Timeline:**
- `ActivityTimeline` - Chronological events with icons

**Workflow:**
- `WorkflowProgress` - Step visualization

---

## Architecture Overview

### Flow Diagram
```
User Message
    │
    ▼
┌─────────────────────────────────────┐
│  Streaming Response Starts          │
│  → Show "Thinking..." indicator     │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Intent Router                       │
│  → Classify intent via LLM prompt   │
│  → Extract parameters               │
│  → Detect ambiguity                 │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Execution Plan                      │
│  {                                  │
│    intent: 'read',                  │
│    entity: 'client',                │
│    tool: 'list_clients',            │
│    arguments: { limit: 10 },        │
│    renderAs: 'client-table',        │
│    requiresConfirmation: false      │
│  }                                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Tool Executor                       │
│  → Validate arguments               │
│  → Call mock-data function          │
│  → Record for undo (if mutation)    │
│  → Return structured result         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Response Builder                    │
│  → Generate conversational text     │
│  → Create UI blocks                 │
│  → Include undo action if available │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Stream to Client                    │
│  → Text streams incrementally       │
│  → Blocks render after completion   │
└─────────────────────────────────────┘
```

### Streaming Protocol
```typescript
type StreamChunk =
  | { type: 'thinking'; status: string }      // "Searching clients..."
  | { type: 'text'; content: string }         // Incremental text
  | { type: 'blocks'; blocks: Block[] }       // UI blocks
  | { type: 'context'; context: ChatContext } // Updated context
  | { type: 'done' }                          // Stream complete
  | { type: 'error'; message: string }        // Error occurred
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Foundation)

#### 1.1 Type Definitions

**New File: `src/types/tools.ts`**
```typescript
export type ToolCategory =
  | 'read' | 'create' | 'update' | 'delete'
  | 'report' | 'export' | 'workflow' | 'integration';

export type EntityType =
  | 'client' | 'task' | 'opportunity'
  | 'workflow' | 'automation' | 'integration';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  description: string;
  required: boolean;
  enumValues?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  entityType?: EntityType;
  parameters: ToolParameter[];
  requiresConfirmation: boolean;
  renderAs: BlockType;
  examples: string[];
}
```

**New File: `src/types/execution-plan.ts`**
```typescript
export type IntentCategory =
  | 'read' | 'search' | 'create' | 'update' | 'delete'
  | 'summarize' | 'report' | 'export'
  | 'workflow' | 'automation' | 'integration'
  | 'help' | 'general';

export interface ExecutionPlan {
  intent: IntentCategory;
  entity?: EntityType;
  tool: string;
  arguments: Record<string, unknown>;
  renderAs: BlockType;
  requiresConfirmation: boolean;
  confidence: number;
  clarificationNeeded?: {
    field: string;
    reason: string;
    options?: string[];
  };
  multiMatch?: {
    entityType: EntityType;
    matches: Array<{ id: string; displayName: string; summary: string }>;
  };
}
```

**New File: `src/types/chat-blocks.ts`**
```typescript
export type BlockType =
  // Existing (5)
  | 'task-list' | 'task' | 'client' | 'review' | 'confirmation'
  // Tables/Lists (3)
  | 'client-table' | 'opportunity-list' | 'automation-list'
  // Detail Cards (3)
  | 'client-profile' | 'opportunity-detail' | 'workflow-status'
  // Interactive (4)
  | 'timeline' | 'chart' | 'confirm-action' | 'select-entity'
  // Export (1)
  | 'export-download';

// ... block data interfaces for each type
```

**New File: `src/types/chat-session.ts`**
```typescript
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  entityContext?: {
    focusedClientId?: string;
    focusedTaskId?: string;
    focusedOpportunityId?: string;
  };
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}
```

#### 1.2 Tool Registry

**New File: `src/lib/ai/tool-registry.ts`**

Define all 41 tools (see [Tool Definitions](#tool-definitions) section).

#### 1.3 Intent Router

**New File: `src/lib/ai/intent-router.ts`**

Model-agnostic intent classification:
- Build prompt with tool definitions
- Send to LLM (Gemini or any other)
- Parse structured JSON response
- Handle ambiguity detection

#### 1.4 Tool Executor

**New File: `src/lib/ai/tool-executor.ts`**

- Map tool names to handler functions
- Validate arguments against schemas
- Call appropriate mock-data functions
- Record operations for undo
- Return structured results

#### 1.5 Response Builder

**New File: `src/lib/ai/response-builder-v2.ts`**

- Generate conversational text from results
- Create appropriate UI blocks
- Attach undo actions when applicable

#### 1.6 Streaming API

**Modify: `src/app/api/chat/route.ts`**

Convert to streaming endpoint with ReadableStream.

---

### Phase 2: Mock Data Layer Enhancement

#### 2.1 Add Missing CRUD Functions

**Modify: `src/lib/mock-data/index.ts`**

```typescript
// CLIENT CRUD
export function createClient(data: Omit<Client, 'id' | 'createdAt'>): Client
export function updateClient(id: string, updates: Partial<Client>): Client | null
export function archiveClient(id: string): boolean
export function restoreClient(id: string): boolean

// TASK CRUD
export function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task
export function deleteTask(id: string): boolean
export function restoreTask(id: string): boolean

// OPPORTUNITY CRUD
export function createOpportunity(data: Omit<Opportunity, 'id' | 'surfacedAt'>): Opportunity
export function archiveOpportunity(id: string, reason: string): boolean
export function restoreOpportunity(id: string): boolean

// WORKFLOW OPERATIONS
export function startWorkflow(type: WorkflowType, clientId: string): Workflow
export function pauseWorkflow(id: string): boolean
export function resumeWorkflow(id: string): boolean
export function completeWorkflowStep(workflowId: string, stepId: string): boolean
```

#### 2.2 Undo Support

**New File: `src/lib/chat/undo-manager.ts`**

```typescript
interface UndoEntry {
  id: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  previousState: unknown;
  timestamp: string;
}

export function recordOperation(entry): string
export function undoLast(): { success: boolean; restoredEntity?: unknown }
export function canUndo(): boolean
export function getUndoDescription(): string | null
```

---

### Phase 3: UI Blocks Implementation

#### 3.1 Block Renderer Extension

**Modify: `src/components/chat/card-renderer.tsx`**

Rename to `block-renderer.tsx`, extend switch statement for all 13 block types.

#### 3.2 New Block Components

**New Directory: `src/components/blocks/`**

| Component | Purpose |
|-----------|---------|
| `client-table-block.tsx` | Sortable client table |
| `opportunity-list-block.tsx` | Opportunity cards with actions |
| `automation-list-block.tsx` | Automation status cards |
| `client-profile-block.tsx` | Full client details |
| `opportunity-detail-block.tsx` | Full opportunity details |
| `workflow-status-block.tsx` | Workflow progress |
| `timeline-block.tsx` | Activity timeline |
| `chart-block.tsx` | Bar/line/donut charts |
| `confirm-action-block.tsx` | Confirmation for destructive actions |
| `select-entity-block.tsx` | Disambiguation picker |
| `export-download-block.tsx` | File download link |

#### 3.3 Streaming UI

**Modify: `src/components/chat/typing-indicator.tsx`**

```typescript
interface ThinkingIndicatorProps {
  status: 'thinking' | 'searching' | 'processing' | 'generating';
}
```

**Modify: `src/components/chat/message-item.tsx`**

Handle streaming text with cursor animation.

---

### Phase 4: Chat Session Management

#### 4.1 Session Storage

**New File: `src/lib/chat/session-manager.ts`**

localStorage-based session management:
- Create, update, delete sessions
- Pin/unpin sessions
- Search sessions
- Auto-generate titles

#### 4.2 Chat Sidebar

**New File: `src/components/chat/chat-sidebar.tsx`**

Features:
- New Chat button
- Search input
- Pinned sessions section
- Recent sessions list
- Context menu (Pin, Delete, Rename)

#### 4.3 Context Integration

**Modify: `src/context/chat-context.tsx`**

Add session and streaming state:
```typescript
interface ChatState {
  // Existing
  messages: Message[];
  isLoading: boolean;
  // New
  currentSessionId: string | null;
  sessions: ChatSessionSummary[];
  streamingStatus: 'idle' | 'thinking' | 'streaming' | 'done';
  streamingText: string;
}
```

---

### Phase 5: Safety Patterns

#### 5.1 Confirmation Flow

**New File: `src/lib/chat/confirmation-manager.ts`**

For destructive actions:
1. Return `confirm-action` block
2. User clicks Confirm/Cancel
3. Execute or abort

#### 5.2 Undo Pattern

After mutations:
1. Record previous state
2. Show Undo button in confirmation
3. Restore on click

---

### Phase 6: Export Functionality

#### 6.1 Export Generator

**New File: `src/lib/chat/export-generator.ts`**

```typescript
export function generateClientsCsv(clients: Client[]): string
export function generateOpportunitiesCsv(opportunities: Opportunity[]): string
export function generateTasksCsv(tasks: Task[]): string
export function createDownloadUrl(content: string, type: 'csv' | 'json'): string
```

---

### Phase 7: Intent Coverage

All user intents mapped to tools (see tables in [Tool Definitions](#tool-definitions)).

---

### Phase 8: Enhanced Prompts

**Modify: `src/lib/ai/prompts.ts`**

- System prompt with all capabilities
- Classification prompt template
- Response generation prompt

---

## Tool Definitions

### READ/SEARCH Tools (15)

| # | Tool | Description | Parameters | Renders |
|---|------|-------------|------------|---------|
| 1 | `list_clients` | List clients with filters | name?, riskProfile?, limit? | client-table |
| 2 | `get_client` | Get single client | id or name | client-profile |
| 3 | `search_clients` | Full-text search | query, filters? | client-table |
| 4 | `list_tasks` | List/filter tasks | status?, priority?, clientId? | task-list |
| 5 | `get_task` | Get single task | id or title | task |
| 6 | `search_tasks` | Full-text search | query, filters? | task-list |
| 7 | `list_opportunities` | List opportunities | status?, type?, clientId? | opportunity-list |
| 8 | `get_opportunity` | Get single opportunity | id | opportunity-detail |
| 9 | `list_workflows` | List workflows | status? | workflow-status |
| 10 | `get_workflow` | Get workflow | id | workflow-status |
| 11 | `list_automations` | List automations | status? | automation-list |
| 12 | `get_automation` | Get automation | id | automation-list |
| 13 | `list_integrations` | List integrations | status? | confirmation |
| 14 | `get_integration` | Get integration | id or provider | confirmation |
| 15 | `get_activity_feed` | Recent activity | limit?, entityType? | timeline |

### CREATE Tools (5)

| # | Tool | Description | Parameters | Confirms |
|---|------|-------------|------------|----------|
| 16 | `create_task` | Create task | title, clientId?, dueDate?, priority? | No |
| 17 | `create_opportunity` | Create opportunity | clientId, title, type, value? | No |
| 18 | `create_client` | Create client | name, email?, phone?, riskProfile? | No |
| 19 | `start_workflow` | Start workflow | type, clientId | No |
| 20 | `suggest_automation` | Create suggestion | description, category | No |

### UPDATE Tools (10)

| # | Tool | Description | Parameters | Confirms |
|---|------|-------------|------------|----------|
| 21 | `update_task` | Update task | id, fields... | No |
| 22 | `complete_task` | Mark complete | id | No |
| 23 | `approve_task` | Approve AI task | id | No |
| 24 | `reject_task` | Reject AI task | id | No |
| 25 | `update_opportunity` | Update opportunity | id, fields... | No |
| 26 | `snooze_opportunity` | Snooze | id, until, reason? | No |
| 27 | `dismiss_opportunity` | Dismiss | id, reason | No |
| 28 | `pause_automation` | Pause | id | No |
| 29 | `resume_automation` | Resume | id | No |
| 30 | `update_client` | Update client | id, fields... | No |

### DELETE Tools (3)

| # | Tool | Description | Parameters | Confirms |
|---|------|-------------|------------|----------|
| 31 | `delete_task` | Delete task | id | **Yes** |
| 32 | `archive_client` | Archive client | id | **Yes** |
| 33 | `archive_opportunity` | Archive opportunity | id | **Yes** |

### REPORT Tools (5)

| # | Tool | Description | Renders |
|---|------|-------------|---------|
| 34 | `get_pipeline_summary` | Pipeline overview | chart + opportunity-list |
| 35 | `get_workload_summary` | Workload by week | chart |
| 36 | `get_client_stats` | Client statistics | chart + confirmation |
| 37 | `get_opportunity_stats` | Opportunity metrics | chart + confirmation |
| 38 | `get_task_stats` | Task metrics | chart + confirmation |

### EXPORT Tools (3)

| # | Tool | Description | Renders |
|---|------|-------------|---------|
| 39 | `export_clients` | Export to CSV | export-download |
| 40 | `export_opportunities` | Export to CSV | export-download |
| 41 | `export_tasks` | Export to CSV | export-download |

---

## UI Blocks Specification

### Block Types (13 Total)

| Block | Purpose | Interactive |
|-------|---------|-------------|
| `task-list` | Multiple tasks | Complete, Approve |
| `task` | Single task detail | Complete |
| `client` | Client summary | View profile |
| `review` | AI completion review | Approve, Reject |
| `confirmation` | Success/error feedback | Undo |
| `client-table` | Sortable client list | Sort, click row |
| `opportunity-list` | Opportunity cards | Snooze, Dismiss |
| `automation-list` | Automation cards | Pause, Resume |
| `client-profile` | Full client details | Edit, Create Task |
| `opportunity-detail` | Full opportunity | Action |
| `workflow-status` | Workflow progress | Complete step |
| `timeline` | Activity history | Expand item |
| `chart` | Bar/line/donut | Period select |
| `confirm-action` | Destructive confirm | Confirm, Cancel |
| `select-entity` | Disambiguation | Select option |
| `export-download` | File download | Download |

---

## File Structure

### New Files (18 total)

```
src/
├── types/
│   ├── tools.ts                    # Tool definitions
│   ├── execution-plan.ts           # Execution plan types
│   ├── chat-blocks.ts              # Block type definitions
│   └── chat-session.ts             # Session types
├── lib/
│   ├── ai/
│   │   ├── tool-registry.ts        # 41 tool definitions
│   │   ├── intent-router.ts        # Intent classification
│   │   ├── tool-executor.ts        # Tool execution
│   │   └── response-builder-v2.ts  # Response generation
│   └── chat/
│       ├── session-manager.ts      # Session storage
│       ├── undo-manager.ts         # Undo stack
│       ├── confirmation-manager.ts # Pending confirmations
│       └── export-generator.ts     # CSV generation
├── hooks/
│   └── use-chat-sessions.ts        # Session hook
└── components/
    ├── chat/
    │   └── chat-sidebar.tsx        # Session sidebar
    └── blocks/
        ├── client-table-block.tsx
        ├── opportunity-list-block.tsx
        ├── automation-list-block.tsx
        ├── client-profile-block.tsx
        ├── opportunity-detail-block.tsx
        ├── workflow-status-block.tsx
        ├── timeline-block.tsx
        ├── chart-block.tsx
        ├── confirm-action-block.tsx
        ├── select-entity-block.tsx
        └── export-download-block.tsx
```

### Modified Files (10 total)

| File | Changes |
|------|---------|
| `src/app/api/chat/route.ts` | Streaming + tool execution |
| `src/types/chat.ts` | Extended block types |
| `src/types/index.ts` | New exports |
| `src/lib/mock-data/index.ts` | CRUD additions |
| `src/lib/ai/prompts.ts` | New prompt templates |
| `src/context/chat-context.tsx` | Session + streaming state |
| `src/components/chat/card-renderer.tsx` | Rename + extend |
| `src/components/chat/chat-container.tsx` | Sidebar integration |
| `src/components/chat/typing-indicator.tsx` | Status display |
| `src/components/chat/message-item.tsx` | Streaming support |

---

## Testing Checklist

### Functional Tests
- [ ] All 41 tools execute correctly
- [ ] All 13 block types render properly
- [ ] Streaming works end-to-end
- [ ] "Thinking..." indicator shows during processing
- [ ] Session persistence works (localStorage)
- [ ] Undo restores state correctly
- [ ] Confirmations block destructive actions
- [ ] Export generates valid CSV
- [ ] Disambiguation shows selection UI
- [ ] Chat sidebar navigation works

### User Flow Tests

| Flow | Expected |
|------|----------|
| "Show me my clients" | client-table block |
| "Tell me about John Smith" | client-profile block |
| "Create a task for follow up" | task created + confirmation |
| "Delete this task" | confirm-action → confirmation |
| "Undo" | Task restored |
| "Pipeline summary" | chart + opportunity-list |
| "Export clients to CSV" | export-download block |
| Switch session | Messages preserved |
| Pin session | Appears in pinned section |
| Search sessions | Filters by query |

---

## Notes

- All data operations use mock layer (no real API calls)
- Sessions stored in localStorage (future: Supabase)
- Export files are blob URLs (expire on page refresh)
- Undo limited to last 10 operations
- Confirmation timeouts after 5 minutes
- Streaming uses Server-Sent Events pattern
- Model-agnostic design allows swapping Gemini for other LLMs
