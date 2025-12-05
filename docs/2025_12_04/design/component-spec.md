# Ciri - Component Specifications

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

This document specifies all React components for Ciri, including props interfaces, event handlers, composition patterns, and styling guidelines. All components use TypeScript with strict mode, Tailwind CSS for styling, and follow Next.js 15 App Router patterns.

---

## Component Architecture

### Directory Structure

```
src/components/
  chat/
    index.ts                    # Barrel exports
    chat-container.tsx          # Main container component
    message-list.tsx            # Scrollable message area
    message-item.tsx            # Individual message
    chat-input.tsx              # Input field with send button
    typing-indicator.tsx        # AI typing animation
  cards/
    index.ts                    # Barrel exports
    task-card.tsx              # Individual task display
    task-list-card.tsx         # List of tasks
    client-card.tsx            # Client profile
    review-card.tsx            # AI-completed work review
    confirmation-card.tsx      # Success/error feedback
  ui/                          # Shadcn components (pre-installed)
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
```

### Component Naming Conventions

- **File names**: lowercase with dashes (`chat-container.tsx`)
- **Component names**: PascalCase (`ChatContainer`)
- **Props interfaces**: `ComponentNameProps`
- **Event handlers**: prefix with `handle` (`handleSendMessage`)
- **Boolean props**: prefix with `is`, `has`, `can` (`isLoading`, `hasError`)

---

## Chat Components

### ChatContainer

Main container component that orchestrates the chat interface.

```typescript
// src/components/chat/chat-container.tsx

'use client';

import { useRef } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

export interface ChatContainerProps {
  /** Additional CSS classes */
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useChatContext();

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    // Scroll to bottom after sending
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-background',
        className
      )}
    >
      {/* Message area */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          ref={scrollRef}
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <ChatInput
          onSend={handleSendMessage}
          isDisabled={isLoading}
        />
      </div>
    </div>
  );
}
```

**Behavior**:
- Full viewport height container
- Scrollable message area
- Fixed input at bottom
- Auto-scroll on new messages

**Accessibility**:
- Container has `role="main"`
- Focus management between input and messages

---

### MessageList

Scrollable container for displaying conversation messages.

```typescript
// src/components/chat/message-list.tsx

'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './message-item';
import { TypingIndicator } from './typing-indicator';
import { WelcomeMessage } from './welcome-message';
import { Message } from '@/types';
import { cn } from '@/lib/utils';

export interface MessageListProps {
  /** Array of messages to display */
  messages: Message[];

  /** Whether AI is currently typing */
  isLoading: boolean;

  /** Additional CSS classes */
  className?: string;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList({ messages, isLoading, className }, ref) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isLoading]);

    return (
      <ScrollArea
        ref={ref}
        className={cn('h-full px-4', className)}
      >
        <div
          className="max-w-3xl mx-auto py-4 space-y-4"
          role="log"
          aria-label="Conversation messages"
          aria-live="polite"
        >
          {/* Welcome message if no messages */}
          {messages.length === 0 && <WelcomeMessage />}

          {/* Message items */}
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>
    );
  }
);
```

**Behavior**:
- Smooth scrolling with ScrollArea
- Auto-scroll on new messages
- Welcome message when empty
- Typing indicator during AI response

**Accessibility**:
- `role="log"` for conversation
- `aria-live="polite"` for updates
- Proper heading hierarchy

---

### MessageItem

Individual message display with optional embedded cards.

```typescript
// src/components/chat/message-item.tsx

'use client';

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardRenderer } from './card-renderer';
import { parseMessageContent } from '@/lib/ai/parse-content';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { User, Bot, AlertCircle, RefreshCw } from 'lucide-react';

export interface MessageItemProps {
  /** Message to display */
  message: Message;

  /** Handler for retry action */
  onRetry?: (messageId: string) => void;

  /** Additional CSS classes */
  className?: string;
}

export function MessageItem({
  message,
  onRetry,
  className,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  // Parse content for embedded cards
  const parsedContent = useMemo(
    () => parseMessageContent(message.content),
    [message.content]
  );

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col gap-2 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Error state */}
        {isError && message.error ? (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-2">
              <span>{message.error.message}</span>
              {message.error.retryable && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(message.id)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Render parsed segments */}
            {parsedContent.segments.map((segment, index) => {
              if (segment.type === 'text' && segment.content.trim()) {
                return (
                  <div
                    key={index}
                    className={cn(
                      'rounded-lg px-4 py-2',
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {segment.content}
                    </p>
                  </div>
                );
              }

              if (segment.type === 'card') {
                return (
                  <CardRenderer
                    key={index}
                    cardType={segment.cardType}
                    data={segment.data}
                  />
                );
              }

              return null;
            })}
          </>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

**Behavior**:
- Visual distinction between user/AI messages
- Card rendering within messages
- Error state with retry button
- Streaming support

**Accessibility**:
- Avatar with appropriate alt text
- Time formatted for screen readers
- Error states announced

---

### ChatInput

Text input with send button for composing messages.

```typescript
// src/components/chat/chat-input.tsx

'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

export interface ChatInputProps {
  /** Handler for sending message */
  onSend: (content: string) => void;

  /** Whether input is disabled */
  isDisabled?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Maximum character count */
  maxLength?: number;

  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_PLACEHOLDER = 'Type a message... (Shift+Enter for new line)';
const DEFAULT_MAX_LENGTH = 1000;
const SHOW_COUNTER_AT = 800;

export function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = DEFAULT_PLACEHOLDER,
  maxLength = DEFAULT_MAX_LENGTH,
  className,
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedContent = content.trim();
  const canSend = trimmedContent.length > 0 && !isDisabled;
  const showCounter = content.length >= SHOW_COUNTER_AT;
  const isNearLimit = content.length >= maxLength - 50;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setContent(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift sends message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!canSend) return;

    onSend(trimmedContent);
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-lg border bg-background px-4 py-3',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'max-h-32 overflow-y-auto'
            )}
            aria-label="Message input"
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-12 w-12 shrink-0"
          aria-label={isDisabled ? 'Sending...' : 'Send message'}
        >
          {isDisabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Character counter */}
      {showCounter && (
        <div
          className={cn(
            'text-xs text-right',
            isNearLimit ? 'text-destructive' : 'text-muted-foreground'
          )}
          aria-live="polite"
        >
          {content.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
```

**Behavior**:
- Multi-line with auto-resize
- Enter sends, Shift+Enter for new line
- Character limit with counter
- Disabled state during AI response

**Accessibility**:
- Proper labels on all controls
- Character count announced
- Focus management

---

### TypingIndicator

Animated indicator shown while AI is generating response.

```typescript
// src/components/chat/typing-indicator.tsx

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TypingIndicatorProps {
  /** Additional CSS classes */
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn('flex gap-3', className)}
      role="status"
      aria-label="AI is typing"
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Animated dots */}
      <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3">
        <span className="sr-only">AI is typing</span>
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
      style={{ animationDelay: delay }}
      aria-hidden="true"
    />
  );
}
```

**Behavior**:
- Three bouncing dots animation
- Positioned as AI message
- Disappears when response starts streaming

**Accessibility**:
- `role="status"` for announcements
- Screen reader text provided

---

## Card Components

### TaskListCard

Displays a list of tasks with summary information.

```typescript
// src/components/cards/task-list-card.tsx

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskSummary, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDueDate, getStatusConfig } from '@/lib/utils/task-utils';
import { ChevronRight, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';

export interface TaskListCardProps {
  /** Optional title for the list */
  title?: string;

  /** Array of tasks to display */
  tasks: TaskSummary[];

  /** Filter label */
  filter?: 'today' | 'pending-review' | 'all' | 'client';

  /** Whether more tasks are available */
  hasMore?: boolean;

  /** Handler for clicking a task */
  onTaskClick?: (taskId: string) => void;

  /** Handler for loading more */
  onLoadMore?: () => void;

  /** Handler for task action */
  onTaskAction?: (taskId: string, action: 'approve' | 'reject') => void;

  /** Additional CSS classes */
  className?: string;
}

export function TaskListCard({
  title,
  tasks,
  filter,
  hasMore = false,
  onTaskClick,
  onLoadMore,
  onTaskAction,
  className,
}: TaskListCardProps) {
  if (tasks.length === 0) {
    return (
      <Card className={cn('max-w-md', className)}>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            {filter === 'pending-review'
              ? 'All caught up! No pending reviews.'
              : 'No tasks found.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('max-w-md', className)}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task.id)}
            onAction={onTaskAction}
          />
        ))}

        {hasMore && onLoadMore && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={onLoadMore}
          >
            Show more tasks
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskListItemProps {
  task: TaskSummary;
  onClick?: () => void;
  onAction?: (taskId: string, action: 'approve' | 'reject') => void;
}

function TaskListItem({ task, onClick, onAction }: TaskListItemProps) {
  const statusConfig = getStatusConfig(task.status);
  const showActions = task.status === 'needs-review';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        'hover:bg-muted/50 transition-colors',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Status icon */}
      <div className={cn('mt-0.5', statusConfig.iconColor)}>
        <StatusIcon status={task.status} />
      </div>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {task.clientName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDueDate(task.dueDate)}
          </span>
        </div>

        {/* Quick actions for needs-review */}
        {showActions && onAction && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAction(task.id, 'approve');
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAction(task.id, 'reject');
              }}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Status badge and arrow */}
      <div className="flex items-center gap-2">
        <Badge variant={statusConfig.variant as 'default' | 'secondary' | 'destructive' | 'outline'}>
          {statusConfig.label}
        </Badge>
        {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in-progress':
      return <Play className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'needs-review':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}
```

**Behavior**:
- Clickable items for expansion
- Quick actions on needs-review items
- Empty state message
- Load more pagination

**Accessibility**:
- Proper roles for interactive items
- Status communicated via text and icon
- Keyboard navigation

---

### TaskCard

Detailed view of a single task with actions.

```typescript
// src/components/cards/task-card.tsx

'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TaskCardData, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDueDate, getStatusConfig } from '@/lib/utils/task-utils';
import { Bot, Calendar, User, Clock } from 'lucide-react';

export interface TaskCardProps {
  /** Task data to display */
  task: TaskCardData;

  /** Handler for approve action */
  onApprove?: (taskId: string) => void;

  /** Handler for reject action */
  onReject?: (taskId: string) => void;

  /** Handler for complete action */
  onComplete?: (taskId: string) => void;

  /** Handler for viewing client */
  onViewClient?: (clientId: string) => void;

  /** Whether actions are loading */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

export function TaskCard({
  task,
  onApprove,
  onReject,
  onComplete,
  onViewClient,
  isLoading = false,
  className,
}: TaskCardProps) {
  const statusConfig = getStatusConfig(task.status);
  const showApproveReject = task.status === 'needs-review';
  const showComplete = task.status === 'pending' || task.status === 'in-progress';
  const isReadOnly = task.status === 'completed';

  return (
    <Card className={cn('max-w-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">
              {task.title}
            </CardTitle>

            {/* AI completed badge */}
            {task.aiCompleted && (
              <Badge variant="secondary" className="mt-2">
                <Bot className="h-3 w-3 mr-1" />
                AI Completed
              </Badge>
            )}
          </div>

          {/* Status badge */}
          <Badge variant={statusConfig.variant as 'default' | 'secondary' | 'destructive' | 'outline'}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {task.description}
        </p>

        <Separator />

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <button
              className="text-primary hover:underline"
              onClick={() => onViewClient?.(task.clientId)}
            >
              {task.clientName}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Updated {formatDueDate(task.lastUpdated)}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        {task.aiCompleted && task.aiSummary && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">AI Summary</p>
              <p className="text-sm text-muted-foreground">
                {task.aiSummary}
              </p>
            </div>
          </>
        )}
      </CardContent>

      {/* Actions */}
      {!isReadOnly && (
        <CardFooter className="flex gap-2">
          {showApproveReject && (
            <>
              <Button
                onClick={() => onApprove?.(task.id)}
                disabled={isLoading}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => onReject?.(task.id)}
                disabled={isLoading}
                className="flex-1"
              >
                Reject
              </Button>
            </>
          )}

          {showComplete && (
            <Button
              onClick={() => onComplete?.(task.id)}
              disabled={isLoading}
              className="flex-1"
            >
              Mark Complete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
```

**Behavior**:
- Full task details display
- Conditional action buttons based on status
- Client name links to ClientCard
- AI summary section for auto-completed

---

### ClientCard

Displays client profile information.

```typescript
// src/components/cards/client-card.tsx

'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ClientCardData, RiskProfile } from '@/types';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils/format';
import { Mail, Phone, TrendingUp, Calendar, ListTodo } from 'lucide-react';

export interface ClientCardProps {
  /** Client data to display */
  client: ClientCardData;

  /** Handler for viewing client tasks */
  onViewTasks?: (clientId: string) => void;

  /** Handler for email action */
  onEmail?: (email: string) => void;

  /** Handler for phone action */
  onCall?: (phone: string) => void;

  /** Additional CSS classes */
  className?: string;
}

const RISK_COLORS: Record<RiskProfile, string> = {
  conservative: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  aggressive: 'bg-red-100 text-red-800',
};

export function ClientCard({
  client,
  onViewTasks,
  onEmail,
  onCall,
  className,
}: ClientCardProps) {
  return (
    <Card className={cn('max-w-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          {/* Name and risk profile */}
          <div className="flex-1">
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <Badge
              variant="secondary"
              className={cn('mt-1', RISK_COLORS[client.riskProfile])}
            >
              {client.riskProfile.charAt(0).toUpperCase() + client.riskProfile.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact info */}
        <div className="space-y-2">
          <button
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            onClick={() => onEmail?.(client.email)}
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{client.email}</span>
          </button>

          {client.phone && (
            <button
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              onClick={() => onCall?.(client.phone!)}
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{client.phone}</span>
            </button>
          )}
        </div>

        <Separator />

        {/* Portfolio info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Portfolio Value
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-lg font-semibold">
                {formatCurrency(client.portfolioValue)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Active Tasks
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {client.taskCount}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Last contact */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Last contact: {formatRelativeDate(client.lastContact)}</span>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onViewTasks?.(client.id)}
        >
          <ListTodo className="h-4 w-4 mr-2" />
          View Tasks ({client.taskCount})
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**Behavior**:
- Avatar with initials
- Clickable contact info
- Portfolio value formatted as CAD
- Link to view client tasks

---

### ReviewCard

Displays AI-completed work for review and approval.

```typescript
// src/components/cards/review-card.tsx

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ReviewCardData } from '@/types';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/utils/format';
import { Bot, ChevronDown, ChevronUp, User, Clock } from 'lucide-react';

export interface ReviewCardProps {
  /** Review data to display */
  review: ReviewCardData;

  /** Handler for approve action */
  onApprove?: (taskId: string) => void;

  /** Handler for reject action */
  onReject?: (taskId: string) => void;

  /** Whether actions are loading */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  email_draft: 'Email Draft',
  portfolio_review: 'Portfolio Review',
  meeting_notes: 'Meeting Notes',
  report: 'Report',
  reminder: 'Reminder',
  analysis: 'Analysis',
};

export function ReviewCard({
  review,
  onApprove,
  onReject,
  isLoading = false,
  className,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn('max-w-md border-yellow-200 bg-yellow-50/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              <Bot className="h-3 w-3 mr-1" />
              AI Completed
            </Badge>
            <CardTitle className="text-lg leading-tight">
              {review.taskTitle}
            </CardTitle>
          </div>

          <Badge variant="outline">
            {ACTION_TYPE_LABELS[review.actionType] || review.actionType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{review.clientName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeDate(review.completedAt)}</span>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div>
          <p className="text-sm font-medium mb-1">Summary</p>
          <p className="text-sm text-muted-foreground">
            {review.summary}
          </p>
        </div>

        {/* Expandable details */}
        {review.details && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted rounded-lg p-3">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {review.previewContent || review.details}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => onApprove?.(review.taskId)}
          disabled={isLoading}
          className="flex-1"
        >
          Approve
        </Button>
        <Button
          variant="outline"
          onClick={() => onReject?.(review.taskId)}
          disabled={isLoading}
          className="flex-1"
        >
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**Behavior**:
- Visual distinction (yellow border/background)
- Collapsible details section
- Prominent approve/reject buttons
- Action type labeling

---

### ConfirmationCard

Displays success or error feedback after actions.

```typescript
// src/components/cards/confirmation-card.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationCardData } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Undo2 } from 'lucide-react';

export interface ConfirmationCardProps {
  /** Confirmation data */
  confirmation: ConfirmationCardData;

  /** Handler for undo action */
  onUndo?: (taskId: string, previousState: string) => void;

  /** Auto-dismiss timeout in ms (0 to disable) */
  autoDismissMs?: number;

  /** Handler when dismissed */
  onDismiss?: () => void;

  /** Additional CSS classes */
  className?: string;
}

export function ConfirmationCard({
  confirmation,
  onUndo,
  autoDismissMs = 0,
  onDismiss,
  className,
}: ConfirmationCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss timer
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  if (!isVisible) return null;

  const Icon = confirmation.success ? CheckCircle : XCircle;
  const iconColor = confirmation.success ? 'text-green-500' : 'text-red-500';
  const bgColor = confirmation.success ? 'bg-green-50' : 'bg-red-50';
  const borderColor = confirmation.success ? 'border-green-200' : 'border-red-200';

  return (
    <Card className={cn('max-w-md', bgColor, borderColor, className)}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColor)} />

          <div className="flex-1">
            <p className="text-sm font-medium">
              {confirmation.success ? 'Success' : 'Error'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {confirmation.message}
            </p>

            {confirmation.undoable && onUndo && confirmation.taskId && confirmation.previousState && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 -ml-2"
                onClick={() => onUndo(confirmation.taskId!, confirmation.previousState!)}
              >
                <Undo2 className="h-3 w-3 mr-1" />
                Undo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Behavior**:
- Success (green) or error (red) styling
- Optional auto-dismiss
- Undo button for reversible actions

---

## Card Renderer

Utility component for rendering cards based on type.

```typescript
// src/components/chat/card-renderer.tsx

'use client';

import { TaskCard } from '@/components/cards/task-card';
import { TaskListCard } from '@/components/cards/task-list-card';
import { ClientCard } from '@/components/cards/client-card';
import { ReviewCard } from '@/components/cards/review-card';
import { ConfirmationCard } from '@/components/cards/confirmation-card';
import { useChatContext } from '@/context/chat-context';
import {
  CardType,
  TaskCardData,
  TaskListCardData,
  ClientCardData,
  ReviewCardData,
  ConfirmationCardData,
} from '@/types';

export interface CardRendererProps {
  cardType: CardType;
  data: unknown;
}

export function CardRenderer({ cardType, data }: CardRendererProps) {
  const {
    handleApproveTask,
    handleRejectTask,
    handleCompleteTask,
    handleViewClient,
    handleViewClientTasks,
    handleUndo,
  } = useChatContext();

  switch (cardType) {
    case 'task-card':
      return (
        <TaskCard
          task={data as TaskCardData}
          onApprove={handleApproveTask}
          onReject={handleRejectTask}
          onComplete={handleCompleteTask}
          onViewClient={handleViewClient}
        />
      );

    case 'task-list':
      return (
        <TaskListCard
          {...(data as TaskListCardData)}
          onTaskAction={(taskId, action) => {
            if (action === 'approve') handleApproveTask(taskId);
            if (action === 'reject') handleRejectTask(taskId);
          }}
        />
      );

    case 'client-card':
      return (
        <ClientCard
          client={data as ClientCardData}
          onViewTasks={handleViewClientTasks}
        />
      );

    case 'review-card':
      return (
        <ReviewCard
          review={data as ReviewCardData}
          onApprove={handleApproveTask}
          onReject={handleRejectTask}
        />
      );

    case 'confirmation':
      return (
        <ConfirmationCard
          confirmation={data as ConfirmationCardData}
          onUndo={handleUndo}
        />
      );

    default:
      console.warn(`Unknown card type: ${cardType}`);
      return null;
  }
}
```

---

## Event Handling Patterns

### Standard Event Handlers

```typescript
// Naming convention: handle + Action + Subject
interface EventHandlers {
  handleSendMessage: (content: string) => Promise<void>;
  handleApproveTask: (taskId: string) => Promise<void>;
  handleRejectTask: (taskId: string) => Promise<void>;
  handleCompleteTask: (taskId: string) => Promise<void>;
  handleViewClient: (clientId: string) => void;
  handleViewClientTasks: (clientId: string) => void;
  handleRetryMessage: (messageId: string) => Promise<void>;
  handleUndo: (taskId: string, previousState: string) => Promise<void>;
  handleClearChat: () => void;
}
```

### Optimistic Updates

```typescript
// Pattern for optimistic updates with rollback
async function handleApproveTask(taskId: string) {
  // 1. Save current state for rollback
  const previousTask = tasks.find(t => t.id === taskId);

  // 2. Optimistically update UI
  dispatch({
    type: 'UPDATE_TASK',
    payload: { ...previousTask, status: 'completed' }
  });

  try {
    // 3. Send to server
    await api.approveTask(taskId);

    // 4. Add success message
    addMessage(createConfirmationMessage('approved', taskId));

  } catch (error) {
    // 5. Rollback on error
    dispatch({
      type: 'UPDATE_TASK',
      payload: previousTask
    });

    // 6. Show error message
    addMessage(createErrorMessage(error));
  }
}
```

---

## Styling Guidelines

### Tailwind Classes by Component Type

```typescript
// Container layouts
const containerClasses = 'flex flex-col min-h-screen bg-background';

// Card components
const cardClasses = 'max-w-md rounded-lg border bg-card shadow-sm';

// Message bubbles
const userMessageClasses = 'bg-primary text-primary-foreground rounded-lg px-4 py-2';
const aiMessageClasses = 'bg-muted rounded-lg px-4 py-2';

// Action buttons
const primaryButtonClasses = 'bg-primary text-primary-foreground hover:bg-primary/90';
const outlineButtonClasses = 'border border-input bg-background hover:bg-accent';

// Status badges
const pendingBadgeClasses = 'bg-gray-100 text-gray-800';
const inProgressBadgeClasses = 'bg-blue-100 text-blue-800';
const completedBadgeClasses = 'bg-green-100 text-green-800';
const needsReviewBadgeClasses = 'bg-yellow-100 text-yellow-800';
```

### Responsive Design

```typescript
// Mobile-first responsive patterns
const responsiveContainer = cn(
  'px-4',                    // Mobile: 16px padding
  'md:px-6',                 // Tablet: 24px padding
  'lg:px-8'                  // Desktop: 32px padding
);

const responsiveGrid = cn(
  'grid grid-cols-1',        // Mobile: single column
  'md:grid-cols-2',          // Tablet: two columns
  'lg:grid-cols-3'           // Desktop: three columns
);

const responsiveButton = cn(
  'w-full',                  // Mobile: full width
  'md:w-auto'                // Tablet+: auto width
);
```

### Animation Classes

```typescript
// Fade in
const fadeInClasses = 'animate-in fade-in duration-200';

// Slide up
const slideUpClasses = 'animate-in slide-in-from-bottom-4 duration-300';

// Bounce (typing indicator)
const bounceClasses = 'animate-bounce';

// Pulse (loading)
const pulseClasses = 'animate-pulse';
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-architect | Initial component specifications |
