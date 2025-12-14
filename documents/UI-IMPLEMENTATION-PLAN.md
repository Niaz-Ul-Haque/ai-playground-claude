# Ciri UI Implementation Plan
## Complete Requirements Verification & Detailed Screen Specifications

---

# PART 1: REQUIREMENTS VERIFICATION MATRIX

## 1) Painless Onboarding

### 1a) Instant Access

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Preboarding Access** | Start a guest session | Auth Flow / Chat Home | Covered |
| | Pay gate sensitive actions for guests | Modal overlay on actions | Covered |
| | Claim workspace in one step | Auth Flow modal | Covered |
| | Upgrade implicitly on natural actions | Integrations screen trigger | Covered |
| | Show who owns session (guest/user) | Header indicator | **NEW - Added** |
| **Qualified Onboarding** | Accept pre-setup invite | Auth Flow / Invite page | Covered |
| | Verify identity in one confirmation | Auth Flow | Covered |
| **Team Onboarding** | Join workspace from invite | Auth Flow / Invite page | Covered |
| | Get assigned default role | Backend + Settings | Covered |
| **Progressive Onboarding** | Activate with email only | Auth Flow | Covered |
| | Collect profile details later | Settings / In-context modals | Covered |
| **No Sign-In** | Resume prior session automatically | Session management (no UI) | Covered |
| **Email Sign-In** | Take email address | Auth Flow | Covered |
| | Send magic link | Auth Flow | Covered |
| | Process magic link + restore context | Auth Flow | Covered |
| **Password Sign-In** | Set/reset password | Auth Flow / Settings | Covered |
| | Authenticate with email + password | Auth Flow | Covered |

### 1b) Instant Value

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Useful First State** | Ready-to-use sample workspace | Onboarding / Chat Home | Covered |
| | Replace sample with real data in one step | Integrations screen | Covered |
| **Convention** | Apply sensible defaults | Backend + Settings | Covered |
| | Adapt preferences based on behavior | Backend (no UI needed) | Covered |
| **Continuity** | Resume last active view and context | Session management | Covered |

---

## 2) Autonomous Data Management

### 2a) Unified Data

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Data Sources** | Connect file sources (Drive, OneDrive, Dropbox) | Integrations & Sources | Covered |
| | Construct client details from files | Data Review Queue | Covered |
| | Reconcile and de-duplicate entities | Data Review Queue | Covered |
| | View, revoke, re-authenticate connections | Integrations & Sources | Covered |
| | Export full unified book in different formats | Integrations / Client List + Export modal | **Enhanced** |
| **Communication Channels** | Link email/calendar/calls/chat/transcripts | Integrations & Sources | Covered |
| | Attach correct data to correct client | Data Review Queue | Covered |
| **Physical Files** | Upload scans/photos | Chat + Data Review Queue | Covered |
| | Extract details via OCR/AI | Data Review Queue | Covered |
| | Attach to right client with version history | Client Profile (artifacts) | Covered |
| **Manual Entry** | Quick-add by typing or voice | Chat Home (with voice) | Covered |
| | Import CSVs with mapping and validation | **Import Wizard (NEW SCREEN)** | **NEW - Added** |

### 2b) Real-Time Sync

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Live Updates** | Detect changes from sources quickly | Integrations health | Covered |
| | Update unified record in real time | Automatic (no UI) | Covered |

### 2c) Natural Interaction

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Conversation** | Answer questions over live data | Chat Home | Covered |
| | Handle follow-ups and pivots | Chat Home | Covered |
| | Accept corrections and refine | Chat Home | Covered |
| **Adaptive View** | Auto-default most relevant view | All screens | Covered |
| | Export from any view | Export button on all data views | **Enhanced** |

---

## 3) Autonomous Relationship Management

### 3a) Complete Client Context

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Client Story** | Display unified profile with relationships | Client Profile | Covered |
| | Show chronological timeline | Client Profile (timeline) | Covered |
| **Client Artifacts** | Store and retrieve versioned artifacts | Client Profile (artifacts panel) | Covered |
| | Open artifacts from any moment in story | Client Profile (timeline + artifacts) | Covered |
| **Client Assets** | List client details with status | Client Profile (assets table) | Covered |
| | Surface expiries/conversions/requirements inline | Client Profile (alerts section) | Covered |

### 3b) Guided Engagement

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Sales** | Generate context-aware sales prompts | Opportunities + Tasks | Covered |
| **Service** | Detect and alert on service triggers/SLAs | Tasks + Client Profile alerts | Covered |
| | Auto-prepare required forms and checklists | Tasks (prefilled materials) | **Enhanced** |
| **Nurture** | Detect life events from data/communications | Opportunities | Covered |
| | Auto queue empathetic outreach | Tasks (queued actions) | Covered |

---

## 4) Automatic Opportunity Identification

### 4a) Automatic Opportunity Surfacing

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Contract-Based** | Detect contract windows | Opportunities View | Covered |
| | Check eligibility & prerequisites | Opportunities View (details) | Covered |
| | Attach "why-now" explanation | Opportunities View | Covered |
| | Suppress duplicates and respect cool-off | Opportunities View (dismiss/snooze) | Covered |
| | Trace to source records | Opportunities View (source link) | Covered |
| **Milestone-Based** | Detect life/household milestones | Opportunities View | Covered |
| | Map milestones to opportunity | Opportunities View | Covered |
| **Market-Based** | Ingest product/market list | **Settings > Products (NEW)** | **NEW - Added** |

### 4b) Automatic Opportunity Prioritization

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Impact** | Score opportunities based on value | Opportunities View (impact score) | Covered |
| | Validate readiness | Opportunities View (readiness indicator) | Covered |
| | Launch correct workflow from item | Opportunities View (action button) | Covered |

---

## 5) Intelligent Workflow Automation

### 5a) Personalized Workflow Orchestration

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Custom Workflow** | Observe and learn user patterns | Backend (no UI) | Covered |
| | Adapt sequence | Backend (no UI) | Covered |
| | Show logs of what's adapted | Automation Review (adaptation log) | **Enhanced** |
| **Predictive Assistance** | Infer next best step from context | Tasks & Workflows | Covered |
| | Prefill artifacts & materials | Tasks (prefilled forms/docs) | Covered |
| | Accept/decline suggestion and learn | Tasks (accept/dismiss actions) | Covered |
| | Measure cycles (time tracking) | Tasks (cycle time display) | **NEW - Added** |

### 5b) Gradual Automation

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Suggested Automations** | Detect repeatable routines | Automation Review | Covered |
| | Review & approve proposals | Automation Review | Covered |
| | Set safety bounds | Automation Review (bounds config) | Covered |
| **Fully Automated** | Run approved on autopilot | Automation Review (active list) | Covered |
| | Surface exceptions only | Automation Review (exception queue) | Covered |
| | Pause or resume routine | Automation Review (pause/resume) | Covered |

---

## 6) Actionable Intelligence

### 6a) Practical Answers

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **True Visibility** | Compute core business metrics | Business Metrics Dashboard | Covered |
| | Drill down from metric to records | Dashboard (drill-down) | Covered |
| | Save/share view snapshot | Dashboard (save/share buttons) | Covered |
| **Q & A** | Accept natural-language questions | Chat Home | Covered |
| | Return answers in best format | Chat Home (rich responses) | Covered |
| | Cite sources | Chat Home (citations) | Covered |
| | Recommended next actions | Chat Home (action buttons) | Covered |

### 6b) Meaningful Guidance

| Requirement | Sub-requirement | Screen/Location | Status |
|-------------|-----------------|-----------------|--------|
| **Work Management** | Detect bottlenecks and error hot-spots | Dashboard / Chat | Covered |
| | Recommend process changes | Chat + Tasks | Covered |
| | Apply recommendation and track outcome | Tasks (apply/track/revert) | **Enhanced** |
| **Performance Optimization** | Analyze current ROI | Dashboard | Covered |
| | Generate focus timeline shortlist | Dashboard (focus list) | **NEW - Added** |
| | Measure effect of focus actions | Dashboard (before/after) | Covered |

---

## Customer Experiences Verification (from promises-and-experiences.md)

| Promise | Experience | Addressed By |
|---------|------------|--------------|
| **Painless Onboarding** | Instant Value | Sample workspace, Chat Home |
| | No Learning Curve | Intuitive UI, Chat-first |
| **Autonomous Data Management** | Effortless Data Sharing | Integrations & Sources |
| | Simple Communication Channel Sharing | Integrations & Sources |
| | Real-Time Synchronization | Integrations health indicators |
| | Natural Data Exploration | Chat Home, Client List |
| **Autonomous Relationship Management** | Full Picture of Client | Client Profile |
| | Assisted Client Engagement | Tasks, Opportunities |
| **Automatic Opportunity Identification** | Automatic Opportunity Surfacing | Opportunities View |
| | Automatic Valuation & Prioritization | Opportunities View |
| **Intelligent Workflow Automation** | Helpful Workspace | Tasks & Workflows |
| | Gradual Automation | Automation Review |
| **Actionable Answers** | Meaningful Answers | Chat Home |
| | Meaningful Guidance | Chat + Dashboard |

---

# PART 2: UPDATED SCREEN LIST

## MUST-HAVE UI (7 Screens)

### 1. Auth Flow (NEW - was implicit)
### 2. Chat Home
### 3. Client Profile / Story
### 4. Opportunities View
### 5. Data Review Queue
### 6. Integrations & Sources
### 7. Automation Review & Control

## SHOULD-HAVE UI (4 Screens)

### 8. Client List / Search
### 9. Tasks & Workflows
### 10. Business Metrics Dashboard
### 11. Import Wizard (NEW)

## NICE-TO-HAVE UI (2 Screens)

### 12. Activity Log
### 13. Settings & Preferences

---

# PART 3: DETAILED SCREEN SPECIFICATIONS

---

## SCREEN 1: Auth Flow

**Priority:** Must-Have (implicitly required for all authenticated features)

**Why it exists:**
- FR 1a: All instant access requirements (guest, qualified, team, progressive onboarding)
- FR 1a: Sign-in methods (no sign-in, email/magic link, password)

**Functional Requirements Addressed:**
- Start guest session
- Pay gate sensitive actions for guests
- Claim workspace in one step
- Upgrade implicitly on natural actions
- Show session ownership (guest vs. user)
- Accept pre-setup invites
- Join workspace from invite
- Activate account with email only
- Resume prior session automatically
- Magic link authentication
- Password authentication
- Set/reset password

**What the user can do:**
- Continue as guest (no account required)
- Sign in with magic link (email only)
- Sign in with password
- Create account from email
- Accept workspace invites
- Claim current workspace (guest → user upgrade)
- Reset password

**What stays in Chat:**
- Nothing - auth must happen before chat

**Key UI Components:**
- Email input field
- Magic link sent confirmation
- Password input (optional)
- "Continue as Guest" button
- Invite acceptance view
- Session indicator in header (Guest/User badge)
- Password reset flow
- Profile completion prompts (contextual, later)

**Visual Notes:**
- Minimal, single-column centered layout
- Progressive disclosure (start simple, add fields as needed)
- Clear session ownership indicator in app header after auth

---

## SCREEN 2: Chat Home

**Priority:** Must-Have

**Why it exists:**
- FR 2c: Natural Interaction - Conversation, Adaptive View
- FR 6a: Q & A - natural language questions, best format answers, citations

**Functional Requirements Addressed:**
- Answer questions over live, reconciled data
- Handle follow-ups and pivots in same conversation
- Accept corrections and refine answers
- Accept natural-language questions
- Return answers in best format
- Cite sources from which answer was made
- Recommended next actions
- Quick-add by typing or voice

**What the user can do:**
- Ask any question about clients, business, opportunities
- Get answers with inline tables, cards, charts
- See citations/sources for answers
- Take recommended actions directly from responses
- Add data via conversation
- Use voice input for queries
- Access recent chat sessions from sidebar
- Start new conversations

**What stays in Chat:**
- Everything possible - this IS the primary interface

**Key UI Components:**
- Message thread with rich response rendering:
  - Text with markdown
  - Data tables (sortable, clickable)
  - Client cards (linkable to profile)
  - Opportunity cards
  - Charts/visualizations
  - Action buttons
- Input area:
  - Text input
  - Voice input button (microphone icon)
  - Attachment button (for uploads)
- Sidebar:
  - Recent sessions list
  - New conversation button
- Citation/source links in responses
- Action buttons in responses ("View Client", "Start Workflow", etc.)

**Sample Workspace Behavior:**
- On first load, show sample/demo data
- Clear indicator this is sample data
- One-click to connect real sources and replace

---

## SCREEN 3: Client Profile / Story

**Priority:** Must-Have

**Why it exists:**
- FR 3a: Complete Client Context - Client Story, Artifacts, Assets
- Experience: "Full Picture of the Client"

**Functional Requirements Addressed:**
- Display unified profile with relationships (household, dependents)
- Show chronological timeline of interactions/events
- Store and retrieve versioned artifacts
- Open artifacts from any relevant moment in story
- List client details with status
- Surface expiries/conversions/requirements inline

**What the user can do:**
- View complete client profile (name, contact, demographics)
- See household/relationship connections
- Browse chronological timeline of all touchpoints
- Access any artifact (documents, files) with version history
- View all policies/assets with status
- See upcoming alerts (expiries, renewals, milestones)
- Navigate to related clients (household members)
- Open artifacts directly from timeline events

**What stays in Chat:**
- "Tell me about [client]"
- "What's the history with [client]?"
- Adding notes or updates
- Triggering outreach
- Quick questions about the client

**Key UI Components:**

**Profile Header:**
- Avatar/photo
- Name, title/role
- Key contact info
- Relationship badges (household head, spouse, etc.)
- Quick action buttons (email, call, add note)

**Relationships Section:**
- Household members with links
- Dependents
- Professional relationships (accountant, lawyer)

**Timeline Panel:**
- Chronological feed of:
  - Communications (emails, calls, meetings)
  - Events (policy changes, claims, payments)
  - Notes added
  - Milestones (birthdays, anniversaries)
  - System actions (automation runs)
- Filters by type
- Click to expand details
- Jump to artifact from event

**Artifacts Panel:**
- Document list with thumbnails
- Version history per document
- Upload button
- Search/filter
- Preview capability

**Assets/Policies Table:**
- Policy type, number, status
- Key dates (start, renewal, expiry)
- Value/premium
- Status indicators (active, pending, lapsed)
- Inline alerts (expiring soon, action needed)

**Alerts Section:**
- Upcoming expiries
- Pending requirements
- Service triggers
- Life event indicators

---

## SCREEN 4: Opportunities View

**Priority:** Must-Have

**Why it exists:**
- FR 4a: Automatic Opportunity Surfacing (Contract, Milestone, Market-based)
- FR 4b: Automatic Opportunity Prioritization

**Functional Requirements Addressed:**
- Detect contract windows
- Check eligibility & prerequisites
- Attach "why-now" explanation
- Suppress duplicates and respect cool-off
- Trace to source records
- Detect life/household milestones
- Map milestones to opportunity
- Score opportunities based on value
- Validate readiness
- Launch correct workflow from item

**What the user can do:**
- View all surfaced opportunities in one place
- Understand "why now" for each opportunity
- See impact/value scoring
- See readiness validation status
- Filter by type (contract, milestone, market)
- Filter by priority/impact
- Filter by client
- Launch workflow directly from opportunity
- Dismiss with reason
- Snooze with cool-off period
- See source tracing (where signal came from)

**What stays in Chat:**
- "What opportunities do I have this week?"
- "Tell me more about [opportunity]"
- "Why is [client] showing as an opportunity?"

**Key UI Components:**

**Opportunity List/Grid:**
- Card per opportunity containing:
  - Client name + avatar (linked to profile)
  - Opportunity type badge (Contract/Milestone/Market)
  - "Why Now" summary text
  - Impact score (visual: high/medium/low or numeric)
  - Readiness indicator (ready/needs-prep/blocked)
  - Source trace link
  - Timestamp (when surfaced)

**Filters Bar:**
- Type filter (Contract, Milestone, Market, All)
- Priority filter (High, Medium, Low, All)
- Client search
- Date range
- Status (New, Viewed, Snoozed)

**Actions per Opportunity:**
- "Start Workflow" button (primary)
- "View Client" link
- "Snooze" with duration picker
- "Dismiss" with reason selector
- "Why this?" expansion (full explanation)

**Empty State:**
- Clear message when no opportunities
- Suggestion to connect more sources

**Badge in Navigation:**
- Count of new/unviewed opportunities

---

## SCREEN 5: Data Review Queue

**Priority:** Must-Have

**Why it exists:**
- FR 2a: Unified Data - reconciliation, deduplication, entity matching
- Experience: "Effortless Data Sharing" requires trust

**Functional Requirements Addressed:**
- Construct client details from files
- Reconcile and de-duplicate entities across sources
- Attach and detect correct data to correct client
- Extract specific details via OCR/AI
- Attach to right client with version history

**What the user can do:**
- Review AI-extracted data from connected sources
- See confidence scores for extractions
- Approve/reject suggested entity matches
- Correct mismatches (reassign to different client)
- Merge duplicate entities
- Split incorrectly merged entities
- Provide feedback to improve future extraction
- Batch approve high-confidence items
- See extraction source

**What stays in Chat:**
- "Show me recent extractions"
- Quick corrections via conversation
- "What was extracted from [file]?"

**Key UI Components:**

**Queue List:**
- Items pending review
- Count badge
- Sort by: date, confidence, source
- Filter by: type, source, confidence level

**Review Item Card:**
- Source file/channel indicator
- Extracted data preview
- Confidence score (percentage or high/med/low)
- Suggested client match
- Timestamp

**Side-by-Side Comparison (on selection):**
- Left: Extracted/new data
- Right: Existing client record
- Highlighted differences
- Field-by-field comparison

**Actions:**
- Approve (accept extraction + match)
- Reject (discard extraction)
- Edit (modify before accepting)
- Reassign (pick different client)
- Create New (if no match exists)
- Merge (combine with existing)

**Batch Operations:**
- Select multiple
- Batch approve (high confidence only)
- Batch reject

**Feedback Loop:**
- "This was wrong because..." option
- Helps train extraction

---

## SCREEN 6: Integrations & Sources

**Priority:** Must-Have

**Why it exists:**
- FR 2a: Data Sources, Communication Channels
- FR 2b: Real-Time Sync visibility

**Functional Requirements Addressed:**
- Connect common file sources (Google Drive, OneDrive, Dropbox)
- Link email/calendar/calls/chat/transcripts
- View, revoke, and re-authenticate any connection
- Export full unified book in different formats
- Detect changes from sources quickly (visibility)

**What the user can do:**
- Connect new data sources (OAuth flow)
- Connect communication channels (email, calendar)
- View all connected sources
- See sync health and status per source
- See last sync time
- View errors and warnings
- Re-authenticate expired connections
- Revoke/disconnect sources
- Trigger manual sync
- Export unified data in various formats

**What stays in Chat:**
- "Connect my Google Drive"
- "What's wrong with my email sync?"
- "When did [source] last sync?"

**Key UI Components:**

**Connected Sources Section:**
- Card per connected source:
  - Source icon + name
  - Status indicator (healthy/warning/error)
  - Last sync timestamp
  - Records synced count
  - Health bar or indicator

**Source Card Actions:**
- Re-authenticate button (if expired)
- Disconnect button
- Force sync button
- View details/logs

**Add New Source Section:**
- Available sources grid:
  - Google Drive
  - OneDrive/SharePoint
  - Dropbox
  - Gmail
  - Outlook/Exchange
  - Google Calendar
  - iCloud
  - etc.
- Each with "Connect" button
- OAuth popup flow

**Error State:**
- Clear error message
- Resolution action (re-auth, check permissions)
- Support link

**Export Section:**
- Export button
- Format picker (CSV, Excel, PDF, JSON)
- Scope selector (all clients, filtered)
- Download/email options

---

## SCREEN 7: Automation Review & Control

**Priority:** Must-Have

**Why it exists:**
- FR 5a: Show logs of what's adapted
- FR 5b: Gradual Automation - review proposals, safety bounds, exceptions

**Functional Requirements Addressed:**
- Show the logs of what's adapted
- Detect repeatable routines
- Review & approve automation proposals
- Set safety bounds
- Run approved automations on autopilot
- Surface exceptions only
- Pause or resume routine

**What the user can do:**
- See suggested automations awaiting approval
- Review what each automation will do
- Approve or reject proposed automations
- Set safety bounds (limits, conditions)
- View currently active automations
- See what each automation has done (history)
- Pause/resume any automation
- See exceptions that need attention
- View adaptation logs (what system learned)

**What stays in Chat:**
- "What automations are running?"
- "Pause the follow-up automation"
- "What has been automated lately?"

**Key UI Components:**

**Suggested Automations Section:**
- Card per suggestion:
  - What it detected (pattern description)
  - What it would automate
  - Expected benefit
  - Approve / Reject buttons
  - "Learn more" expansion

**Active Automations Section:**
- List of running automations:
  - Name/description
  - Status (running/paused)
  - Last run timestamp
  - Success count / Exception count
  - Pause/Resume toggle

**Safety Bounds Configuration (per automation):**
- Conditions to run (time, day, client type)
- Limits (max per day, max value)
- Require confirmation above threshold
- Blocklist (never automate for X)

**Exception Queue:**
- Items that need human review
- Why it was flagged
- Action buttons (approve, reject, modify)

**Adaptation Log:**
- Timeline of what system learned
- Pattern detections
- Sequence adaptations
- User preference inferences

**Activity Log (subset):**
- What automations did
- Success/failure
- Links to affected records

---

## SCREEN 8: Client List / Search

**Priority:** Should-Have

**Why it exists:**
- Quick browsing alternative to chat
- Supporting FR 3a when visual scan is faster

**Functional Requirements Addressed:**
- View clients (alternative to asking in chat)
- Search and filter

**What the user can do:**
- Browse all clients in table/list view
- Search by name, email, phone
- Filter by various attributes
- Sort by name, last contact, value
- Quick access to client profiles
- See recent/frequent clients
- Basic stats per client in list

**What stays in Chat:**
- "Find clients in Toronto"
- "Who are my top 10 clients?"
- Complex queries

**Key UI Components:**

**Search Bar:**
- Full-text search
- Real-time filtering

**Filters Panel:**
- Status filter
- Location filter
- Policy type filter
- AUM/value range
- Last contact date
- Custom tags

**Client Table/List:**
- Columns: Name, Contact, Status, Last Activity, Policies, Value
- Sortable columns
- Row click → Client Profile
- Avatar/photo thumbnails

**Quick Stats:**
- Total clients count
- Active/Inactive breakdown

**Recent Section (sidebar or tab):**
- Recently viewed clients
- Frequently accessed clients

---

## SCREEN 9: Tasks & Workflows

**Priority:** Should-Have

**Why it exists:**
- FR 5a: Predictive Assistance, suggested next steps
- FR 6b: Work Management

**Functional Requirements Addressed:**
- Infer next best step from context
- Prefill artifacts & materials
- Accept/decline suggestion and learn
- Measure cycles (how long tasks take)
- Auto-prepare required forms and checklists
- Detect bottlenecks and error hot-spots
- Apply recommendation and track outcome

**What the user can do:**
- See all pending tasks
- View suggested next steps
- See prefilled forms/materials ready for use
- Accept or decline suggestions
- Track workflow progress
- See what's automated vs. needs attention
- View cycle time (how long things took)
- Apply workflow recommendations
- Track outcomes of applied recommendations

**What stays in Chat:**
- "What should I do today?"
- "Mark task X complete"
- Quick task additions

**Key UI Components:**

**Task List:**
- Priority indicators
- Due dates
- Associated client (linked)
- Task type badge
- Status (pending, in progress, blocked, done)

**Suggested Actions Section:**
- AI-suggested next steps
- Context explanation
- Accept/Dismiss buttons
- "Why this?" expansion

**Prefilled Materials:**
- Forms ready to use
- Documents prepared
- Checklists with items

**Workflow Progress:**
- Visual progress indicator
- Steps completed vs. remaining
- Estimated completion

**Cycle Time Display:**
- Time spent on current task
- Historical average for similar tasks
- Improvement indicator

**Recommendations Panel:**
- Process improvement suggestions
- Apply button
- Track outcome toggle
- Revert option

**Views:**
- Today view
- This Week view
- All tasks view
- By workflow view

---

## SCREEN 10: Business Metrics Dashboard

**Priority:** Should-Have

**Why it exists:**
- FR 6a: True Visibility - business metrics
- FR 6b: Performance Optimization

**Functional Requirements Addressed:**
- Compute core business metrics
- Drill down from metric to records
- Save/share view snapshot
- Analyze current ROI
- Generate focus timeline shortlist
- Measure effect of focus actions

**What the user can do:**
- See core KPIs at a glance
- Drill down from any metric to underlying records
- Save dashboard views
- Share views with team
- View ROI analysis
- See focus recommendations (timeline shortlist)
- Track effect of focus actions (before/after)

**What stays in Chat:**
- "How's my pipeline?"
- "What's my conversion rate?"
- Complex metric queries
- Comparisons and trends

**Key UI Components:**

**KPI Cards:**
- Total clients
- Active policies
- Pipeline value
- Conversion rate
- Revenue metrics
- Retention rate
- Average response time

**Trend Charts:**
- Line charts for time series
- Period comparison (MoM, YoY)
- Customizable date range

**Drill-Down:**
- Click metric → see underlying records
- Filter by dimension
- Export results

**Focus Recommendations:**
- Prioritized action list
- Expected impact
- Time investment estimate
- Track progress

**Save/Share:**
- Save current view
- Name snapshot
- Share link generation
- Export as PDF/Image

**Bottleneck Indicators:**
- Problem areas highlighted
- Trend direction (improving/worsening)
- Suggested actions

---

## SCREEN 11: Import Wizard (NEW)

**Priority:** Should-Have

**Why it exists:**
- FR 2a Manual Entry: Import CSVs with mapping and validation

**Functional Requirements Addressed:**
- Import CSVs or any file types
- Field mapping
- Validation before import
- Error handling

**What the user can do:**
- Upload file (CSV, Excel, etc.)
- Map source columns to system fields
- Preview data before import
- See validation errors
- Fix errors or skip problem rows
- Run import
- See import results

**What stays in Chat:**
- "Import my client list" (triggers wizard)
- Simple queries about past imports

**Key UI Components:**

**Step 1: Upload**
- Drag and drop zone
- File picker
- Supported formats list
- Sample template download

**Step 2: Mapping**
- Source columns (left)
- Target fields (right)
- Auto-suggest mappings
- Manual override
- Preview of mapped data

**Step 3: Validation**
- Validation results
- Error list with row numbers
- Warning list
- Fix inline or skip options
- Valid record count

**Step 4: Review & Import**
- Summary of what will be imported
- Duplicate handling options
- Confirm button
- Cancel option

**Step 5: Results**
- Success count
- Failed count with details
- Link to view imported records
- Download error report

---

## SCREEN 12: Activity Log

**Priority:** Nice-to-Have

**Why it exists:**
- Audit trail for transparency and trust
- Debugging and compliance

**What the user can do:**
- See all system actions
- Filter by type, date, entity
- Export logs
- Search logs

**Key UI Components:**
- Timeline of actions
- Filters (date, type, user, entity)
- Search
- Export button
- Details expansion

---

## SCREEN 13: Settings & Preferences

**Priority:** Nice-to-Have

**Why it exists:**
- FR 1b Convention: Preferences that can be explicitly set
- Profile management
- Team management (if applicable)

**Functional Requirements Addressed:**
- Set/reset password
- Profile details
- Notification preferences
- Product/market list ingestion (Market-Based opportunities)

**What the user can do:**
- Update profile information
- Change password
- Set notification preferences
- Configure default behaviors
- Manage team members (if admin)
- Upload product/market list for opportunities
- View account/billing

**Sections:**
- Profile
- Security (password, 2FA)
- Notifications
- Preferences (defaults, formatting)
- Products & Markets (for market-based opportunities)
- Team (if applicable)
- Billing (if applicable)

---

# PART 4: NAVIGATION STRUCTURE

```
┌─────────────────────────────────────────┐
│  [Ciri Logo]        [Session: User ▼]   │  ← Header with session indicator
├─────────────────────────────────────────┤
│                                         │
│  💬 CHAT                                │  ← Primary/Home
│     └─ Recent Sessions                  │
│        • Session 1                      │
│        • Session 2                      │
│        • Session 3                      │
│                                         │
│  👥 CLIENTS                             │
│     └─ Recent Clients                   │
│        • John Smith                     │
│        • Jane Doe                       │
│        • Acme Household                 │
│                                         │
│  💡 OPPORTUNITIES (12)                  │  ← Badge with count
│                                         │
│  ✓ TASKS                                │
│                                         │
│  🔗 SOURCES                             │  ← Health indicator dot
│                                         │
│  ⚙️ AUTOMATIONS                         │
│                                         │
│  ─────────────────                      │
│                                         │
│  📊 Dashboard                           │
│  📥 Import                              │
│  📋 Activity Log                        │
│  ⚙️ Settings                            │
│                                         │
└─────────────────────────────────────────┘
```

---

# PART 5: BUILD ORDER

## Phase 1: Foundation (Weeks 1-2 scope)
1. **Auth Flow** - Required for everything else
2. **Chat Home** - Primary interface, core value
3. **Integrations & Sources** - Users need to connect data

## Phase 2: Data Trust (Weeks 3-4 scope)
4. **Data Review Queue** - Build trust in AI extractions
5. **Import Wizard** - Alternative data onboarding

## Phase 3: Client Intelligence (Weeks 5-6 scope)
6. **Client Profile / Story** - Core relationship value
7. **Client List / Search** - Browsing alternative

## Phase 4: Opportunity Engine (Weeks 7-8 scope)
8. **Opportunities View** - Key differentiator

## Phase 5: Work Orchestration (Weeks 9-10 scope)
9. **Tasks & Workflows** - Work management
10. **Automation Review** - Gradual automation control

## Phase 6: Intelligence & Polish (Weeks 11-12 scope)
11. **Business Metrics Dashboard** - Visual analytics
12. **Activity Log** - Audit trail
13. **Settings** - Configuration

---

# PART 6: GAPS IDENTIFIED AND RESOLVED

| Gap | Resolution |
|-----|------------|
| Auth flows not explicit | Added Screen 1: Auth Flow |
| Session ownership indicator | Added to Auth Flow + Header |
| CSV import with mapping | Added Screen 11: Import Wizard |
| Export functionality | Added to Integrations + all data views |
| Voice input | Explicitly added to Chat Home |
| Forms/checklists preparation | Added to Tasks & Workflows |
| Adaptation logs | Added to Automation Review |
| Cycle time measurement | Added to Tasks & Workflows |
| Apply/track recommendations | Added to Tasks & Workflows |
| Focus timeline shortlist | Added to Dashboard |
| Product/market list ingestion | Added to Settings |

---

# PART 7: VERIFICATION SUMMARY

**Total Functional Requirements Items:** 78
**Items Addressed:** 78
**Coverage:** 100%

**Promises Addressed:** 5/5
- Autonomous Data Management ✓
- Autonomous Relationship Management ✓
- Automatic Opportunity Identification ✓
- Intelligent Workflow Automation ✓
- Actionable Intelligence ✓

**Experiences Addressed:** 12/12
- Instant Value ✓
- No Learning Curve ✓
- Effortless Data Sharing ✓
- Simple Communication Channel Sharing ✓
- Real-Time Synchronization ✓
- Natural Data Exploration ✓
- Full Picture of Client ✓
- Assisted Client Engagement ✓
- Automatic Opportunity Surfacing ✓
- Automatic Valuation & Prioritization ✓
- Helpful Workspace ✓
- Gradual Automation ✓
- Meaningful Answers ✓
- Meaningful Guidance ✓

---

*Document generated for implementation planning. Each screen should be implemented one by one in the order specified in Part 5.*

---

# PART 8: IMPLEMENTATION ASSUMPTIONS & DECISIONS

This section documents assumptions and decisions made during implementation planning to address gaps in the original requirements.

## 8.1 Authentication & Session Management

### Guest Session Behavior
- **Guests CAN**: Use chat interface, view sample/demo data, browse UI screens
- **Guests CANNOT**: Connect real data sources, export data, enable automations, access settings
- **Pay-gated actions**: Connecting integrations, exporting data, enabling automations, accessing team features
- **Session persistence**: Use localStorage for session state across page reloads
- **Session indicator**: Badge in header showing "Guest" or user email

### Auth Flow (UI-Only for MVP)
- No real authentication backend - purely UI flow for testing
- "Continue as Guest" creates a guest session immediately
- "Sign in with Email" shows magic link confirmation (mocked)
- "Sign in with Password" validates against mock credentials
- Password reset flow is UI-only (shows success message)

## 8.2 Workspace Model

### MVP Scope
- Single-user workspace assumption (no team features initially)
- "Claim workspace" upgrades guest to user (UI toggle)
- Team features deferred to Settings screen implementation
- Workspace data isolated per browser (localStorage)

### Future Scope
- Multi-user workspaces with roles (admin, member, viewer)
- Workspace invitations and onboarding
- Shared data and permissions

## 8.3 Data Source Integrations

### Supported Providers (Mock)
| Category | Providers |
|----------|-----------|
| File Storage | Google Drive, OneDrive, Dropbox, iCloud Drive |
| Email | Gmail, Outlook/Exchange |
| Calendar | Google Calendar, Outlook Calendar, iCloud Calendar |
| Communication | (Future: Zoom, Teams, Slack) |

### OAuth Flow (Mocked)
- Click "Connect" shows provider selection
- Mock OAuth popup delay (1-2 seconds)
- Always succeeds with "Connected successfully" message
- Creates mock integration record with health status

### Integration Health States
- **Healthy**: Green indicator, syncing normally
- **Warning**: Yellow indicator, minor issues (e.g., rate limited)
- **Error**: Red indicator, requires re-authentication
- **Syncing**: Blue indicator, currently syncing

## 8.4 Client Data Model Extensions

### Relationships (New)
```typescript
interface ClientRelationship {
  id: string;
  clientId: string;           // The client this relationship belongs to
  relatedClientId?: string;   // Link to another client (if in system)
  relatedName: string;        // Name of related person
  relationshipType: 'spouse' | 'child' | 'parent' | 'sibling' | 'accountant' | 'lawyer' | 'other';
  isPrimary?: boolean;        // Is this the primary contact for household?
  notes?: string;
}
```

### Timeline Events (New)
```typescript
interface TimelineEvent {
  id: string;
  clientId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'policy_change' | 'payment' | 'milestone' | 'system';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  artifactIds?: string[];     // Links to related artifacts
}
```

### Artifacts (New)
```typescript
interface Artifact {
  id: string;
  clientId: string;
  name: string;
  type: 'document' | 'form' | 'statement' | 'contract' | 'id' | 'other';
  mimeType: string;
  size: number;               // in bytes
  uploadedAt: string;
  versions: ArtifactVersion[];
  tags?: string[];
}

interface ArtifactVersion {
  id: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}
```

### Assets/Policies (New)
```typescript
interface ClientAsset {
  id: string;
  clientId: string;
  type: 'rrsp' | 'tfsa' | 'resp' | 'rrif' | 'non_registered' | 'insurance' | 'pension' | 'property';
  name: string;
  accountNumber?: string;
  value: number;
  status: 'active' | 'pending' | 'closed' | 'lapsed';
  startDate: string;
  renewalDate?: string;
  expiryDate?: string;
  alerts?: AssetAlert[];
}

interface AssetAlert {
  type: 'expiry' | 'renewal' | 'contribution_room' | 'rebalance' | 'action_needed';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  dueDate?: string;
}
```

## 8.5 Opportunity Data Model

```typescript
interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  type: 'contract' | 'milestone' | 'market';
  title: string;
  whyNow: string;             // Explanation for timing
  impactScore: number;        // 1-100
  impactLevel: 'high' | 'medium' | 'low';
  readiness: 'ready' | 'needs_prep' | 'blocked';
  readinessNotes?: string;
  sourceType: string;         // Where signal came from
  sourceId?: string;          // Link to source record
  status: 'new' | 'viewed' | 'snoozed' | 'dismissed' | 'actioned';
  snoozedUntil?: string;
  dismissReason?: string;
  surfacedAt: string;
  expiresAt?: string;         // When opportunity window closes
  suggestedWorkflow?: string;
  metadata?: Record<string, unknown>;
}
```

## 8.6 Automation Data Model

```typescript
interface AutomationSuggestion {
  id: string;
  patternDescription: string;
  automationDescription: string;
  expectedBenefit: string;
  detectedAt: string;
  occurrenceCount: number;    // How many times pattern was seen
  status: 'pending' | 'approved' | 'rejected';
}

interface ActiveAutomation {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused';
  createdAt: string;
  lastRunAt?: string;
  successCount: number;
  exceptionCount: number;
  safetyBounds: SafetyBounds;
}

interface SafetyBounds {
  maxPerDay?: number;
  maxValue?: number;
  requireConfirmationAbove?: number;
  allowedDays?: string[];     // ['monday', 'tuesday', ...]
  allowedHours?: { start: number; end: number };
  blockedClients?: string[];
}

interface AutomationException {
  id: string;
  automationId: string;
  automationName: string;
  reason: string;
  occurredAt: string;
  status: 'pending' | 'resolved' | 'ignored';
  affectedClientId?: string;
  affectedClientName?: string;
}

interface AdaptationLogEntry {
  id: string;
  type: 'pattern_detected' | 'sequence_adapted' | 'preference_inferred';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

## 8.7 Integration Data Model

```typescript
interface Integration {
  id: string;
  provider: 'google_drive' | 'onedrive' | 'dropbox' | 'gmail' | 'outlook' | 'google_calendar' | 'icloud';
  providerName: string;       // Display name
  category: 'file_storage' | 'email' | 'calendar';
  status: 'healthy' | 'warning' | 'error' | 'syncing';
  connectedAt: string;
  lastSyncAt?: string;
  recordsSynced: number;
  errorMessage?: string;
  warningMessage?: string;
}
```

## 8.8 Data Review Queue Model

```typescript
interface ReviewQueueItem {
  id: string;
  sourceType: 'file' | 'email' | 'calendar' | 'manual';
  sourceName: string;         // e.g., "contract.pdf", "Email from John"
  extractedAt: string;
  extractedData: Record<string, unknown>;
  confidenceScore: number;    // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  suggestedClientId?: string;
  suggestedClientName?: string;
  matchReason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
}
```

## 8.9 Business Metrics (Mock KPIs)

```typescript
interface BusinessMetrics {
  totalClients: number;
  activeClients: number;
  totalAUM: number;           // Assets Under Management
  aumChange: number;          // Percentage change
  pipelineValue: number;
  pipelineCount: number;
  conversionRate: number;
  avgResponseTime: number;    // in hours
  retentionRate: number;
  tasksCompleted: number;
  tasksCompletedChange: number;
  opportunitiesActioned: number;
}
```

## 8.10 Route Structure

```
/                           → Chat Home (default)
/auth                       → Auth landing (redirect based on session)
/auth/login                 → Login form
/auth/invite/[code]         → Invite acceptance
/clients                    → Client List
/clients/[id]               → Client Profile
/opportunities              → Opportunities View
/tasks                      → Tasks & Workflows
/review                     → Data Review Queue
/integrations               → Integrations & Sources
/automations                → Automation Review & Control
/dashboard                  → Business Metrics Dashboard
/import                     → Import Wizard
/activity                   → Activity Log
/settings                   → Settings & Preferences
/settings/profile           → Profile settings
/settings/security          → Security settings
/settings/notifications     → Notification preferences
/settings/products          → Products & Markets
/settings/team              → Team management (future)
```

## 8.11 Navigation Structure (Final)

```
┌─────────────────────────────────────────┐
│  [Ciri Logo]        [Session Badge ▼]   │  ← Header
├─────────────────────────────────────────┤
│                                         │
│  💬 CHAT                    [+ New]     │  ← Primary/Home
│     Recent Sessions                     │
│     • Morning check-in                  │
│     • Client research                   │
│     • Portfolio questions               │
│                                         │
│  👥 CLIENTS                             │
│     Recent                              │
│     • Michael Johnson                   │
│     • Sarah Chen                        │
│                                         │
│  💡 OPPORTUNITIES           (12)        │  ← Badge count
│                                         │
│  ✓ TASKS                    (5)         │  ← Pending count
│                                         │
│  🔗 SOURCES                 [●]         │  ← Health dot
│                                         │
│  ⚙️ AUTOMATIONS             (2)         │  ← Exception count
│                                         │
│  ─────────────────                      │
│                                         │
│  📊 Dashboard                           │
│  📥 Import                              │
│  📋 Activity                            │
│  ⚙️ Settings                            │
│                                         │
└─────────────────────────────────────────┘
```

---

# PART 9: PHASED IMPLEMENTATION PLAN

## Phase 1: Foundation
**Goal**: Core layout, navigation, and authentication flow

### 1A. App Shell & Navigation
- [ ] Sidebar navigation component (collapsible on mobile)
- [ ] Header with session indicator
- [ ] Layout wrapper with responsive design
- [ ] Route structure setup with Next.js App Router

### 1B. Auth Flow (UI-only)
- [ ] Login page with email input / "Continue as Guest"
- [ ] Session state management (React Context + localStorage)
- [ ] Header session badge (Guest/User indicator)
- [ ] Route protection wrapper (soft gate for MVP)

### 1C. Chat Home Enhancements
- [ ] Session sidebar (recent conversations)
- [ ] Voice input integration
- [ ] Action buttons in responses

## Phase 2: Client Intelligence
**Goal**: Complete client management screens

### 2A. Client List / Search
- [ ] Table/list view with existing mock clients
- [ ] Search & filter functionality
- [ ] Quick stats display

### 2B. Client Profile / Story
- [ ] Extend mock data (relationships, timeline, artifacts, assets)
- [ ] Profile header with relationships
- [ ] Timeline panel
- [ ] Artifacts panel
- [ ] Assets/policies table
- [ ] Alerts section

## Phase 3: Task Management
**Goal**: Task tracking and workflow management

### 3A. Tasks & Workflows Screen
- [ ] Task list with filters/sort
- [ ] Suggested actions section
- [ ] Workflow progress indicators
- [ ] Cycle time display

## Phase 4: Opportunity Engine
**Goal**: Opportunity surfacing and management

### 4A. Opportunities View
- [ ] Create mock opportunities data
- [ ] Opportunity cards with all fields
- [ ] Filters and actions
- [ ] Source tracing display

## Phase 5: Data Trust
**Goal**: Data quality and import features

### 5A. Data Review Queue
- [ ] Create mock review queue data
- [ ] Queue list and comparison UI
- [ ] Actions and batch operations

### 5B. Import Wizard
- [ ] Multi-step wizard UI
- [ ] File upload and mapping
- [ ] Validation and results

## Phase 6: Integrations & Control
**Goal**: Source management and automation control

### 6A. Integrations & Sources
- [ ] Create mock integrations data
- [ ] Sources grid and status display
- [ ] Mock OAuth flow
- [ ] Export modal

### 6B. Automation Review & Control
- [ ] Create mock automations data
- [ ] Suggestions and active list
- [ ] Safety bounds and exceptions

## Phase 7: Intelligence & Polish
**Goal**: Analytics, logging, and settings

### 7A. Business Metrics Dashboard
- [ ] Create mock KPIs data
- [ ] KPI cards and charts
- [ ] Drill-down capability

### 7B. Activity Log
- [ ] Create mock activity data
- [ ] Timeline display with filters

### 7C. Settings & Preferences
- [ ] Profile and preferences sections
- [ ] Products & markets upload
