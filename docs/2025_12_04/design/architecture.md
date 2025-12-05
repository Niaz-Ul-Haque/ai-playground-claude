# Ciri - System Architecture Design

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Ciri - Financial Advisor Assistant |
| **Version** | 1.0.0 (MVP) |
| **Date** | December 4, 2025 |
| **Author** | spec-architect |
| **Status** | Draft |

---

## Executive Summary

Ciri is a single-page chat application that enables financial advisors to interact with an AI assistant for task management, client information retrieval, and workflow automation. The architecture prioritizes real-time streaming responses, embedded interactive UI cards within messages, and a clean separation of concerns for future scalability.

### Key Architectural Decisions

1. **Next.js 15 App Router** - Server components for initial load, client components for interactivity
2. **Vercel AI SDK Streaming** - Token-by-token AI response delivery
3. **Structured AI Responses** - JSON-embedded card data within streaming text
4. **React Context + useReducer** - Centralized state management for chat and mock data
5. **Mock Data Layer** - Abstracted data access for easy database migration

---

## High-Level Architecture

```
+------------------------------------------------------------------+
|                         Browser (Client)                          |
+------------------------------------------------------------------+
|                                                                  |
|  +--------------------+    +-------------------------------+     |
|  |   ChatProvider     |    |      Components               |     |
|  |   (React Context)  |    |                               |     |
|  |                    |    |  +---------------------------+ |     |
|  |  - messages[]      |    |  |   ChatContainer           | |     |
|  |  - tasks[]         |    |  |   +-------------------+   | |     |
|  |  - clients[]       |    |  |   | MessageList       |   | |     |
|  |  - isLoading       |    |  |   | +---------------+ |   | |     |
|  |  - currentContext  |    |  |   | | MessageItem   | |   | |     |
|  |                    |    |  |   | | (text/cards)  | |   | |     |
|  +--------+-----------+    |  |   | +---------------+ |   | |     |
|           |                |  |   +-------------------+   | |     |
|           |                |  |   | ChatInput         |   | |     |
|           v                |  |   +-------------------+   | |     |
|  +--------------------+    |  +---------------------------+ |     |
|  |   useChat hook     |    |                               |     |
|  |   (Vercel AI SDK)  |    |  +---------------------------+ |     |
|  |                    |    |  |   Card Components         | |     |
|  |  - stream handling |    |  |   - TaskListCard          | |     |
|  |  - message append  |    |  |   - TaskCard              | |     |
|  |  - error handling  |    |  |   - ClientCard            | |     |
|  +--------+-----------+    |  |   - ReviewCard            | |     |
|           |                |  |   - ConfirmationCard      | |     |
|           |                |  +---------------------------+ |     |
+-----------+----------------+-------------------------------+-----+
            |
            | HTTPS (Streaming)
            v
+------------------------------------------------------------------+
|                     Next.js Server (Edge/Node)                    |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                    /api/chat/route.ts                       |  |
|  |                                                             |  |
|  |  1. Receive message + conversation history                  |  |
|  |  2. Parse intent from message                               |  |
|  |  3. Retrieve relevant data (tasks/clients)                  |  |
|  |  4. Build system prompt with context                        |  |
|  |  5. Stream response with embedded card data                 |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |                   AI Integration Layer                      |  |
|  |                                                             |  |
|  |  +------------------------+  +---------------------------+  |  |
|  |  | Intent Parser          |  | Response Builder          |  |  |
|  |  | - classify intent      |  | - format card JSON        |  |  |
|  |  | - extract entities     |  | - embed in response       |  |  |
|  |  +------------------------+  +---------------------------+  |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |                   Mock Data Layer                           |  |
|  |                                                             |  |
|  |  +------------------------+  +---------------------------+  |  |
|  |  | tasks.ts               |  | clients.ts                |  |  |
|  |  | - getTasks()           |  | - getClients()            |  |  |
|  |  | - getTaskById()        |  | - getClientById()         |  |  |
|  |  | - updateTaskStatus()   |  | - getClientByName()       |  |  |
|  |  +------------------------+  +---------------------------+  |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
            |
            | HTTPS (API)
            v
+------------------------------------------------------------------+
|                     Google Gemini API                             |
|                                                                  |
|  - Streaming responses                                           |
|  - Intent classification                                         |
|  - Natural language understanding                                |
|  - Context-aware conversations                                   |
+------------------------------------------------------------------+
```

---

## Component Hierarchy

```
app/
  layout.tsx                    # Root layout with providers
  page.tsx                      # Main chat page (Server Component shell)

components/
  chat/
    chat-container.tsx          # Main container, manages layout
      message-list.tsx          # Scrollable message area
        message-item.tsx        # Individual message (user or AI)
          [Card Components]     # Embedded cards based on type
      chat-input.tsx            # Input field + send button
      typing-indicator.tsx      # Loading state component

  cards/
    task-card.tsx              # Individual task with actions
    task-list-card.tsx         # List of tasks
    client-card.tsx            # Client profile display
    review-card.tsx            # AI-completed work review
    confirmation-card.tsx      # Success/error feedback

  ui/                          # Shadcn UI components
    button.tsx
    card.tsx
    badge.tsx
    input.tsx
    scroll-area.tsx
    avatar.tsx
    skeleton.tsx
    alert.tsx
    dialog.tsx
    dropdown-menu.tsx

context/
  chat-context.tsx             # Global state provider

hooks/
  use-chat.ts                  # Custom wrapper around Vercel AI SDK
  use-tasks.ts                 # Task data operations
  use-clients.ts               # Client data operations

lib/
  ai/
    parse-intent.ts            # Intent classification logic
    prompts.ts                 # System prompts and templates
    response-builder.ts        # Card data embedding
  mock-data/
    tasks.ts                   # Mock task data and operations
    clients.ts                 # Mock client data and operations
  utils.ts                     # Utility functions (cn, formatters)

types/
  index.ts                     # Barrel exports
  chat.ts                      # Chat/message types
  task.ts                      # Task types
  client.ts                    # Client types
```

---

## Data Flow Patterns

### Pattern 1: User Sends Message

```
User Input
    |
    v
ChatInput.handleSend()
    |
    v
useChat.sendMessage()           # From context
    |
    v
POST /api/chat
    |
    +-- Request Body:
    |   {
    |     messages: Message[],
    |     context: { currentTaskId?, currentClientId? }
    |   }
    |
    v
route.ts
    |
    +-- 1. Parse intent from latest message
    |   +-- Intent: show_todays_tasks
    |   +-- Entities: { date: 'today' }
    |
    +-- 2. Retrieve relevant data
    |   +-- tasks = getTasks({ dueDate: today })
    |
    +-- 3. Build AI prompt with data context
    |   +-- System: "You are Ciri..."
    |   +-- Context: "Today's tasks: [...]"
    |
    +-- 4. Stream response from Claude
    |
    v
Streaming Response
    |
    +-- Text tokens stream to client
    +-- Card data embedded as: <<<CARD:task-list:{...}>>>
    |
    v
Client parses stream
    |
    +-- Text displayed progressively
    +-- Card markers extracted and rendered
    |
    v
Message complete
    |
    v
State updated, UI reflects changes
```

### Pattern 2: Task Action (Approve/Reject)

```
User clicks "Approve" on ReviewCard
    |
    v
ReviewCard.handleApprove()
    |
    v
useTasks.updateTaskStatus(taskId, 'completed')
    |
    v
Local state updated optimistically
    |
    v
POST /api/chat (action message)
    |
    +-- Request Body:
    |   {
    |     messages: [..., { role: 'user', content: '[ACTION:approve:taskId]' }],
    |     action: { type: 'approve', taskId }
    |   }
    |
    v
route.ts
    |
    +-- 1. Parse action from message
    +-- 2. Execute action (update mock data)
    +-- 3. Generate confirmation response
    |
    v
AI Response with ConfirmationCard
    |
    v
Client renders success confirmation
```

### Pattern 3: Context Resolution

```
User says "Approve it"
    |
    v
POST /api/chat
    |
    v
route.ts
    |
    +-- 1. Parse intent: approve_task
    +-- 2. No explicit task reference
    +-- 3. Check context from recent messages
    |   +-- Last ReviewCard: taskId = "task-123"
    |
    +-- 4. Resolve: approve task-123
    |
    v
Continue with approval flow
```

---

## State Management Strategy

### Global State (React Context)

```typescript
interface ChatState {
  // Message History
  messages: Message[];

  // Data
  tasks: Task[];
  clients: Client[];

  // UI State
  isLoading: boolean;
  error: Error | null;

  // Context Tracking
  currentContext: {
    focusedTaskId: string | null;
    focusedClientId: string | null;
    lastCardType: CardType | null;
  };
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'SET_CONTEXT'; payload: Partial<ChatState['currentContext']> }
  | { type: 'CLEAR_CHAT' }
  | { type: 'HYDRATE_FROM_STORAGE'; payload: ChatState };
```

### State Persistence

```typescript
// Session Storage Hook
function useSessionStorage<T>(key: string, initialValue: T) {
  // Read from sessionStorage on mount
  // Write to sessionStorage on state change
  // Limit to 100 messages for performance
}

// Applied in ChatProvider
useEffect(() => {
  if (state.messages.length > 0) {
    sessionStorage.setItem('advisor-ai-chat', JSON.stringify({
      messages: state.messages.slice(-100),
      tasks: state.tasks,
      clients: state.clients,
    }));
  }
}, [state.messages, state.tasks, state.clients]);
```

---

## AI Response Format

### Streaming Response Structure

The AI response streams plain text with embedded card markers:

```
Good morning! You have 3 tasks scheduled for today:

<<<CARD:task-list:{"tasks":[{"id":"1","title":"Call Johnson","clientName":"Robert Johnson","dueDate":"2025-12-04T14:00:00","status":"pending"},{"id":"2","title":"Review Chen portfolio","clientName":"Sarah Chen","dueDate":"2025-12-04T15:30:00","status":"needs-review","aiCompleted":true}]}>>>

Would you like me to tell you more about any of these tasks?
```

### Card Marker Parsing

```typescript
const CARD_PATTERN = /<<<CARD:(\w+):({.*?})>>>/g;

function parseMessageContent(content: string): ParsedContent {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  content.replace(CARD_PATTERN, (match, cardType, cardData, offset) => {
    // Add text before card
    if (offset > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, offset)
      });
    }

    // Add card
    segments.push({
      type: 'card',
      cardType: cardType as CardType,
      data: JSON.parse(cardData)
    });

    lastIndex = offset + match.length;
    return match;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return { segments };
}
```

---

## Error Handling Approach

### Error Categories

| Category | HTTP Status | User Message | Recovery Action |
|----------|-------------|--------------|-----------------|
| Network Error | N/A | "Connection lost. Please check your internet." | Retry button |
| API Timeout | 504 | "The request timed out. Please try again." | Retry button |
| Rate Limited | 429 | "Please wait a moment before sending more messages." | Auto-retry after delay |
| AI Error | 500 | "Something went wrong. Please try again." | Retry button |
| Validation | 400 | "Your message couldn't be processed." | Edit and resend |

### Error Handling Flow

```typescript
// In useChat hook
async function sendMessage(content: string) {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    // Optimistically add user message
    const userMessage = createMessage('user', content);
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    // Stream AI response
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: state.messages }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      throw new ChatError(response.status, await response.text());
    }

    // Handle streaming...

  } catch (error) {
    if (error instanceof ChatError) {
      dispatch({ type: 'SET_ERROR', payload: error });

      // Preserve user message for retry
      dispatch({ type: 'ADD_MESSAGE', payload: createErrorMessage(error) });
    }
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}
```

### Retry Mechanism

```typescript
interface RetryableMessage {
  originalContent: string;
  attemptCount: number;
  lastError: ChatError;
}

function ErrorMessageCard({ message, onRetry }: Props) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        {message.error.userMessage}
        <Button onClick={() => onRetry(message.originalContent)}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

---

## Security Considerations

### API Key Protection

```typescript
// .env.local (never committed)
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

// Server-side only access
// src/app/api/chat/route.ts
import { google } from '@ai-sdk/google';

// Google provider automatically uses GOOGLE_GENERATIVE_AI_API_KEY
// environment variable when available
```

### Input Sanitization

```typescript
// Prevent XSS in displayed messages
function MessageContent({ content }: { content: string }) {
  // React automatically escapes strings
  // Additional sanitization for edge cases
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // Text only
    ALLOWED_ATTR: [],
  });

  return <span>{sanitized}</span>;
}

// Server-side validation
function validateMessage(content: string): boolean {
  if (content.length > 1000) return false;
  if (content.trim().length === 0) return false;
  // Additional validation rules
  return true;
}
```

### Request Validation

```typescript
// API route validation with Zod
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(1000),
  })).max(100),
  context: z.object({
    currentTaskId: z.string().optional(),
    currentClientId: z.string().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = ChatRequestSchema.parse(body);
  // Continue with validated data
}
```

### HTTPS and Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];
```

---

## Performance Considerations

### Streaming Optimization

```typescript
// Use Edge Runtime for faster streaming
export const runtime = 'edge';

// Stream response efficiently using Vercel AI SDK
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const stream = await streamText({
  model: google('gemini-2.5-flash'),
  maxTokens: 6000,
  messages: formattedMessages,
});

return stream.toTextStreamResponse();
```

### Component Optimization

```typescript
// Memoize expensive components
const MessageItem = React.memo(function MessageItem({ message }: Props) {
  const parsedContent = useMemo(
    () => parseMessageContent(message.content),
    [message.content]
  );

  return (
    <div className="...">
      {parsedContent.segments.map(renderSegment)}
    </div>
  );
});

// Virtual scrolling for long message lists
import { useVirtualizer } from '@tanstack/react-virtual';

function MessageList({ messages }: Props) {
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
  });

  // Render only visible messages
}
```

### Bundle Optimization

```typescript
// Dynamic imports for card components
const TaskListCard = dynamic(() => import('./cards/task-list-card'), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

// Code splitting by route (automatic with App Router)
// Lazy load heavy dependencies
```

---

## Testing Strategy

### Unit Testing

```typescript
// Component tests with React Testing Library
describe('TaskCard', () => {
  it('renders task details correctly', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.clientName)).toBeInTheDocument();
  });

  it('shows approve button for needs-review status', () => {
    render(<TaskCard task={{ ...mockTask, status: 'needs-review' }} />);
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
  });
});

// Intent parser tests
describe('parseIntent', () => {
  it('classifies show_todays_tasks correctly', () => {
    expect(parseIntent('What do I have today?')).toEqual({
      intent: 'show_todays_tasks',
      confidence: 0.95,
      entities: { date: 'today' }
    });
  });
});
```

### Integration Testing

```typescript
// API route tests
describe('/api/chat', () => {
  it('streams response for task query', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'My tasks' }],
      }),
    });

    expect(response.ok).toBe(true);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
  });
});
```

### E2E Testing

```typescript
// Playwright tests
test('complete task approval flow', async ({ page }) => {
  await page.goto('/');

  // Send message
  await page.fill('[data-testid="chat-input"]', 'What needs approval?');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await expect(page.locator('[data-testid="review-card"]')).toBeVisible();

  // Approve task
  await page.click('[data-testid="approve-button"]');

  // Verify confirmation
  await expect(page.locator('[data-testid="confirmation-card"]')).toBeVisible();
  await expect(page.locator('text=approved')).toBeVisible();
});
```

---

## Deployment Architecture

### Vercel Deployment

```
                    +------------------+
                    |   Vercel Edge    |
                    |   Network (CDN)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+       +-----------v-----------+
    |   Static Assets   |       |   Edge Functions      |
    |   (Next.js build) |       |   /api/chat           |
    +-------------------+       +-----------+-----------+
                                            |
                                +-----------v-----------+
                                |   Google Gemini API   |
                                |   (Gemini 2.5 Flash)  |
                                +-----------------------+
```

### Environment Configuration

```bash
# Production
GOOGLE_GENERATIVE_AI_API_KEY=your_prod_key_here
NEXT_PUBLIC_APP_URL=https://advisor-ai.vercel.app

# Preview (per-branch)
GOOGLE_GENERATIVE_AI_API_KEY=your_preview_key_here
NEXT_PUBLIC_APP_URL=https://advisor-ai-{branch}.vercel.app

# Development
GOOGLE_GENERATIVE_AI_API_KEY=your_dev_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Future Scalability

### Database Migration Path

```typescript
// Current: Mock data layer
import { getTasks, updateTaskStatus } from '@/lib/mock-data/tasks';

// Future: Supabase integration
// 1. Create abstract data interface
interface TaskRepository {
  getTasks(filters: TaskFilters): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task>;
}

// 2. Implement mock version (current)
class MockTaskRepository implements TaskRepository { ... }

// 3. Implement Supabase version (future)
class SupabaseTaskRepository implements TaskRepository { ... }

// 4. Use dependency injection
const taskRepository = process.env.USE_SUPABASE
  ? new SupabaseTaskRepository()
  : new MockTaskRepository();
```

### Authentication Integration

```typescript
// Future: Add Supabase Auth
// 1. Wrap app with auth provider
// 2. Protect API routes
// 3. Filter data by authenticated user

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Filter tasks by advisor ID
  const tasks = await getTasks({ advisorId: session.user.id });
  // ...
}
```

### Multi-Tenant Support

```typescript
// Future: Separate data by advisor
interface Task {
  id: string;
  advisorId: string; // Add foreign key
  // ... other fields
}

// Query with tenant isolation
const tasks = await supabase
  .from('tasks')
  .select('*')
  .eq('advisor_id', currentAdvisorId);
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-architect | Initial architecture design |
