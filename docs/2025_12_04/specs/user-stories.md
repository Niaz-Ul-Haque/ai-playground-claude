# Ciri - User Stories

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Ciri - Financial Advisor Assistant |
| **Version** | 1.0.0 (MVP) |
| **Date** | December 4, 2025 |
| **Author** | spec-analyst |
| **Status** | Draft |

---

## Priority Legend

| Priority | Description | Criteria |
|----------|-------------|----------|
| **P0** | Critical | Must have for MVP launch. Blocking if not complete. |
| **P1** | High | Should have for MVP. Can launch with workarounds if needed. |
| **P2** | Medium | Nice to have. Can defer to post-MVP. |
| **P3** | Low | Future consideration. Not in MVP scope. |

## Story Points Reference

| Points | Complexity | Typical Duration |
|--------|------------|------------------|
| 1 | Trivial | < 2 hours |
| 2 | Simple | 2-4 hours |
| 3 | Moderate | 4-8 hours |
| 5 | Complex | 1-2 days |
| 8 | Very Complex | 2-4 days |
| 13 | Epic-level | 1 week+ (should be broken down) |

---

## Epic 1: Chat Interface Foundation

### US-101: Full-Screen Chat Layout

**As a** financial advisor
**I want** a full-screen chat interface
**So that** I can focus entirely on my conversation with the AI assistant without distractions

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-001

**Acceptance Criteria**:
- WHEN I open the application THEN I see a full-viewport chat container
- WHEN I view the interface THEN I see a message area taking most of the screen height
- WHEN I view the interface THEN I see an input field fixed at the bottom
- WHEN the screen is resized THEN the layout adapts responsively

**Technical Notes**:
- Use Tailwind CSS for responsive layout
- Chat container should use `min-h-screen` and `flex flex-col`
- Input area should be `fixed` or `sticky` at bottom

---

### US-102: Message Display and History

**As a** financial advisor
**I want** to see my conversation history with the AI
**So that** I can reference previous exchanges and maintain context

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-001, FR-003

**Acceptance Criteria**:
- WHEN I send a message THEN it appears in the message list immediately
- WHEN the AI responds THEN the response appears below my message
- WHEN I scroll up THEN I can view older messages
- WHEN a new message arrives THEN the view auto-scrolls to show it
- WHEN I have many messages THEN the scrolling remains smooth

**Technical Notes**:
- Use Shadcn ScrollArea component
- Implement virtual scrolling if messages exceed 50
- Distinguish user vs AI messages visually (alignment, colors)

---

### US-103: Send Message via Input Field

**As a** financial advisor
**I want** to type and send messages to the AI
**So that** I can communicate my needs and questions

**Priority**: P0
**Story Points**: 2
**Requirements Reference**: FR-012

**Acceptance Criteria**:
- WHEN I type in the input field THEN the text appears
- WHEN I press Enter THEN the message is sent
- WHEN I press Shift+Enter THEN a new line is added
- WHEN I click the Send button THEN the message is sent
- WHEN the input is empty THEN the Send button is disabled
- WHEN I send a message THEN the input field is cleared

**Technical Notes**:
- Use controlled input with React state
- Implement keyboard event handling for Enter/Shift+Enter
- Button should use Shadcn Button component

---

### US-104: AI Response Streaming

**As a** financial advisor
**I want** to see AI responses appear word-by-word in real-time
**So that** I can start reading immediately without waiting for the full response

**Priority**: P0
**Story Points**: 5
**Requirements Reference**: FR-002

**Acceptance Criteria**:
- WHEN I send a message THEN tokens stream in progressively
- WHEN streaming THEN I see a typing indicator before first token
- WHEN tokens arrive THEN they append smoothly without jitter
- WHEN streaming completes THEN the typing indicator disappears
- WHEN an error occurs THEN I see a user-friendly error message

**Technical Notes**:
- Use Vercel AI SDK `useChat` hook
- API route at `/api/chat` for streaming
- Handle edge cases: timeout, network error, rate limit

---

### US-105: Typing Indicator

**As a** financial advisor
**I want** to see when the AI is thinking
**So that** I know my message was received and a response is coming

**Priority**: P1
**Story Points**: 1
**Requirements Reference**: FR-013

**Acceptance Criteria**:
- WHEN I send a message THEN a typing indicator appears immediately
- WHEN the first AI token arrives THEN the indicator transforms into the message
- WHEN viewing the indicator THEN it shows an animated state (dots, pulse, etc.)
- WHEN using a screen reader THEN it announces "AI is typing"

**Technical Notes**:
- Simple animated component (CSS keyframes)
- Position as a pending AI message bubble
- Use `aria-live="polite"` for accessibility

---

### US-106: Session Message Persistence

**As a** financial advisor
**I want** my conversation to persist if I refresh the page
**So that** I don't lose context from accidental refreshes

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-003

**Acceptance Criteria**:
- WHEN I refresh the page THEN my messages are restored
- WHEN I have more than 100 messages THEN older ones are removed
- WHEN I close the browser THEN messages are cleared
- WHEN I click "Clear Chat" THEN all messages are removed

**Technical Notes**:
- Use `sessionStorage` for persistence
- Serialize/deserialize message array as JSON
- Limit stored messages to 100 for performance

---

## Epic 2: Task Management

### US-201: View Today's Tasks

**As a** financial advisor
**I want** to ask the AI for my tasks today
**So that** I can plan my day efficiently

**Priority**: P0
**Story Points**: 5
**Requirements Reference**: FR-004, FR-005

**Acceptance Criteria**:
- WHEN I ask "What do I have today?" THEN the AI responds with a TaskListCard
- WHEN I ask "My tasks" or similar THEN the intent is recognized
- WHEN I have tasks due today THEN they are displayed in the card
- WHEN I have no tasks THEN an empty state message is shown
- WHEN I view the card THEN I see title, client, due time, and status for each task

**Technical Notes**:
- Intent classification for `show_todays_tasks`
- TaskListCard component with task array prop
- Filter mock data by today's date

---

### US-202: View Individual Task Details

**As a** financial advisor
**I want** to see detailed information about a specific task
**So that** I understand what needs to be done

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-006

**Acceptance Criteria**:
- WHEN I click a task in TaskListCard THEN a TaskCard expands with details
- WHEN I ask "What's the status on [task]?" THEN the AI shows a TaskCard
- WHEN I view a TaskCard THEN I see: title, description, client, due date, status
- WHEN the task is AI-completed THEN I see a visual indicator

**Technical Notes**:
- TaskCard component with full task object prop
- Status badge with color coding
- AI-completed badge/icon

---

### US-203: Approve AI-Completed Task

**As a** financial advisor
**I want** to approve work the AI has completed for me
**So that** I can verify and authorize actions before they're finalized

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-008, FR-010

**Acceptance Criteria**:
- WHEN I view a ReviewCard THEN I see Approve and Reject buttons
- WHEN I click Approve THEN the task status changes to "completed"
- WHEN I click Approve THEN a ConfirmationCard shows success
- WHEN I say "Approve" in chat THEN the most recent pending review is approved
- WHEN approval succeeds THEN the task list updates

**Technical Notes**:
- Track "current context" for implicit approval commands
- State mutation in mock data
- Optimistic UI update with rollback on error

---

### US-204: Reject AI-Completed Task

**As a** financial advisor
**I want** to reject work the AI has completed
**So that** I can prevent incorrect actions from being taken

**Priority**: P0
**Story Points**: 2
**Requirements Reference**: FR-008, FR-010

**Acceptance Criteria**:
- WHEN I click Reject on a ReviewCard THEN the task returns to "pending"
- WHEN I reject THEN a ConfirmationCard shows the rejection
- WHEN I say "Reject" or "Cancel" THEN the most recent pending review is rejected
- WHEN rejection succeeds THEN the task is no longer in "needs-review"

**Technical Notes**:
- Optional: prompt for rejection reason (deferred to post-MVP)
- Status transition: needs-review -> pending

---

### US-205: View Pending Reviews

**As a** financial advisor
**I want** to see all tasks awaiting my approval
**So that** I can review and act on AI-completed work

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-004, FR-005

**Acceptance Criteria**:
- WHEN I ask "What needs approval?" THEN I see tasks with status "needs-review"
- WHEN I ask "Pending reviews" THEN the same list appears
- WHEN there are multiple pending reviews THEN they're listed in chronological order
- WHEN there are no pending reviews THEN a message indicates this

**Technical Notes**:
- Intent: `show_pending_reviews`
- Filter mock data by status === 'needs-review'
- Each item should be actionable (approve/reject)

---

### US-206: Mark Task as Complete

**As a** financial advisor
**I want** to mark a task as complete through chat
**So that** I can update my task status without leaving the conversation

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-004, FR-010

**Acceptance Criteria**:
- WHEN I say "Mark the Johnson call as done" THEN the task status updates
- WHEN I say "Complete the [task]" THEN the AI identifies and updates the task
- WHEN the update succeeds THEN a ConfirmationCard confirms it
- WHEN the task doesn't exist THEN an error message is shown

**Technical Notes**:
- Intent: `complete_task`
- Entity extraction for task name/client
- Fuzzy matching for task identification

---

### US-207: Task Status Badges

**As a** financial advisor
**I want** to see visual status indicators on tasks
**So that** I can quickly understand the state of each task

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-005, FR-006

**Acceptance Criteria**:
- WHEN a task is "pending" THEN the badge is gray/neutral
- WHEN a task is "in-progress" THEN the badge is blue
- WHEN a task is "completed" THEN the badge is green
- WHEN a task is "needs-review" THEN the badge is orange/yellow
- WHEN viewing badges THEN the colors are accessible (not color-only)

**Technical Notes**:
- Use Shadcn Badge component with variants
- Include icons alongside colors for accessibility
- Consistent color scheme across all cards

---

## Epic 3: Client Information

### US-301: View Client Profile

**As a** financial advisor
**I want** to ask about a specific client
**So that** I can access their information quickly during conversations

**Priority**: P1
**Story Points**: 3
**Requirements Reference**: FR-004, FR-007

**Acceptance Criteria**:
- WHEN I ask "Tell me about John Smith" THEN a ClientCard appears
- WHEN I ask "Client info for Sarah Chen" THEN the AI shows her profile
- WHEN I view a ClientCard THEN I see: name, email, phone, portfolio value, risk profile
- WHEN the client doesn't exist THEN a helpful message is shown

**Technical Notes**:
- Intent: `show_client_info`
- Entity extraction for client name
- Fuzzy matching for name variations

---

### US-302: Client Portfolio Summary

**As a** financial advisor
**I want** to see a client's portfolio summary at a glance
**So that** I can understand their financial position quickly

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-007

**Acceptance Criteria**:
- WHEN I view a ClientCard THEN I see total portfolio value formatted as currency
- WHEN I view a ClientCard THEN I see their risk profile (conservative/moderate/aggressive)
- WHEN I view a ClientCard THEN I see last contact date

**Technical Notes**:
- Format currency with locale (CAD for Toronto)
- Risk profile as badge with color coding
- Relative date for last contact ("2 days ago")

---

### US-303: Quick Action - Client Tasks

**As a** financial advisor
**I want** to quickly see tasks related to a specific client
**So that** I can review all pending work for that relationship

**Priority**: P2
**Story Points**: 2
**Requirements Reference**: FR-007, FR-005

**Acceptance Criteria**:
- WHEN I view a ClientCard THEN I see a "Show tasks" button
- WHEN I click "Show tasks" THEN a TaskListCard appears filtered by that client
- WHEN the client has no tasks THEN a message indicates this

**Technical Notes**:
- Button triggers new AI message or inline expansion
- Filter tasks by clientId

---

## Epic 4: AI Interaction & Intent Recognition

### US-401: Natural Language Understanding

**As a** financial advisor
**I want** to communicate naturally with the AI
**So that** I don't have to remember specific commands

**Priority**: P0
**Story Points**: 5
**Requirements Reference**: FR-004

**Acceptance Criteria**:
- WHEN I use various phrasings for the same intent THEN the AI understands
- WHEN I ask about "meetings" or "appointments" THEN it maps to tasks
- WHEN I use casual language THEN the AI responds appropriately
- WHEN my intent is ambiguous THEN the AI asks for clarification

**Technical Notes**:
- Use Claude for intent classification
- Maintain intent mapping in prompts.ts
- Handle edge cases with fallback to general_question

---

### US-402: Context-Aware Responses

**As a** financial advisor
**I want** the AI to remember recent context
**So that** I can use references like "that" or "it" in follow-ups

**Priority**: P1
**Story Points**: 5
**Requirements Reference**: FR-004

**Acceptance Criteria**:
- WHEN I say "Approve it" after viewing a ReviewCard THEN the AI knows which task
- WHEN I say "Tell me more" THEN the AI expands on the previous topic
- WHEN I say "What about their portfolio?" after a client mention THEN context is maintained
- WHEN context is unclear THEN the AI asks for clarification

**Technical Notes**:
- Pass conversation history to AI
- Track "current focus" (task, client, etc.)
- Limit context window for performance

---

### US-403: Error Recovery in Conversation

**As a** financial advisor
**I want** the AI to help me recover from errors
**So that** I can continue working without starting over

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-014

**Acceptance Criteria**:
- WHEN an API error occurs THEN I see a friendly message with retry option
- WHEN I retry THEN my original message is resent
- WHEN the AI misunderstands THEN I can say "no" and it asks again
- WHEN I say "undo" after an action THEN the action is reversed (if reversible)

**Technical Notes**:
- Retry button on error cards
- Track reversible actions for undo
- Preserve input on failed send

---

### US-404: General Question Handling

**As a** financial advisor
**I want** to ask general questions
**So that** I can get help beyond just task management

**Priority**: P1
**Story Points**: 3
**Requirements Reference**: FR-004

**Acceptance Criteria**:
- WHEN I ask a question not matching specific intents THEN the AI responds conversationally
- WHEN I ask about financial topics THEN the AI provides helpful information
- WHEN I ask something completely off-topic THEN the AI politely redirects

**Technical Notes**:
- Fallback intent: `general_question`
- System prompt guides response style
- Stay professional and helpful

---

## Epic 5: UI Components & Cards

### US-501: ReviewCard Component

**As a** financial advisor
**I want** to see AI-completed work in a review format
**So that** I can understand what was done and decide whether to approve

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-008

**Acceptance Criteria**:
- WHEN viewing a ReviewCard THEN I see what action the AI took
- WHEN viewing a ReviewCard THEN I see which client it relates to
- WHEN viewing a ReviewCard THEN I see Approve and Reject buttons prominently
- WHEN I click "View Details" THEN I see the full content (e.g., email draft)
- WHEN the card loads THEN it's clear this is AI-completed work

**Technical Notes**:
- Visual distinction (icon, border, background)
- Expandable details section
- Action buttons at bottom

---

### US-502: ConfirmationCard Component

**As a** financial advisor
**I want** to see clear feedback after actions
**So that** I know my action was successful or why it failed

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-009

**Acceptance Criteria**:
- WHEN an action succeeds THEN I see a success card with green checkmark
- WHEN an action fails THEN I see an error card with red X
- WHEN viewing the card THEN I see what action was taken
- WHEN appropriate THEN I see an Undo option

**Technical Notes**:
- Two variants: success and error
- Auto-dismiss optional (5 second timer)
- Undo triggers reverse action

---

### US-503: Empty States

**As a** financial advisor
**I want** to see helpful messages when there's no data
**So that** I understand the situation and know what to do

**Priority**: P2
**Story Points**: 2
**Requirements Reference**: FR-005, FR-007

**Acceptance Criteria**:
- WHEN I have no tasks today THEN I see "No tasks scheduled for today"
- WHEN I have no pending reviews THEN I see "All caught up! No pending reviews."
- WHEN a client search returns nothing THEN I see "Client not found"
- WHEN empty states show THEN they suggest next actions

**Technical Notes**:
- Consistent empty state styling
- Include helpful suggestions or actions
- Friendly, not error-like tone

---

### US-504: Card Loading States

**As a** financial advisor
**I want** to see loading indicators while cards load
**So that** I know content is coming

**Priority**: P2
**Story Points**: 2
**Requirements Reference**: NFR-001

**Acceptance Criteria**:
- WHEN data is loading THEN I see skeleton placeholders
- WHEN skeletons show THEN they match the expected card layout
- WHEN data arrives THEN the transition is smooth

**Technical Notes**:
- Use Shadcn Skeleton component
- Match dimensions to actual content
- Fade transition on content load

---

## Epic 6: Mobile Experience

### US-601: Mobile-Optimized Layout

**As a** financial advisor on-the-go
**I want** to use the app on my phone
**So that** I can manage tasks while away from my desk

**Priority**: P0
**Story Points**: 3
**Requirements Reference**: FR-015

**Acceptance Criteria**:
- WHEN I use the app on mobile THEN all content is visible without horizontal scroll
- WHEN I view cards on mobile THEN they stack vertically
- WHEN I tap buttons THEN targets are at least 44x44px
- WHEN I type THEN the input field is visible above the keyboard

**Technical Notes**:
- Mobile-first Tailwind classes
- Test on iOS and Android viewports
- Handle virtual keyboard properly

---

### US-602: Touch-Friendly Interactions

**As a** financial advisor using touch
**I want** interactions optimized for touch
**So that** I can use the app comfortably without a mouse

**Priority**: P1
**Story Points**: 2
**Requirements Reference**: FR-015

**Acceptance Criteria**:
- WHEN I tap a button THEN it responds immediately with visual feedback
- WHEN I scroll THEN momentum scrolling works smoothly
- WHEN I swipe THEN there are no accidental triggers
- WHEN I long-press THEN there are no unexpected behaviors

**Technical Notes**:
- Use appropriate touch event handlers
- Button active states for feedback
- Consider swipe gestures for future features

---

## Epic 7: Error Handling & Edge Cases

### US-701: Network Error Handling

**As a** financial advisor
**I want** the app to handle network issues gracefully
**So that** I don't lose work or get confused by errors

**Priority**: P1
**Story Points**: 3
**Requirements Reference**: FR-014

**Acceptance Criteria**:
- WHEN the network disconnects THEN I see a notification
- WHEN I try to send during disconnect THEN my message is preserved
- WHEN connection returns THEN I can retry the message
- WHEN the AI service is slow THEN I see extended loading, not error

**Technical Notes**:
- Implement timeout handling (30s for AI)
- Queue failed messages for retry
- Toast notification for connection status

---

### US-702: Input Validation

**As a** financial advisor
**I want** my input to be validated
**So that** I don't accidentally send problematic content

**Priority**: P2
**Story Points**: 2
**Requirements Reference**: FR-012

**Acceptance Criteria**:
- WHEN I exceed 1000 characters THEN I'm prevented from typing more
- WHEN I'm approaching the limit THEN I see a character count
- WHEN I try to send empty whitespace THEN it's prevented
- WHEN I paste very long content THEN it's truncated with notice

**Technical Notes**:
- Character counter at 800+ characters
- Trim whitespace before validation
- Visual feedback on limit approach

---

### US-703: API Rate Limiting

**As a** financial advisor
**I want** the app to handle rate limits gracefully
**So that** I'm not confused when messages fail

**Priority**: P2
**Story Points**: 2
**Requirements Reference**: FR-014

**Acceptance Criteria**:
- WHEN I hit rate limits THEN I see a friendly message
- WHEN rate limited THEN I'm told to wait and given a timeframe
- WHEN the limit resets THEN I can continue normally
- WHEN approaching limits THEN no preemptive warning (MVP)

**Technical Notes**:
- Handle 429 response from API
- Show countdown or "try again in X seconds"
- Preserve user's message for retry

---

## Epic 8: Accessibility

### US-801: Keyboard Navigation

**As a** financial advisor using keyboard only
**I want** to navigate the entire app with keyboard
**So that** I can use the app without a mouse

**Priority**: P1
**Story Points**: 3
**Requirements Reference**: NFR-003

**Acceptance Criteria**:
- WHEN I press Tab THEN focus moves through interactive elements
- WHEN I press Enter on a button THEN it activates
- WHEN I press Escape THEN modals close
- WHEN focus moves THEN I see a visible focus indicator

**Technical Notes**:
- Ensure proper tabindex ordering
- Focus trapping in modals
- Skip links for main content

---

### US-802: Screen Reader Support

**As a** financial advisor using a screen reader
**I want** all content to be announced properly
**So that** I can use the app effectively

**Priority**: P1
**Story Points**: 3
**Requirements Reference**: NFR-003

**Acceptance Criteria**:
- WHEN a new message appears THEN it's announced
- WHEN I navigate to a card THEN its content is read
- WHEN I encounter a button THEN its purpose is announced
- WHEN status changes THEN the change is announced

**Technical Notes**:
- Use semantic HTML elements
- Add ARIA labels where needed
- Use aria-live for dynamic content

---

## Backlog Summary

### MVP (Must Complete)

| Story ID | Title | Points | Priority |
|----------|-------|--------|----------|
| US-101 | Full-Screen Chat Layout | 3 | P0 |
| US-102 | Message Display and History | 3 | P0 |
| US-103 | Send Message via Input Field | 2 | P0 |
| US-104 | AI Response Streaming | 5 | P0 |
| US-201 | View Today's Tasks | 5 | P0 |
| US-202 | View Individual Task Details | 3 | P0 |
| US-203 | Approve AI-Completed Task | 3 | P0 |
| US-204 | Reject AI-Completed Task | 2 | P0 |
| US-205 | View Pending Reviews | 3 | P0 |
| US-401 | Natural Language Understanding | 5 | P0 |
| US-501 | ReviewCard Component | 3 | P0 |
| US-601 | Mobile-Optimized Layout | 3 | P0 |

**Total MVP P0**: 40 points

### High Priority (Should Complete)

| Story ID | Title | Points | Priority |
|----------|-------|--------|----------|
| US-105 | Typing Indicator | 1 | P1 |
| US-106 | Session Message Persistence | 2 | P1 |
| US-206 | Mark Task as Complete | 2 | P1 |
| US-207 | Task Status Badges | 2 | P1 |
| US-301 | View Client Profile | 3 | P1 |
| US-302 | Client Portfolio Summary | 2 | P1 |
| US-402 | Context-Aware Responses | 5 | P1 |
| US-403 | Error Recovery in Conversation | 2 | P1 |
| US-404 | General Question Handling | 3 | P1 |
| US-502 | ConfirmationCard Component | 2 | P1 |
| US-602 | Touch-Friendly Interactions | 2 | P1 |
| US-701 | Network Error Handling | 3 | P1 |
| US-801 | Keyboard Navigation | 3 | P1 |
| US-802 | Screen Reader Support | 3 | P1 |

**Total P1**: 35 points

### Medium Priority (Nice to Have)

| Story ID | Title | Points | Priority |
|----------|-------|--------|----------|
| US-303 | Quick Action - Client Tasks | 2 | P2 |
| US-503 | Empty States | 2 | P2 |
| US-504 | Card Loading States | 2 | P2 |
| US-702 | Input Validation | 2 | P2 |
| US-703 | API Rate Limiting | 2 | P2 |

**Total P2**: 10 points

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-analyst | Initial user stories document |
