# Ciri - Acceptance Criteria

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Ciri - Financial Advisor Assistant |
| **Version** | 1.0.0 (MVP) |
| **Date** | December 4, 2025 |
| **Author** | spec-analyst |
| **Status** | Draft |

---

## Format Guide

This document uses the Given/When/Then (GWT) format for acceptance criteria:

- **GIVEN**: The initial context or preconditions
- **WHEN**: The action or trigger
- **THEN**: The expected outcome or result
- **AND**: Additional conditions or outcomes

---

## Feature: Chat Interface

### AC-CHAT-001: Initial Page Load

```gherkin
Scenario: User opens Ciri for the first time
  GIVEN I am a financial advisor
  AND I have not used Ciri before
  WHEN I navigate to the application URL
  THEN I see a full-screen chat interface
  AND the message area displays a welcome message from the AI
  AND the input field is focused and ready for typing
  AND the page loads within 3 seconds
```

### AC-CHAT-002: Welcome Message Content

```gherkin
Scenario: AI greets the user appropriately
  GIVEN I have just loaded the application
  WHEN the initial AI message appears
  THEN I see a friendly greeting
  AND the message mentions what the AI can help with
  AND the message suggests example commands (e.g., "What do I have today?")
```

### AC-CHAT-003: Send Message via Button

```gherkin
Scenario: User sends a message using the send button
  GIVEN I am on the chat interface
  AND I have typed "What do I have today?" in the input field
  WHEN I click the Send button
  THEN my message appears in the message list
  AND the input field is cleared
  AND a typing indicator appears
  AND the AI begins responding
```

### AC-CHAT-004: Send Message via Enter Key

```gherkin
Scenario: User sends a message using Enter key
  GIVEN I am on the chat interface
  AND I have typed "My tasks" in the input field
  WHEN I press the Enter key
  THEN my message is sent
  AND the same behavior occurs as clicking Send button
```

### AC-CHAT-005: Multi-line Input

```gherkin
Scenario: User enters a multi-line message
  GIVEN I am on the chat interface
  AND I have typed "First line"
  WHEN I press Shift+Enter
  AND I type "Second line"
  THEN the input field shows both lines
  AND the message is NOT sent
  AND I can continue typing
```

### AC-CHAT-006: Empty Input Prevention

```gherkin
Scenario: User cannot send empty message
  GIVEN I am on the chat interface
  AND the input field is empty
  WHEN I try to click the Send button
  THEN the button is disabled
  AND no message is sent

Scenario: User cannot send whitespace-only message
  GIVEN I am on the chat interface
  AND I have typed only spaces in the input field
  WHEN I try to send the message
  THEN the message is not sent
  AND the input remains for correction
```

### AC-CHAT-007: Message Auto-Scroll

```gherkin
Scenario: Chat auto-scrolls to new messages
  GIVEN I am viewing older messages in the history
  WHEN a new AI response completes
  THEN the chat scrolls to show the latest message
  AND the scroll animation is smooth
```

### AC-CHAT-008: Input Disabled During Response

```gherkin
Scenario: User cannot send while AI is responding
  GIVEN I have just sent a message
  AND the AI is currently streaming a response
  WHEN I try to type in the input field
  THEN the input field is disabled
  AND the Send button shows a loading state
  WHEN the AI response completes
  THEN the input field is re-enabled
  AND focus returns to the input field
```

### AC-CHAT-009: Character Limit

```gherkin
Scenario: User approaches character limit
  GIVEN I am typing a message
  WHEN my message reaches 800 characters
  THEN a character counter appears showing "800/1000"

Scenario: User reaches character limit
  GIVEN I am typing a message
  WHEN my message reaches 1000 characters
  THEN I cannot type additional characters
  AND the counter shows "1000/1000" in a warning color
```

---

## Feature: AI Response Streaming

### AC-STREAM-001: Token-by-Token Display

```gherkin
Scenario: AI response streams progressively
  GIVEN I have sent a message
  WHEN the AI begins responding
  THEN I see a typing indicator
  AND text appears word-by-word as tokens arrive
  AND the text never jumps or rearranges
```

### AC-STREAM-002: Streaming Completion

```gherkin
Scenario: AI response completes successfully
  GIVEN the AI is streaming a response
  WHEN all tokens have been received
  THEN the typing indicator disappears
  AND the complete message is displayed
  AND any cards are fully rendered
  AND I can send a new message
```

### AC-STREAM-003: Stream Error Handling

```gherkin
Scenario: Network error during streaming
  GIVEN the AI is streaming a response
  WHEN the network connection is lost
  THEN I see an error message in the chat
  AND the message includes a "Retry" button
  AND my original message is preserved

Scenario: API timeout during streaming
  GIVEN the AI is streaming a response
  WHEN 30 seconds pass without new tokens
  THEN I see a timeout error message
  AND I am offered the option to retry
```

---

## Feature: Task List Display

### AC-TASKS-001: View Today's Tasks

```gherkin
Scenario: User requests today's tasks
  GIVEN I am on the chat interface
  AND I have tasks scheduled for today
  WHEN I ask "What do I have today?"
  THEN the AI responds with text acknowledging my request
  AND a TaskListCard appears with today's tasks
  AND each task shows: title, client name, due time, status badge
  AND tasks are sorted by due time (earliest first)
```

### AC-TASKS-002: Today's Tasks - Empty State

```gherkin
Scenario: User has no tasks today
  GIVEN I am on the chat interface
  AND I have no tasks scheduled for today
  WHEN I ask "What do I have today?"
  THEN the AI responds with "No tasks scheduled for today"
  AND the message is friendly, not an error
  AND suggestions for other actions are provided
```

### AC-TASKS-003: Task List Variants

```gherkin
Scenario: Various phrasings recognized for task list
  GIVEN I am on the chat interface
  WHEN I ask any of the following:
    | "What do I have today?" |
    | "My tasks" |
    | "Show me my tasks" |
    | "Today's schedule" |
    | "What's on my plate?" |
  THEN the AI shows today's tasks
```

### AC-TASKS-004: Pending Reviews List

```gherkin
Scenario: User requests pending reviews
  GIVEN I am on the chat interface
  AND there are tasks with status "needs-review"
  WHEN I ask "What needs my approval?"
  THEN the AI shows a TaskListCard filtered to "needs-review" status
  AND each task shows the Ciri-completed indicator
  AND Approve/Reject actions are accessible
```

### AC-TASKS-005: Pending Reviews - Empty State

```gherkin
Scenario: No pending reviews
  GIVEN I am on the chat interface
  AND there are no tasks with status "needs-review"
  WHEN I ask "What needs approval?"
  THEN the AI responds "All caught up! No pending reviews."
  AND the tone is positive and encouraging
```

---

## Feature: Task Card Details

### AC-TASKCARD-001: Full Task Details

```gherkin
Scenario: View individual task details
  GIVEN I see a TaskListCard with tasks
  WHEN I click on a specific task
  THEN a TaskCard expands or appears
  AND I see the full task details:
    | Field | Displayed |
    | Title | Yes |
    | Description | Yes |
    | Client Name | Yes |
    | Due Date/Time | Yes |
    | Status | Yes (badge) |
    | Ciri-Completed | Yes (if applicable) |
```

### AC-TASKCARD-002: Status Badge Colors

```gherkin
Scenario: Status badges have correct colors
  GIVEN I am viewing a TaskCard
  WHEN the task status is "pending"
  THEN the badge is gray with a clock icon

  GIVEN I am viewing a TaskCard
  WHEN the task status is "in-progress"
  THEN the badge is blue with a spinner icon

  GIVEN I am viewing a TaskCard
  WHEN the task status is "completed"
  THEN the badge is green with a checkmark icon

  GIVEN I am viewing a TaskCard
  WHEN the task status is "needs-review"
  THEN the badge is orange/yellow with an eye icon
```

### AC-TASKCARD-003: Task Actions by Status

```gherkin
Scenario: Pending task actions
  GIVEN I am viewing a TaskCard with status "pending"
  THEN I see "Mark Complete" button
  AND I see "Start" button (sets to in-progress)

Scenario: Needs-review task actions
  GIVEN I am viewing a TaskCard with status "needs-review"
  THEN I see "Approve" button
  AND I see "Reject" button

Scenario: Completed task actions
  GIVEN I am viewing a TaskCard with status "completed"
  THEN no action buttons are displayed
  AND the card is read-only
```

---

## Feature: Task Approval/Rejection

### AC-APPROVE-001: Approve via Button

```gherkin
Scenario: Approve task using button
  GIVEN I am viewing a ReviewCard for a task
  AND the task status is "needs-review"
  WHEN I click the "Approve" button
  THEN the task status changes to "completed"
  AND a ConfirmationCard appears with success message
  AND the confirmation shows what was approved
  AND the TaskListCard updates to reflect the change
```

### AC-APPROVE-002: Approve via Chat

```gherkin
Scenario: Approve task using natural language
  GIVEN the AI just showed me a ReviewCard
  AND the task is in context
  WHEN I say "Approve" or "Looks good" or "Yes"
  THEN the most recent pending review is approved
  AND confirmation is shown

Scenario: Approve ambiguous context
  GIVEN multiple tasks are in "needs-review" status
  AND no specific task is in context
  WHEN I say "Approve"
  THEN the AI asks "Which task would you like to approve?"
  AND lists the pending reviews
```

### AC-REJECT-001: Reject via Button

```gherkin
Scenario: Reject task using button
  GIVEN I am viewing a ReviewCard for a task
  AND the task status is "needs-review"
  WHEN I click the "Reject" button
  THEN the task status changes to "pending"
  AND a ConfirmationCard appears indicating rejection
  AND the task is no longer in pending reviews
```

### AC-REJECT-002: Reject via Chat

```gherkin
Scenario: Reject task using natural language
  GIVEN the AI just showed me a ReviewCard
  WHEN I say "Reject" or "Cancel" or "No, don't do that"
  THEN the task is rejected
  AND confirmation is shown
```

### AC-COMPLETE-001: Mark Task Complete via Chat

```gherkin
Scenario: Complete task using natural language
  GIVEN there is a task titled "Call Johnson about portfolio"
  WHEN I say "Mark the Johnson call as done"
  THEN the AI identifies the correct task
  AND the task status changes to "completed"
  AND a ConfirmationCard shows success

Scenario: Complete task - not found
  GIVEN there is no task matching "Smith meeting"
  WHEN I say "Mark the Smith meeting as done"
  THEN the AI responds "I couldn't find a task matching 'Smith meeting'"
  AND suggests checking my task list
```

---

## Feature: Client Information

### AC-CLIENT-001: View Client Profile

```gherkin
Scenario: Request client information
  GIVEN there is a client named "Sarah Chen"
  WHEN I ask "Tell me about Sarah Chen"
  THEN the AI responds with a ClientCard
  AND the card displays:
    | Field | Value |
    | Name | Sarah Chen |
    | Email | sarah.chen@example.com |
    | Phone | (416) 555-1234 |
    | Portfolio Value | $1,250,000 (CAD formatted) |
    | Risk Profile | Moderate (badge) |
    | Last Contact | "2 days ago" (relative) |
```

### AC-CLIENT-002: Client Not Found

```gherkin
Scenario: Request non-existent client
  GIVEN there is no client named "John Doe"
  WHEN I ask "Tell me about John Doe"
  THEN the AI responds "I couldn't find a client named 'John Doe'"
  AND suggests checking the spelling or listing clients
```

### AC-CLIENT-003: Client Name Variations

```gherkin
Scenario: Fuzzy name matching
  GIVEN there is a client named "Sarah Chen"
  WHEN I ask "Tell me about Sara Chen" (missing 'h')
  THEN the AI still finds and displays Sarah Chen
  OR asks "Did you mean Sarah Chen?"
```

### AC-CLIENT-004: Client Tasks Link

```gherkin
Scenario: View client's tasks from ClientCard
  GIVEN I am viewing a ClientCard for Sarah Chen
  AND Sarah has 3 associated tasks
  WHEN I click "Show tasks for this client"
  THEN a TaskListCard appears filtered to Sarah's tasks
  AND all 3 tasks are displayed
```

---

## Feature: Review Card

### AC-REVIEW-001: Review Card Display

```gherkin
Scenario: Ciri-completed task review
  GIVEN a task has been auto-completed by Ciri
  AND the status is "needs-review"
  WHEN the ReviewCard is displayed
  THEN I see:
    | Element | Displayed |
    | Ciri indicator | "Ciri Completed" badge |
    | Action summary | What Ciri did |
    | Client name | Associated client |
    | Timestamp | When Ciri completed |
    | Approve button | Prominently displayed |
    | Reject button | Prominently displayed |
```

### AC-REVIEW-002: Review Card Details Expansion

```gherkin
Scenario: View full details of AI work
  GIVEN I am viewing a ReviewCard
  AND the AI drafted an email
  WHEN I click "View Details"
  THEN the card expands to show the full email content
  AND I can read the entire draft
  AND I can still Approve or Reject
```

---

## Feature: Confirmation Card

### AC-CONFIRM-001: Success Confirmation

```gherkin
Scenario: Action success feedback
  GIVEN I have just approved a task
  WHEN the action completes successfully
  THEN a ConfirmationCard appears
  AND it shows a green checkmark icon
  AND the message confirms what was done
  AND it includes the task/client name
```

### AC-CONFIRM-002: Error Confirmation

```gherkin
Scenario: Action failure feedback
  GIVEN I have just tried to approve a task
  WHEN the action fails (e.g., already completed)
  THEN a ConfirmationCard appears
  AND it shows a red X icon
  AND the message explains what went wrong
  AND it suggests how to proceed
```

### AC-CONFIRM-003: Undo Action

```gherkin
Scenario: Undo a reversible action
  GIVEN I have just approved a task
  AND the ConfirmationCard shows an Undo button
  WHEN I click "Undo"
  THEN the task status reverts to "needs-review"
  AND a new ConfirmationCard shows the undo was successful
```

---

## Feature: Mobile Responsiveness

### AC-MOBILE-001: Mobile Layout

```gherkin
Scenario: View on mobile device
  GIVEN I am using a mobile device (width < 768px)
  WHEN I view the chat interface
  THEN the layout is single-column
  AND all content is visible without horizontal scrolling
  AND cards stack vertically
  AND buttons are full-width
```

### AC-MOBILE-002: Mobile Input Experience

```gherkin
Scenario: Type message on mobile
  GIVEN I am using a mobile device
  WHEN I tap the input field
  THEN the keyboard appears
  AND the input field remains visible above the keyboard
  AND I can see my typed text
  AND the Send button is accessible
```

### AC-MOBILE-003: Touch Targets

```gherkin
Scenario: Tap targets are appropriately sized
  GIVEN I am using a touch device
  WHEN I view any interactive element (button, link, card)
  THEN the tap target is at least 44x44 pixels
  AND there is adequate spacing between targets
```

---

## Feature: Accessibility

### AC-A11Y-001: Keyboard Navigation

```gherkin
Scenario: Navigate by keyboard only
  GIVEN I am not using a mouse
  WHEN I press Tab repeatedly
  THEN focus moves through all interactive elements
  AND focus order is logical (top to bottom, left to right)
  AND focus is visible at all times

Scenario: Activate buttons by keyboard
  GIVEN a button is focused
  WHEN I press Enter or Space
  THEN the button is activated
```

### AC-A11Y-002: Screen Reader Messages

```gherkin
Scenario: New message announced
  GIVEN I am using a screen reader
  WHEN a new AI message appears
  THEN the screen reader announces "New message from AI"
  AND reads the message content

Scenario: Typing indicator announced
  GIVEN I am using a screen reader
  WHEN the typing indicator appears
  THEN the screen reader announces "AI is typing"
```

### AC-A11Y-003: Color Contrast

```gherkin
Scenario: Text meets contrast requirements
  GIVEN any text element in the interface
  WHEN measured against its background
  THEN the contrast ratio is at least 4.5:1 for normal text
  AND at least 3:1 for large text (18px+ or 14px+ bold)
```

---

## Feature: Error Handling

### AC-ERROR-001: Network Disconnection

```gherkin
Scenario: Network goes offline
  GIVEN I am using the application
  WHEN my network connection is lost
  THEN I see a notification "You appear to be offline"
  AND my typed input is preserved
  AND the Send button shows disabled state with "Offline"

Scenario: Network reconnection
  GIVEN I was offline
  WHEN my connection is restored
  THEN the notification updates or dismisses
  AND I can send messages again
```

### AC-ERROR-002: API Error

```gherkin
Scenario: API returns error
  GIVEN I have sent a message
  WHEN the AI API returns a 500 error
  THEN I see a friendly error message "Something went wrong"
  AND I see a "Try again" button
  AND my original message is preserved

Scenario: Rate limit error
  GIVEN I have sent many messages
  WHEN the AI API returns 429 (rate limited)
  THEN I see "Please wait a moment before sending more messages"
  AND I see an approximate wait time
```

### AC-ERROR-003: Retry Functionality

```gherkin
Scenario: Retry failed message
  GIVEN my message failed to send
  AND I see a "Try again" button
  WHEN I click "Try again"
  THEN my original message is resent
  AND the error message is replaced with typing indicator
```

---

## Feature: Session Persistence

### AC-SESSION-001: Page Refresh

```gherkin
Scenario: Messages persist on refresh
  GIVEN I have a conversation with 10 messages
  WHEN I refresh the page
  THEN all 10 messages are restored
  AND the conversation context is maintained
```

### AC-SESSION-002: Session Limit

```gherkin
Scenario: Message limit exceeded
  GIVEN I have 100 messages in the session
  WHEN a new message is added
  THEN the oldest message is removed
  AND the total remains at 100 messages
```

### AC-SESSION-003: Clear Chat

```gherkin
Scenario: User clears chat history
  GIVEN I have messages in the chat
  WHEN I click "Clear Chat" (if available in UI)
  THEN all messages are removed
  AND a fresh welcome message appears
  AND the session storage is cleared
```

---

## Edge Cases and Validation Rules

### EC-001: Rapid Message Sending

```gherkin
Scenario: User tries to send multiple messages rapidly
  GIVEN I have just sent a message
  AND the AI is still responding
  WHEN I try to send another message
  THEN the input is disabled
  AND I must wait for the current response to complete
```

### EC-002: Special Characters in Input

```gherkin
Scenario: Message contains special characters
  GIVEN I type a message with <script>alert('xss')</script>
  WHEN the message is displayed
  THEN the special characters are escaped
  AND no script execution occurs
```

### EC-003: Long Task Names

```gherkin
Scenario: Task with very long name
  GIVEN a task has a 200-character title
  WHEN it is displayed in a TaskListCard
  THEN the title is truncated with ellipsis
  AND the full title is available on hover or expansion
```

### EC-004: Empty Client Portfolio

```gherkin
Scenario: Client has zero portfolio value
  GIVEN a client has $0 portfolio value
  WHEN the ClientCard is displayed
  THEN the portfolio value shows "$0.00"
  AND no error or empty state occurs
```

### EC-005: Same-Day Due Tasks

```gherkin
Scenario: Multiple tasks due at same time
  GIVEN I have 3 tasks all due at 2:00 PM
  WHEN the TaskListCard is displayed
  THEN all 3 tasks are shown
  AND they are sorted by client name as secondary sort
```

---

## Validation Summary

### Pre-Release Checklist

- [ ] All P0 acceptance criteria pass
- [ ] 80%+ of P1 acceptance criteria pass
- [ ] No critical accessibility failures
- [ ] Mobile layout tested on 3 device sizes
- [ ] Error scenarios handled gracefully
- [ ] Session persistence verified

### Test Coverage Requirements

| Feature Area | Minimum Coverage |
|--------------|------------------|
| Chat Interface | 90% |
| Task Management | 85% |
| Client Information | 80% |
| Intent Recognition | 80% |
| Error Handling | 75% |
| Accessibility | 70% |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-04 | spec-analyst | Initial acceptance criteria document |
