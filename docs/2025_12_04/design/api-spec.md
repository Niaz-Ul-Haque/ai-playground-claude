# Ciri - API Specification

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

Ciri exposes a single API endpoint for chat interactions. The API uses HTTP POST with streaming responses to deliver AI-generated content with embedded card data.

### Base URL

```
Development: http://localhost:3000/api
Production:  https://advisor-ai.vercel.app/api
```

---

## API Endpoints

### POST /api/chat

Primary endpoint for chat interactions. Handles message submission, intent classification, data retrieval, and streaming AI responses.

#### Request

**Headers**

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

**Body Schema**

```typescript
interface ChatRequest {
  /** Array of conversation messages */
  messages: Message[];

  /** Optional context for resolving references */
  context?: ChatContext;

  /** Optional action data for card interactions */
  action?: CardAction;
}

interface Message {
  /** Message identifier */
  id: string;

  /** Role: 'user' or 'assistant' */
  role: 'user' | 'assistant';

  /** Message text content */
  content: string;

  /** Timestamp in ISO 8601 format */
  timestamp: string;

  /** Card type if message contains a card */
  cardType?: CardType;

  /** Card data if message contains a card */
  cardData?: Record<string, unknown>;
}

interface ChatContext {
  /** Currently focused task ID */
  focusedTaskId?: string;

  /** Currently focused client ID */
  focusedClientId?: string;

  /** Last card type displayed */
  lastCardType?: CardType;
}

interface CardAction {
  /** Action type */
  type: 'approve' | 'reject' | 'complete' | 'view_tasks';

  /** Target task ID */
  taskId?: string;

  /** Target client ID */
  clientId?: string;
}

type CardType =
  | 'task-card'
  | 'task-list'
  | 'client-card'
  | 'review-card'
  | 'confirmation';
```

**Example Request**

```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "What do I have today?",
      "timestamp": "2025-12-04T09:30:00Z"
    }
  ],
  "context": {
    "focusedTaskId": null,
    "focusedClientId": null,
    "lastCardType": null
  }
}
```

#### Response

**Headers**

| Header | Value |
|--------|-------|
| `Content-Type` | `text/event-stream; charset=utf-8` |
| `Cache-Control` | `no-cache` |
| `Connection` | `keep-alive` |

**Streaming Format**

The response uses Server-Sent Events (SSE) format:

```
data: {"type":"text","content":"Good morning! "}

data: {"type":"text","content":"You have "}

data: {"type":"text","content":"3 tasks scheduled for today:\n\n"}

data: {"type":"card","cardType":"task-list","data":{"tasks":[...]}}

data: {"type":"text","content":"\n\nWould you like more details on any task?"}

data: {"type":"done"}
```

**Stream Event Types**

```typescript
type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'card'; cardType: CardType; data: CardData }
  | { type: 'done' }
  | { type: 'error'; error: ErrorPayload };

interface ErrorPayload {
  code: string;
  message: string;
  retryable: boolean;
}
```

#### Error Responses

| Status | Code | Description | Retryable |
|--------|------|-------------|-----------|
| 400 | `INVALID_REQUEST` | Malformed request body | No |
| 400 | `EMPTY_MESSAGE` | Message content is empty | No |
| 400 | `MESSAGE_TOO_LONG` | Message exceeds 1000 characters | No |
| 429 | `RATE_LIMITED` | Too many requests | Yes (after delay) |
| 500 | `AI_ERROR` | Gemini API error | Yes |
| 504 | `TIMEOUT` | Request timed out | Yes |

**Error Response Format**

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Please wait before sending more messages",
    "retryable": true,
    "retryAfter": 60
  }
}
```

---

## Intent Classification System

### Supported Intents

| Intent | Trigger Phrases | Response Type |
|--------|-----------------|---------------|
| `show_todays_tasks` | "What do I have today?", "My tasks", "Today's schedule" | TaskListCard |
| `show_pending_reviews` | "What needs approval?", "Pending reviews", "What did you complete?" | TaskListCard (filtered) |
| `show_task_status` | "What's the status on [task]?", "Update on [client]" | TaskCard |
| `show_client_info` | "Tell me about [name]", "Client info for [name]" | ClientCard |
| `approve_task` | "Approve", "Looks good", "Yes, send it" | ConfirmationCard |
| `reject_task` | "Reject", "Cancel", "No, don't send" | ConfirmationCard |
| `complete_task` | "Mark as done", "Complete the [task]" | ConfirmationCard |
| `general_question` | (fallback for unrecognized) | TextMessage |

### Intent Classification Request (Internal)

```typescript
interface IntentClassification {
  /** Identified intent */
  intent: UserIntent;

  /** Confidence score (0-1) */
  confidence: number;

  /** Extracted entities */
  entities: {
    taskName?: string;
    clientName?: string;
    date?: string;
    taskId?: string;
  };

  /** Whether context resolution is needed */
  requiresContext: boolean;
}
```

### Intent Resolution Flow

```
User Message
    |
    v
+-------------------+
| Pattern Matching  |  <-- Quick check for common phrases
+-------------------+
    |
    | (no match)
    v
+-------------------+
| AI Classification |  <-- Claude classifies intent
+-------------------+
    |
    v
+-------------------+
| Entity Extraction |  <-- Extract names, dates, references
+-------------------+
    |
    v
+-------------------+
| Context Resolution|  <-- Resolve "it", "that", etc.
+-------------------+
    |
    v
Intent + Entities
```

---

## AI Response Schema

### Response Structure

AI responses contain plain text with embedded card markers. The client parses these markers and renders appropriate components.

**Card Marker Format**

```
<<<CARD:card-type:{"json":"data"}>>>
```

**Parser Regex**

```javascript
const CARD_PATTERN = /<<<CARD:(\w+[-\w]*):(\{.*?\})>>>/gs;
```

### Card Data Schemas

#### TaskListCard Data

```typescript
interface TaskListCardData {
  /** Title for the list */
  title?: string;

  /** Array of tasks to display */
  tasks: TaskSummary[];

  /** Filter applied */
  filter?: 'today' | 'pending-review' | 'all' | 'client';

  /** Client ID if filtered by client */
  clientId?: string;

  /** Whether to show "load more" option */
  hasMore?: boolean;
}

interface TaskSummary {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  dueDate: string; // ISO 8601
  status: TaskStatus;
  aiCompleted: boolean;
}

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'needs-review';
```

**Example**

```
<<<CARD:task-list:{"title":"Today's Tasks","tasks":[{"id":"task-1","title":"Call Robert Johnson about retirement plan","clientName":"Robert Johnson","clientId":"client-1","dueDate":"2025-12-04T14:00:00Z","status":"pending","aiCompleted":false},{"id":"task-2","title":"Review Chen portfolio rebalancing","clientName":"Sarah Chen","clientId":"client-2","dueDate":"2025-12-04T15:30:00Z","status":"needs-review","aiCompleted":true}],"filter":"today"}>>>
```

#### TaskCard Data

```typescript
interface TaskCardData {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  status: TaskStatus;
  aiCompleted: boolean;
  aiCompletedAt?: string;
  aiCompletedSummary?: string;
  lastUpdated: string;
}
```

**Example**

```
<<<CARD:task-card:{"id":"task-2","title":"Review Chen portfolio rebalancing","description":"Review and approve the Q4 portfolio rebalancing recommendations generated by the system.","clientId":"client-2","clientName":"Sarah Chen","dueDate":"2025-12-04T15:30:00Z","status":"needs-review","aiCompleted":true,"aiCompletedAt":"2025-12-04T08:00:00Z","aiCompletedSummary":"Rebalanced portfolio to maintain 60/40 allocation. Recommended selling AAPL and buying VTI.","lastUpdated":"2025-12-04T08:00:00Z"}>>>
```

#### ClientCard Data

```typescript
interface ClientCardData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  portfolioValue: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  lastContact: string;
  taskCount: number;
}
```

**Example**

```
<<<CARD:client-card:{"id":"client-2","name":"Sarah Chen","email":"sarah.chen@email.com","phone":"(416) 555-2345","portfolioValue":1250000,"riskProfile":"moderate","lastContact":"2025-12-02T10:00:00Z","taskCount":3}>>>
```

#### ReviewCard Data

```typescript
interface ReviewCardData {
  taskId: string;
  taskTitle: string;
  clientId: string;
  clientName: string;
  completedAt: string;
  actionType: 'email_draft' | 'portfolio_review' | 'meeting_notes' | 'report';
  summary: string;
  details: string;
  previewContent?: string;
}
```

**Example**

```
<<<CARD:review-card:{"taskId":"task-2","taskTitle":"Review Chen portfolio rebalancing","clientId":"client-2","clientName":"Sarah Chen","completedAt":"2025-12-04T08:00:00Z","actionType":"portfolio_review","summary":"Generated Q4 portfolio rebalancing recommendations","details":"Analyzed current portfolio allocation and market conditions. Recommended adjustments to maintain target 60/40 stock/bond allocation while minimizing tax implications.","previewContent":"Recommended Trades:\n- Sell 50 shares AAPL at $190\n- Buy 100 shares VTI at $245\n\nExpected outcome: +2.3% alignment with target allocation"}>>>
```

#### ConfirmationCard Data

```typescript
interface ConfirmationCardData {
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

**Example**

```
<<<CARD:confirmation:{"success":true,"action":"approved","taskId":"task-2","taskTitle":"Review Chen portfolio rebalancing","clientName":"Sarah Chen","message":"The portfolio rebalancing has been approved. Sarah Chen will be notified.","undoable":true,"previousState":"needs-review"}>>>
```

---

## Action Handling

### Card Action Requests

When a user interacts with a card button (Approve, Reject, etc.), the client sends an action request:

```typescript
// Approve button clicked on ReviewCard
{
  "messages": [
    // ... previous messages ...
    {
      "id": "msg-action-001",
      "role": "user",
      "content": "[ACTION:approve:task-2]",
      "timestamp": "2025-12-04T10:15:00Z"
    }
  ],
  "action": {
    "type": "approve",
    "taskId": "task-2"
  },
  "context": {
    "focusedTaskId": "task-2",
    "lastCardType": "review-card"
  }
}
```

### Action Processing Flow

```
Action Request
    |
    v
+-------------------+
| Validate Action   |
| - Task exists     |
| - Valid transition|
+-------------------+
    |
    v
+-------------------+
| Update Mock Data  |
| - Change status   |
| - Update timestamp|
+-------------------+
    |
    v
+-------------------+
| Generate Response |
| - Confirmation    |
| - Natural text    |
+-------------------+
    |
    v
Stream Response
```

### Status Transitions

```
Valid Transitions:
  pending      -> in-progress
  pending      -> completed
  in-progress  -> completed
  needs-review -> completed  (approved)
  needs-review -> pending    (rejected)

Invalid Transitions:
  completed    -> any        (cannot change completed tasks in MVP)
  any          -> needs-review (only AI can set this)
```

---

## Rate Limiting

### Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Requests per minute | 20 | 60 seconds |
| Tokens per minute | 10,000 | 60 seconds |
| Max message length | 1,000 chars | Per message |
| Max conversation length | 100 messages | Per session |

### Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait before sending more messages.",
    "retryable": true,
    "retryAfter": 60
  }
}
```

### Rate Limit Headers

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1701690000
Retry-After: 60
```

---

## Request/Response Examples

### Example 1: View Today's Tasks

**Request**

```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "What do I have today?",
      "timestamp": "2025-12-04T09:00:00Z"
    }
  ]
}
```

**Response Stream**

```
data: {"type":"text","content":"Good morning! You have 3 tasks scheduled for today:\n\n"}

data: {"type":"card","cardType":"task-list","data":{"title":"Today's Tasks","tasks":[{"id":"task-1","title":"Call Robert Johnson","clientName":"Robert Johnson","clientId":"client-1","dueDate":"2025-12-04T14:00:00Z","status":"pending","aiCompleted":false},{"id":"task-2","title":"Review Chen portfolio","clientName":"Sarah Chen","clientId":"client-2","dueDate":"2025-12-04T15:30:00Z","status":"needs-review","aiCompleted":true},{"id":"task-3","title":"Send Kim quarterly report","clientName":"Michael Kim","clientId":"client-3","dueDate":"2025-12-04T17:00:00Z","status":"pending","aiCompleted":false}],"filter":"today"}}

data: {"type":"text","content":"\n\nI noticed that the Chen portfolio review is ready for your approval. Would you like to review it?"}

data: {"type":"done"}
```

### Example 2: Approve Task

**Request**

```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "What needs approval?",
      "timestamp": "2025-12-04T09:00:00Z"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "You have 1 task awaiting your approval:\n\n<<<CARD:review-card:{...}>>>",
      "timestamp": "2025-12-04T09:00:05Z",
      "cardType": "review-card"
    },
    {
      "id": "msg-003",
      "role": "user",
      "content": "Approve it",
      "timestamp": "2025-12-04T09:01:00Z"
    }
  ],
  "context": {
    "focusedTaskId": "task-2",
    "lastCardType": "review-card"
  }
}
```

**Response Stream**

```
data: {"type":"text","content":"Done! I've approved the Chen portfolio rebalancing.\n\n"}

data: {"type":"card","cardType":"confirmation","data":{"success":true,"action":"approved","taskId":"task-2","taskTitle":"Review Chen portfolio","clientName":"Sarah Chen","message":"The portfolio rebalancing has been approved. Sarah Chen will be notified.","undoable":true,"previousState":"needs-review"}}

data: {"type":"text","content":"\n\nIs there anything else you'd like me to help with?"}

data: {"type":"done"}
```

### Example 3: Client Lookup

**Request**

```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "Tell me about Sarah Chen",
      "timestamp": "2025-12-04T09:00:00Z"
    }
  ]
}
```

**Response Stream**

```
data: {"type":"text","content":"Here's Sarah Chen's profile:\n\n"}

data: {"type":"card","cardType":"client-card","data":{"id":"client-2","name":"Sarah Chen","email":"sarah.chen@email.com","phone":"(416) 555-2345","portfolioValue":1250000,"riskProfile":"moderate","lastContact":"2025-12-02T10:00:00Z","taskCount":3}}

data: {"type":"text","content":"\n\nSarah has 3 active tasks. Would you like to see them?"}

data: {"type":"done"}
```

### Example 4: Error Response

**Request**

```json
{
  "messages": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "",
      "timestamp": "2025-12-04T09:00:00Z"
    }
  ]
}
```

**Response**

```json
{
  "error": {
    "code": "EMPTY_MESSAGE",
    "message": "Please enter a message",
    "retryable": false
  }
}
```

---

## API Implementation Notes

### Route Handler Structure

```typescript
// src/app/api/chat/route.ts
import { gemini } from '@ai-sdk/gemini';
import { streamText } from 'ai';
import { z } from 'zod';
import { parseIntent } from '@/lib/ai/parse-intent';
import { buildPrompt } from '@/lib/ai/prompts';
import { getTasks, getClients } from '@/lib/mock-data';

export const runtime = 'edge'; // Use Edge Runtime for streaming

const RequestSchema = z.object({
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant']),
    content: z.string().max(1000),
    timestamp: z.string(),
    cardType: z.string().optional(),
    cardData: z.record(z.unknown()).optional(),
  })).max(100),
  context: z.object({
    focusedTaskId: z.string().nullable().optional(),
    focusedClientId: z.string().nullable().optional(),
    lastCardType: z.string().nullable().optional(),
  }).optional(),
  action: z.object({
    type: z.enum(['approve', 'reject', 'complete', 'view_tasks']),
    taskId: z.string().optional(),
    clientId: z.string().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context, action } = RequestSchema.parse(body);

    // Get latest user message
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'user') {
      throw new Error('Latest message must be from user');
    }

    // Handle action if present
    if (action) {
      return handleAction(action, context);
    }

    // Parse intent
    const intent = await parseIntent(latestMessage.content, context);

    // Get relevant data based on intent
    const data = await getDataForIntent(intent);

    // Build system prompt
    const systemPrompt = buildPrompt(intent, data, context);

    // Stream response
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: formatMessages(messages),
      maxTokens: 6000,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    return handleError(error);
  }
}
```

### Streaming Helper

```typescript
// Helper to format stream events
function createStreamEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Custom stream for card embedding
async function* streamWithCards(
  textStream: AsyncIterable<string>,
  cardData: CardData | null
) {
  let buffer = '';

  for await (const chunk of textStream) {
    buffer += chunk;

    // Check for card insertion point (e.g., newline after colon)
    if (cardData && buffer.includes(':\n\n') && !buffer.includes('<<<CARD')) {
      const insertPoint = buffer.indexOf(':\n\n') + 3;
      const before = buffer.slice(0, insertPoint);
      const after = buffer.slice(insertPoint);

      yield createStreamEvent({ type: 'text', content: before });
      yield createStreamEvent({
        type: 'card',
        cardType: cardData.type,
        data: cardData.data
      });

      buffer = after;
      cardData = null; // Only insert once
    }
  }

  // Yield remaining buffer
  if (buffer) {
    yield createStreamEvent({ type: 'text', content: buffer });
  }

  yield createStreamEvent({ type: 'done' });
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-architect | Initial API specification |
