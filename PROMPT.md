/agent-workflow 

"Build Ciri - A production-ready AI assistant for Toronto financial advisors

## Product Vision
Single-page chat interface (similar to ChatGPT) where financial advisors interact with an AI assistant that manages their daily workflow. The AI can show tasks, auto-complete routine work, and present information through rich UI cards embedded in chat responses.

## Core Features (MVP)

### 1. Chat Interface
- Full-screen chat layout with message history
- Streaming AI responses using Vercel AI SDK
- Input field with send button at bottom
- Auto-scroll to latest message
- Mobile-responsive design

### 2. Task Management Cards
- TaskListCard: Display multiple tasks with status badges
- TaskCard: Individual task with title, client, due date, status
- Action buttons: Approve, Reject, Mark Complete
- Visual status indicators (pending, in-progress, completed, needs-review)

### 3. AI Auto-Complete System
- ReviewCard: Shows AI-completed tasks awaiting approval
- Displays what AI did, for which client, with approve/reject
- Confirmation feedback after advisor action

### 4. Client Information
- ClientCard: Shows client name, contact, portfolio summary
- Triggered by queries like 'Tell me about [client name]'

### 5. Intent Recognition
The AI must recognize these intents from natural language:
- show_todays_tasks: 'What do I have today?', 'My tasks'
- show_pending_reviews: 'What needs approval?', 'Pending reviews'
- show_client_info: 'Tell me about John Smith', 'Client info for...'
- approve_task: 'Approve', 'Looks good', 'Yes'
- reject_task: 'Reject', 'Cancel', 'No'
- complete_task: 'Mark as done', 'Complete the...'

## Technical Requirements

### Stack
- Next.js 15 with App Router
- TypeScript strict mode
- Shadcn UI + Tailwind CSS
- Vercel AI SDK with Gemini provider
- React Context for state management

### Architecture
- /api/chat/route.ts: Streaming chat endpoint
- Intent parser determines response type
- Messages contain both text and optional card components
- Mock data for tasks and clients (no real DB yet)

### Data Models
- Task: id, title, clientId, clientName, dueDate, status, description, aiCompleted
- Client: id, name, email, phone, portfolioValue, riskProfile, lastContact
- Message: id, role, content, cardType?, cardData?, timestamp

### Quality Standards
- 80%+ test coverage
- Full TypeScript types
- Accessible (WCAG AA)
- Mobile-first responsive
- Clean component architecture

## Deliverables
1. Complete working chat interface
2. All card components (TaskCard, TaskListCard, ClientCard, ReviewCard)
3. AI chat endpoint with intent recognition
4. Mock data with realistic financial advisor scenarios
5. Type definitions for all models
6. Unit tests for critical functions"