# Ciri - Project Requirements Document

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Ciri - Financial Advisor Assistant |
| **Version** | 1.0.0 (MVP) |
| **Date** | December 4, 2025 |
| **Author** | spec-analyst |
| **Status** | Draft |

---

## Executive Summary

Ciri is an AI-powered assistant designed for Toronto-based financial advisors. It provides a single-page chat interface similar to ChatGPT where advisors can interact with an AI that manages their daily workflow, displays tasks through rich UI cards, auto-completes routine work, and presents client information on demand.

### Business Objectives

1. Reduce time spent on administrative task management by 50%
2. Provide instant access to client information without switching applications
3. Enable AI-assisted task completion with human oversight
4. Create a mobile-friendly interface for on-the-go access

---

## Stakeholders

### Primary Users
- **Financial Advisors**: Toronto-based advisors who manage client portfolios, conduct reviews, and handle daily administrative tasks
- **Needs**: Quick access to daily tasks, client information, efficient task completion, mobile access

### Secondary Users (Future Phases)
- **Office Managers**: May oversee multiple advisors' workloads
- **Compliance Officers**: May need audit trails of advisor actions

### System Administrators (Future Phases)
- **IT Staff**: Managing deployment, API keys, and system health

---

## Functional Requirements

### FR-001: Chat Interface Layout

**Description**: The application shall display a full-screen, single-page chat interface as the primary user interaction method.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Full viewport height chat container
- [ ] Message history displayed in scrollable area
- [ ] Input field fixed at bottom of viewport
- [ ] Send button adjacent to input field
- [ ] Auto-scroll to latest message on new message arrival
- [ ] Clear visual distinction between user and AI messages

**Dependencies**: None

---

### FR-002: AI Message Streaming

**Description**: AI responses shall stream in real-time using the Vercel AI SDK with Gemini provider.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Messages stream token-by-token as generated
- [ ] Typing indicator shown while AI is generating
- [ ] Streaming can be cancelled by user
- [ ] Graceful error handling on stream interruption
- [ ] Response completes even on slow connections

**Dependencies**: FR-001

---

### FR-003: Message Persistence (Session)

**Description**: Chat messages shall persist within a browser session.

**Priority**: P1 - High

**Acceptance Criteria**:
- [ ] Messages preserved on page refresh (session storage)
- [ ] Message history limited to 100 messages for performance
- [ ] Clear chat functionality available
- [ ] Messages cleared on browser close

**Dependencies**: FR-001

---

### FR-004: Intent Recognition System

**Description**: The AI shall recognize and respond to specific user intents with appropriate actions and UI cards.

**Priority**: P0 - Critical

**Supported Intents**:

| Intent ID | Example Phrases | Response Type |
|-----------|-----------------|---------------|
| `show_todays_tasks` | "What do I have today?", "My tasks", "Today's schedule" | TaskListCard |
| `show_pending_reviews` | "What needs approval?", "Pending reviews", "What did you complete?" | TaskListCard (filtered) |
| `show_task_status` | "What's the status on [task]?", "Update on [client]" | TaskCard |
| `show_client_info` | "Tell me about [name]", "Client info for [name]" | ClientCard |
| `approve_task` | "Approve", "Looks good", "Yes, send it" | ConfirmationCard |
| `reject_task` | "Reject", "Cancel", "No, don't send" | ConfirmationCard |
| `complete_task` | "Mark as done", "Complete the [task]" | ConfirmationCard |
| `general_question` | Any unrecognized input | TextMessage |

**Acceptance Criteria**:
- [ ] 90%+ accuracy on intent classification for trained phrases
- [ ] Graceful fallback to general_question for ambiguous inputs
- [ ] Context-aware intent resolution (e.g., "Approve" knows which task)
- [ ] Entity extraction for client names and task references

**Dependencies**: FR-002

---

### FR-005: TaskListCard Component

**Description**: Display multiple tasks in a structured card format within chat responses.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Displays task title, client name, due date, status
- [ ] Status badge with visual indicators (color-coded)
- [ ] Supports filtering (today, pending review, all)
- [ ] Click on individual task expands to TaskCard
- [ ] Empty state when no tasks match criteria
- [ ] Maximum 10 tasks displayed; "Show more" for additional

**Data Fields**:
- Task title (string, required)
- Client name (string, required)
- Due date (date, required)
- Status (enum: pending, in-progress, completed, needs-review)
- AI-completed flag (boolean)

**Dependencies**: FR-001

---

### FR-006: TaskCard Component

**Description**: Display individual task details with action buttons.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Full task details: title, description, client, due date, status
- [ ] Action buttons based on task status:
  - `needs-review`: Approve, Reject buttons
  - `pending`: Mark Complete, Edit buttons
  - `in-progress`: Mark Complete button
  - `completed`: No action buttons (read-only)
- [ ] Visual indicator for AI-completed tasks
- [ ] Timestamp of last update
- [ ] Client link (navigates to ClientCard context)

**Dependencies**: FR-005

---

### FR-007: ClientCard Component

**Description**: Display client information in a structured card format.

**Priority**: P1 - High

**Acceptance Criteria**:
- [ ] Client name prominently displayed
- [ ] Contact information: email, phone
- [ ] Portfolio summary: total value, risk profile
- [ ] Last contact date
- [ ] Quick action: "Show tasks for this client"
- [ ] Placeholder avatar with initials

**Data Fields**:
- Name (string, required)
- Email (string, required)
- Phone (string, optional)
- Portfolio value (number, required)
- Risk profile (enum: conservative, moderate, aggressive)
- Last contact (date, required)

**Dependencies**: FR-001

---

### FR-008: ReviewCard Component

**Description**: Display AI-completed tasks awaiting advisor approval.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Clear indication this is AI-completed work
- [ ] Summary of what AI did
- [ ] Preview of content (e.g., email draft preview)
- [ ] Prominent Approve and Reject buttons
- [ ] "View Details" expansion for full content
- [ ] Timestamp of AI completion
- [ ] Associated client information

**Dependencies**: FR-006

---

### FR-009: ConfirmationCard Component

**Description**: Display success or failure feedback after user actions.

**Priority**: P1 - High

**Acceptance Criteria**:
- [ ] Success state: green checkmark icon, positive message
- [ ] Failure state: red X icon, error message
- [ ] Action description (what was done)
- [ ] Undo option for reversible actions
- [ ] Auto-dismiss after 5 seconds (configurable)

**Dependencies**: FR-006, FR-008

---

### FR-010: Task Status Management

**Description**: Users shall be able to change task status through chat interactions.

**Priority**: P0 - Critical

**Status Transitions**:
```
pending -> in-progress -> completed
pending -> completed (skip in-progress)
needs-review -> completed (approved)
needs-review -> pending (rejected, needs redo)
```

**Acceptance Criteria**:
- [ ] Status changes reflect immediately in UI
- [ ] Status change triggers appropriate ConfirmationCard
- [ ] Invalid transitions prevented with error message
- [ ] Bulk status changes not supported in MVP

**Dependencies**: FR-004, FR-006

---

### FR-011: Mock Data System

**Description**: Application shall use mock data for tasks and clients during MVP phase.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Minimum 10 mock tasks with varied statuses
- [ ] Minimum 5 mock clients with complete profiles
- [ ] At least 2 tasks per client
- [ ] At least 3 tasks with `needs-review` status (AI-completed)
- [ ] Data persists within session
- [ ] Mutations (status changes) update mock data
- [ ] Easy to extend/modify mock data

**Dependencies**: None

---

### FR-012: Chat Input Handling

**Description**: The chat input shall support text entry and submission.

**Priority**: P0 - Critical

**Acceptance Criteria**:
- [ ] Multi-line text input support
- [ ] Enter key sends message (Shift+Enter for new line)
- [ ] Send button enabled only when input is non-empty
- [ ] Input cleared after successful send
- [ ] Input disabled while AI is responding
- [ ] Maximum 1000 characters per message
- [ ] Character count indicator when >800 characters

**Dependencies**: FR-001

---

### FR-013: Typing Indicator

**Description**: Visual indicator when AI is generating a response.

**Priority**: P1 - High

**Acceptance Criteria**:
- [ ] Animated dots or similar indicator
- [ ] Positioned as pending AI message
- [ ] Appears immediately on message send
- [ ] Disappears when first token streams
- [ ] Accessible (screen reader announces "AI is typing")

**Dependencies**: FR-002

---

### FR-014: Error Handling and Recovery

**Description**: The application shall gracefully handle errors and provide recovery options.

**Priority**: P1 - High

**Error Scenarios**:
- API timeout
- Network disconnection
- Invalid API response
- Rate limiting

**Acceptance Criteria**:
- [ ] User-friendly error messages (no technical jargon)
- [ ] Retry button for transient failures
- [ ] Preserve user input on failure
- [ ] Log errors for debugging (console in MVP)
- [ ] Graceful degradation (show cached data if available)

**Dependencies**: FR-002

---

### FR-015: Mobile Responsive Design

**Description**: The application shall be fully functional on mobile devices.

**Priority**: P0 - Critical

**Breakpoints**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Acceptance Criteria**:
- [ ] Touch-friendly tap targets (minimum 44x44px)
- [ ] Cards stack vertically on mobile
- [ ] Input field accessible above keyboard on mobile
- [ ] No horizontal scrolling required
- [ ] Readable text without zooming (minimum 16px)
- [ ] Action buttons full-width on mobile

**Dependencies**: All FR components

---

## Non-Functional Requirements

### NFR-001: Performance

**Description**: The application shall meet performance benchmarks for a responsive user experience.

**Metrics**:
| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial page load | < 3 seconds | Lighthouse |
| Time to interactive | < 3.5 seconds | Lighthouse |
| First AI token | < 2 seconds | Custom timing |
| UI response to input | < 100ms | User testing |
| Card render time | < 200ms | Performance API |

**Acceptance Criteria**:
- [ ] Lighthouse Performance score > 80
- [ ] No layout shifts during streaming (CLS < 0.1)
- [ ] Smooth scrolling at 60fps

---

### NFR-002: Security

**Description**: The application shall protect sensitive data and API credentials.

**Requirements**:
- [ ] API keys stored in environment variables only
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced in production
- [ ] Input sanitization for XSS prevention
- [ ] No persistent storage of client PII in browser

**Standards**: OWASP Top 10 awareness (full compliance in Phase 2)

---

### NFR-003: Accessibility

**Description**: The application shall be accessible to users with disabilities.

**Standards**: WCAG 2.1 AA compliance

**Requirements**:
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader compatible (ARIA labels)
- [ ] Color contrast ratio minimum 4.5:1
- [ ] Focus indicators visible
- [ ] No content conveyed by color alone
- [ ] Announce new messages to screen readers

---

### NFR-004: Browser Compatibility

**Description**: The application shall function correctly on modern browsers.

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Acceptance Criteria**:
- [ ] Core functionality works on all supported browsers
- [ ] Visual consistency across browsers
- [ ] Graceful degradation for older browsers

---

### NFR-005: Code Quality

**Description**: The codebase shall maintain high quality standards.

**Requirements**:
- [ ] TypeScript strict mode with no `any` types
- [ ] ESLint passing with no errors
- [ ] 80%+ test coverage for core components
- [ ] Component documentation via JSDoc
- [ ] Consistent file naming conventions

---

### NFR-006: Scalability Considerations

**Description**: Architecture shall support future scaling needs.

**Requirements**:
- [ ] Stateless API design for horizontal scaling
- [ ] Component architecture supports feature additions
- [ ] Mock data layer abstracts future database integration
- [ ] Clear separation of concerns (UI, logic, data)

---

### NFR-007: Reliability

**Description**: The application shall maintain high availability.

**Targets**:
- 99% uptime for MVP (excluding planned maintenance)
- Graceful handling of Gemini API downtime
- Session recovery after brief disconnections

---

## Technical Constraints

### TC-001: Technology Stack
- Next.js 15 with App Router (no Pages Router)
- TypeScript 5.x in strict mode
- React 19 with functional components only
- Tailwind CSS 4.x for styling
- Shadcn UI for component library
- Vercel AI SDK 5.x for streaming

### TC-002: API Constraints
- Single Gemini API key for MVP
- Claude model for AI responses
- Streaming responses required
- Rate limiting handled client-side

### TC-003: Data Constraints
- Mock data only (no database in MVP)
- Session storage for persistence
- Maximum 100 messages per session
- No file uploads in MVP

### TC-004: Deployment Constraints
- Vercel deployment target
- Environment variables via Vercel dashboard
- No server-side persistence required

---

## Assumptions

### A-001: Single User
MVP assumes a single advisor user. No multi-tenancy or user authentication required.

### A-002: English Only
All content and interactions are in English. No internationalization in MVP.

### A-003: Mock Actions
All "actions" (send email, schedule meeting) are simulated in frontend. No actual external integrations.

### A-004: Browser Support
Users have modern, updated browsers. No IE11 or legacy browser support.

### A-005: Internet Connectivity
Users have stable internet connection. Offline mode not supported.

### A-006: API Availability
Gemini API is available with reasonable latency (<2s response start).

### A-007: Data Accuracy
Mock data is representative of real advisor workflows but not from actual client data.

---

## Out of Scope (MVP)

### OS-001: Authentication
No login, logout, or user management. Single advisor assumption.

### OS-002: Real Database
No Supabase, PostgreSQL, or persistent storage. Mock data only.

### OS-003: External Integrations
No email sending, calendar sync, or CRM integration.

### OS-004: Multi-User Features
No shared workspaces, team features, or advisor collaboration.

### OS-005: Audit Trail
No logging of advisor actions for compliance. Future phase.

### OS-006: Offline Support
No Progressive Web App features or offline functionality.

### OS-007: File Handling
No document upload, attachment viewing, or file management.

### OS-008: Voice Input
No speech-to-text or voice commands.

### OS-009: Analytics
No usage analytics, dashboards, or reporting features.

### OS-010: Custom Branding
No white-labeling or theming options.

---

## Glossary

| Term | Definition |
|------|------------|
| **Advisor** | A financial advisor who uses the application |
| **Task** | A work item to be completed by the advisor |
| **Client** | A customer of the financial advisor |
| **Card** | A UI component embedded in chat messages |
| **Intent** | The classified purpose of a user's message |
| **AI-Completed** | A task automatically completed by the AI assistant |
| **Review** | The process of approving or rejecting AI-completed work |
| **Streaming** | Real-time token-by-token delivery of AI responses |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-analyst | Initial requirements document |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| Architect | | | |
