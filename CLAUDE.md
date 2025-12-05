# Ciri - Financial Advisor Assistant

## Project Overview

An AI-powered assistant for Toronto-based financial advisors. Single-page chat interface (like ChatGPT) where advisors interact with an AI that:
- Shows and manages daily tasks
- Auto-completes routine tasks pending advisor review
- Answers questions about clients, schedules, and workflows
- Mimics email/communication actions in frontend (real integration later)

This project uses the **Spec Agent Workflow System** for coordinated development.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: Shadcn UI + Tailwind CSS
- **AI**: Google Gemini API via Vercel AI SDK
- **State**: React Context + useReducer
- **Database**: Mock data first → Supabase later

---

## Project Documentation Conventions (Important)

**Documentation Files:** All new documentation or task files must be saved under the `docs/` folder.

- **Tasks & TODOs**: Save in `docs/{YYYY_MM_DD}/tasks/`
- **Requirements/Specs**: Save in `docs/{YYYY_MM_DD}/specs/`
- **Design Docs**: Save in `docs/{YYYY_MM_DD}/design/`
- **Code Files**: Follow the project structure in `src/`
- **Tests**: Put new test files under `tests/`

> **Important:** When creating a new file, ensure the directory exists or create it. Never default to the root directory.

---

## Workflow System Integration

### Available Agents

| Agent | Purpose |
|-------|---------|
| spec-orchestrator | Workflow coordination & quality gates |
| spec-analyst | Requirements analysis & user stories |
| spec-architect | System architecture & API design |
| spec-planner | Task breakdown & estimation |
| spec-developer | Code implementation |
| spec-tester | Test writing & coverage |
| spec-reviewer | Code review & best practices |
| spec-validator | Final validation & quality scoring |
| senior-frontend-architect | React/Next.js expertise |
| ui-ux-master | Design system & UX guidance |

### Quality Gates

- **Gate 1 (Planning)**: 95% threshold
- **Gate 2 (Development)**: 80% threshold
- **Gate 3 (Production)**: 85% threshold

---

## Model Recommendations

| Agent | Recommended Model | Reason |
|-------|-------------------|--------|
| spec-analyst | Opus | Complex requirement analysis |
| spec-architect | Opus | Architecture decisions |
| spec-planner | Sonnet | Task breakdown is straightforward |
| spec-developer | Sonnet | Code generation, speed matters |
| spec-tester | Sonnet | Test writing is mechanical |
| spec-reviewer | Opus | Catches subtle bugs |
| spec-validator | Opus | Final quality assessment |

--

## Application Architecture

### Core Concept

Single-page chat interface. All user interactions happen through natural language.
The AI parses intent and renders appropriate UI components inline with text responses.

### Message Response Types

1. **TextMessage** - Plain conversational reply
2. **TaskCard** - Single task with approve/reject actions
3. **TaskListCard** - Multiple tasks (today's tasks, pending reviews)
4. **ClientCard** - Client information display
5. **ReviewCard** - AI-completed action needing approval
6. **ConfirmationCard** - Success/failure feedback

### User Intents
```typescript
type UserIntent =
  | 'show_todays_tasks'      // "What do I have today?"
  | 'show_task_status'       // "What's the status on client A?"
  | 'show_pending_reviews'   // "What needs my approval?"
  | 'approve_task'           // "Approve that" / "Looks good"
  | 'reject_task'            // "Don't send that" / "Cancel"
  | 'show_client_info'       // "Tell me about John Smith"
  | 'complete_task'          // "Mark the Johnson call as done"
  | 'general_question'       // Anything else
```

---

## File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Main chat page
│   ├── globals.css
│   └── api/
│       └── chat/
│           └── route.ts        # AI streaming endpoint
├── components/
│   ├── chat/
│   │   ├── chat-container.tsx
│   │   ├── message-list.tsx
│   │   ├── message-item.tsx
│   │   ├── chat-input.tsx
│   │   └── typing-indicator.tsx
│   ├── cards/
│   │   ├── task-card.tsx
│   │   ├── task-list-card.tsx
│   │   ├── client-card.tsx
│   │   └── review-card.tsx
│   └── ui/                     # Shadcn components
├── hooks/
│   ├── use-chat.ts
│   ├── use-tasks.ts
│   └── use-clients.ts
├── lib/
│   ├── ai/
│   │   ├── parse-intent.ts
│   │   ├── prompts.ts
│   │   └── response-builder.ts
│   ├── mock-data/
│   │   ├── tasks.ts
│   │   └── clients.ts
│   └── utils.ts
├── types/
│   ├── index.ts
│   ├── chat.ts
│   ├── task.ts
│   └── client.ts
└── context/
    └── chat-context.tsx
```

---

## Coding Conventions

### TypeScript
- Use `interface` over `type` for object shapes
- Prefix event handlers with `handle` (e.g., `handleSendMessage`)
- Descriptive booleans: `isLoading`, `hasError`, `canSubmit`
- Named exports for components

### Components
- Functional components only
- Props interface: `ComponentNameProps`
- Early returns for conditionals
- Mobile-first responsive design

### Styling
- Tailwind CSS only (no CSS files)
- Shadcn UI components
- Consistent spacing (Tailwind scale)

### File Naming
- Lowercase with dashes: `chat-input.tsx`
- Barrel exports via `index.ts`

---

## Sample Interactions

**User**: "What tasks do I have today?"
**AI**: "You have 3 tasks scheduled for today:" → renders TaskListCard

**User**: "What's the status on the Johnson portfolio review?"
**AI**: "The Johnson portfolio review is complete and ready for your approval:" → renders ReviewCard

**User**: "Approve it"
**AI**: "Done! I've approved the Johnson portfolio review. The client will be notified." → renders ConfirmationCard

**User**: "Tell me about Sarah Chen"
**AI**: "Here's Sarah Chen's profile:" → renders ClientCard

---

## Development Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run format   # Prettier format (if configured)
```

---

## Environment Variables

Create `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

---

## Phase 1 MVP Scope

### In Scope
- [x] Single-page chat interface
- [x] Message streaming with AI
- [x] Task list display (TaskListCard)
- [x] Individual task cards with approve/reject
- [x] Client info lookup (ClientCard)
- [x] AI auto-complete notifications (ReviewCard)
- [x] Mock data for tasks/clients

### Out of Scope (Phase 2+)
- [ ] Real database (Supabase)
- [ ] User authentication
- [ ] Email integration
- [ ] Calendar sync
- [ ] Multi-user support

---

## Important Development Notes

1. **Mock Everything First** - No real API calls to external services
2. **No Auth for MVP** - Single advisor assumption
3. **Streaming Required** - Use Vercel AI SDK `useChat` hook
4. **Cards in Messages** - AI responses can contain embedded React components
5. **Mobile First** - Design for mobile, scale up to desktop
```

---

## Step 6: Verify Your Structure

Your folder should now look like this:
```
advisor-ai/
├── .claude/
│   ├── agents/
│   │   ├── spec-orchestrator.md
│   │   ├── spec-analyst.md
│   │   ├── spec-architect.md
│   │   ├── spec-planner.md
│   │   ├── spec-developer.md
│   │   ├── spec-tester.md
│   │   ├── spec-reviewer.md
│   │   ├── spec-validator.md
│   │   ├── senior-frontend-architect.md
│   │   ├── senior-backend-architect.md
│   │   ├── ui-ux-master.md
│   │   └── refactor-agent.md
│   └── commands/
│       └── agent-workflow.md
├── docs/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── CLAUDE.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── ...