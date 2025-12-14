# Ciri UI Screen Plan

## Philosophy: "No UI is Good UI"
Chat is home. UI exists only for: **review, approval, correction, trust, control, safety, and speed**.

**Full Implementation Details:** See `documents/UI-IMPLEMENTATION-PLAN.md`

---

## Navigation Structure (Left Sidebar)

```
[Ciri Logo]        [Session: Guest/User indicator]

CHAT (Home)
  └─ Recent Sessions

CLIENTS
  └─ Recent Clients/Households

OPPORTUNITIES
  └─ (Badge: count)

TASKS & WORKFLOWS

SOURCES & INTEGRATIONS
  └─ Health indicator

AUTOMATIONS

─────────────
Dashboard
Import
Activity Log
Settings
```

---

## Screen List

### MUST-HAVE UI (7 Screens)

#### 1. Auth Flow (NEW)
**Why:** FR 1a - Guest access, magic link, password, invites, session ownership
**Key:** Minimal friction, progressive disclosure, session indicator in header

#### 2. Chat Home
**Why it exists:** Primary interaction surface (Actionable Intelligence, Natural Interaction - FR 2c, 6a)

**What user can do:**
- Ask questions about clients, business, opportunities
- Get answers with citations
- Trigger any action through conversation
- See recent sessions in sidebar

**What stays in chat:** Everything possible - this IS chat

**Key components:**
- Message thread with rich responses (tables, cards, charts inline)
- Input with voice support
- Session list in sidebar

---

#### 2. Client Profile / Story
**Why it exists:** Full client context (Autonomous Relationship Management - FR 3a, "Full Picture of Client" experience)

**What user can do:**
- View unified client profile with relationships (household, dependents)
- See chronological timeline of all interactions/events
- Access all artifacts with version history
- View client assets, policies, contracts with status
- See upcoming service moments, expiries, milestones

**What stays in chat:**
- Asking questions about the client
- Adding notes or updates
- Triggering outreach

**Key components:**
- Profile header with key info + relationships
- Timeline (interactions, events, milestones)
- Artifacts panel (documents, files with versions)
- Assets/policies table with status indicators
- Upcoming alerts section

---

#### 3. Opportunities View
**Why it exists:** Automatic Opportunity Identification (FR 4a, 4b - surfacing + prioritization)

**What user can do:**
- See all surfaced opportunities in one place
- Understand "why now" for each opportunity
- See impact/value scoring and prioritization
- Filter by type (contract, milestone, market)
- Launch appropriate workflow from an opportunity
- Dismiss/snooze with cool-off

**What stays in chat:**
- "What opportunities do I have this week?"
- "Tell me more about [opportunity]"

**Key components:**
- Opportunity cards with client, type, "why now", impact score
- Filters (type, priority, client)
- Source tracing (where the signal came from)
- Action buttons (start workflow, snooze, dismiss)

---

#### 4. Data Review Queue
**Why it exists:** Trust & Accuracy (Autonomous Data Management - FR 2a, "Effortless Data Sharing" experience)

**What user can do:**
- Review AI-extracted data from sources
- Correct entity matches (duplicate resolution)
- Approve/reject suggested client-data attachments
- See confidence scores
- Provide feedback to improve future extraction

**What stays in chat:**
- "Show me recent extractions"
- Quick corrections via conversation

**Key components:**
- Queue of pending reviews
- Side-by-side comparison (extracted vs. existing)
- Match confidence indicator
- Approve/Reject/Edit actions
- Batch operations

---

#### 5. Integrations & Sources
**Why it exists:** Control & Trust (Data Sources - FR 2a, Communication Channels - FR 2a)

**What user can do:**
- Connect new data sources (Google Drive, OneDrive, Dropbox, etc.)
- Link communication channels (email, calendar, calls)
- View connection health and sync status
- Revoke or re-authenticate connections
- See last sync time and any errors

**What stays in chat:**
- "Connect my Google Drive"
- "What's wrong with my email sync?"

**Key components:**
- Source cards with status indicators (healthy, warning, error)
- Connect buttons triggering OAuth flows
- Last sync timestamp
- Error messages with resolution actions
- Data export options

---

#### 6. Automation Review & Control
**Why it exists:** Safety & Trust (Intelligent Workflow Automation - FR 5b, "Gradual Automation" experience)

**What user can do:**
- Review suggested automations before enabling
- See what automations are currently running
- Set safety bounds on automations
- Pause/resume routines
- See exceptions that need attention
- View automation logs

**What stays in chat:**
- "What automations are running?"
- "Pause the follow-up automation"

**Key components:**
- Suggested automations with approve/reject
- Active automations list with status
- Safety bounds configuration
- Exception queue
- Activity log

---

### SHOULD-HAVE UI (4 Screens)

#### 8. Client List / Search
**Why it exists:** Quick browsing when needed (Client Story - FR 3a)

**What user can do:**
- Browse all clients
- Filter and search
- Quick access to profiles
- See recent/frequent clients

**What stays in chat:**
- "Find clients in Toronto"
- "Who are my top 10 clients?"

**Key components:**
- Searchable table/list
- Filters (location, status, AUM, etc.)
- Quick stats per client

---

#### 9. Tasks & Workflows
**Why it exists:** Work Management (Predictive Assistance - FR 5a, Work Management - FR 6b)

**What user can do:**
- See all pending tasks
- View suggested next steps
- Track workflow progress
- See what's automated vs. needs attention
- View cycle time (how long tasks take) - FR 5a
- See prefilled forms/checklists - FR 3b

**What stays in chat:**
- "What should I do today?"
- "Mark task X complete"

**Key components:**
- Task list with priorities
- Suggested actions with accept/decline
- Workflow progress indicators
- Today/This Week view
- Cycle time display
- Prefilled materials section

---

#### 10. Business Metrics Dashboard
**Why it exists:** True Visibility (Actionable Intelligence - FR 6a, "Meaningful Answers" experience)

**What user can do:**
- See core business KPIs at a glance
- Drill down from metric to records
- Save/share view snapshots
- See focus timeline shortlist - FR 6b
- Track effect of focus actions

**What stays in chat:**
- "How's my pipeline?"
- "What's my conversion rate?"

**Key components:**
- Key metrics cards
- Trend charts
- Drill-down capability
- Focus recommendations panel
- Save/Share buttons

---

#### 11. Import Wizard (NEW)
**Why it exists:** FR 2a Manual Entry - Import CSVs with mapping and validation

**What user can do:**
- Upload files (CSV, Excel, etc.)
- Map source columns to system fields
- Preview and validate data
- Handle errors before import
- Run import and see results

**What stays in chat:**
- "Import my client list" (triggers wizard)

**Key components:**
- Upload step (drag & drop)
- Column mapping UI
- Validation results
- Error handling
- Import summary

---

### NICE-TO-HAVE UI (2 Screens)

#### 12. Activity Log
**Why it exists:** Audit trail, transparency

**What user can do:**
- See what Ciri did automatically
- Review all system actions
- Export logs

---

#### 13. Settings & Preferences
**Why it exists:** Configuration (Convention - FR 1b), Product/Market list (FR 4a)

**What user can do:**
- Set preferences
- Manage notification settings
- Configure defaults
- Upload product/market list (for market-based opportunities - FR 4a)
- Manage team (if admin)
- Profile & security settings

---

## Recommended Build Order

### Phase 1: Foundation
1. **Auth Flow** - Required for everything else
2. **Chat Home** - Primary interface, core value
3. **Integrations & Sources** - Users need to connect data first

### Phase 2: Data Trust
4. **Data Review Queue** - Build trust in AI extractions
5. **Import Wizard** - Alternative data onboarding

### Phase 3: Client Intelligence
6. **Client Profile / Story** - Core value delivery
7. **Client List / Search** - Browsing alternative

### Phase 4: Opportunity Engine
8. **Opportunities View** - Key differentiator

### Phase 5: Work Orchestration
9. **Tasks & Workflows** - Work management
10. **Automation Review & Control** - Gradual automation control

### Phase 6: Intelligence & Polish
11. **Business Metrics Dashboard** - Visual analytics
12. **Activity Log** - Audit trail
13. **Settings & Preferences** - Configuration

---

## Summary Table

| # | Screen | Priority | Primary Requirement | Can Be Chat? |
|---|--------|----------|---------------------|--------------|
| 1 | Auth Flow | Must | FR 1a | No - Auth needs UI |
| 2 | Chat Home | Must | FR 2c, 6a | IS chat |
| 3 | Client Profile | Must | FR 3a | Partial |
| 4 | Opportunities | Must | FR 4a, 4b | Partial |
| 5 | Data Review Queue | Must | FR 2a | Limited |
| 6 | Integrations | Must | FR 2a | Auth flows need UI |
| 7 | Automation Review | Must | FR 5b | Safety needs UI |
| 8 | Client List | Should | FR 3a | Mostly yes |
| 9 | Tasks/Workflows | Should | FR 5a, 6b | Partial |
| 10 | Metrics Dashboard | Should | FR 6a | Partial |
| 11 | Import Wizard | Should | FR 2a | Mapping needs UI |
| 12 | Activity Log | Nice | Transparency | Yes |
| 13 | Settings | Nice | FR 1b, 4a | Partial |

---

## Verification Status

**Total Screens:** 13 (7 Must + 4 Should + 2 Nice)
**Requirements Coverage:** 100% (78/78 items addressed)
**See:** `documents/UI-IMPLEMENTATION-PLAN.md` for full verification matrix

---

## Implementation Assumptions (Summary)

For complete details, see **PART 8** in `documents/UI-IMPLEMENTATION-PLAN.md`.

### Auth & Sessions
- **Guests CAN**: Use chat, view sample data, browse UI
- **Guests CANNOT**: Connect sources, export data, enable automations
- **Pay-gated actions**: Integrations, exports, automations, team features
- **Auth is UI-only for MVP**: No real backend, localStorage for session state

### Data Models Added
- **ClientRelationship**: Spouse, children, professionals (accountant, lawyer)
- **TimelineEvent**: Emails, calls, meetings, notes, milestones
- **Artifact**: Documents with version history
- **ClientAsset**: Policies, accounts with alerts
- **Opportunity**: Contract/milestone/market-based with impact scoring
- **Integration**: Provider connections with health status
- **Automation**: Suggestions, active routines, safety bounds, exceptions
- **ReviewQueueItem**: AI extractions pending approval

### Supported Integrations (Mock)
| Category | Providers |
|----------|-----------|
| File Storage | Google Drive, OneDrive, Dropbox, iCloud Drive |
| Email | Gmail, Outlook/Exchange |
| Calendar | Google Calendar, Outlook Calendar, iCloud Calendar |

### Route Structure
```
/                    → Chat Home
/auth/login          → Login
/clients             → Client List
/clients/[id]        → Client Profile
/opportunities       → Opportunities
/tasks               → Tasks & Workflows
/review              → Data Review Queue
/integrations        → Sources
/automations         → Automation Control
/dashboard           → Metrics Dashboard
/import              → Import Wizard
/activity            → Activity Log
/settings/*          → Settings pages
```
