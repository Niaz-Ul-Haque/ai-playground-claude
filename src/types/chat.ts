/**
 * Chat Types - Matches backend schema
 */

import type { Task, TaskSummary, AIActionType } from './task';
import type { Client, ClientSummary } from './client';
import type { Policy, PolicySummary } from './policy';

// =============================================================================
// Streaming SSE Types
// =============================================================================

export type StreamingStatus =
  | 'connecting'
  | 'classifying_intent'
  | 'resolving_context'
  | 'gathering_data'
  | 'executing_action'
  | 'building_prompt'
  | 'calling_llm'
  | 'parsing_response'
  | 'complete'
  | 'error';

export type SSEEventType = 'status' | 'progress' | 'partial' | 'result' | 'error';

export interface SSEEventData {
  status?: StreamingStatus;
  message?: string;
  progress?: number;
  partial_content?: string;
  result?: StreamingChatResponse;
  error?: string;
}

/** Response shape from the streaming endpoint's result event */
export interface StreamingChatResponse {
  content: string;
  cards?: Card[];
  context?: StreamingChatContext;
  tasks_updated?: boolean;
  error?: string;
}

/** Context returned/sent by the streaming endpoint */
export interface StreamingChatContext {
  session_id?: string;
  focused_task_id?: string;
  focused_client_id?: string;
  focused_policy_id?: string;
  last_intent?: string;
  collected_entities?: {
    client_ids: string[];
    policy_ids: string[];
    task_ids: string[];
  };
  recent_actions?: string[];
  has_pending_drafts?: boolean;
  session_started_at?: string;
}

/** Display text mapping for streaming status phases */
export const streamingStatusDisplay: Record<StreamingStatus, string> = {
  connecting: 'Connecting...',
  classifying_intent: 'Understanding your request...',
  resolving_context: 'Checking context...',
  gathering_data: 'Gathering information...',
  executing_action: 'Executing action...',
  building_prompt: 'Preparing response...',
  calling_llm: 'Ciri is thinking...',
  parsing_response: 'Processing...',
  complete: '',
  error: 'Something went wrong',
};

// =============================================================================
// Core Message Types
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type CardType =
  | 'task-list'
  | 'task'
  | 'client'
  | 'client-list'
  | 'policy'
  | 'policy-list'
  | 'review'
  | 'confirmation'
  // Phase 1: Actionable content cards
  | 'email-composer'
  | 'data-table'
  | 'chart'
  | 'compliance-check'
  // Phase 2: Business intelligence cards
  | 'proposal'
  | 'comparison'
  | 'dashboard'
  | 'portfolio-review'
  // Phase 3: Workflow cards
  | 'calendar'
  | 'meeting-notes'
  | 'reminder'
  | 'progress-tracker'
  | 'renewal-notice'
  | 'document-preview';

export type MessageStatus = 'pending' | 'typing' | 'complete';

export interface MessageMetadata {
  step?: string;
  details?: string;
  streamingStatus?: StreamingStatus;
  streamingProgress?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  cards?: Card[];
  status?: MessageStatus;
  metadata?: MessageMetadata;
}

export type Card =
  | { type: 'task-list'; data: TaskListCardData }
  | { type: 'task'; data: TaskCardData }
  | { type: 'client'; data: ClientCardData }
  | { type: 'client-list'; data: ClientListCardData }
  | { type: 'policy'; data: PolicyCardData }
  | { type: 'policy-list'; data: PolicyListCardData }
  | { type: 'review'; data: ReviewCardData }
  | { type: 'confirmation'; data: ConfirmationCardData }
  // Phase 1: Actionable content cards
  | { type: 'email-composer'; data: EmailComposerCardData }
  | { type: 'data-table'; data: DataTableCardData }
  | { type: 'chart'; data: ChartCardData }
  | { type: 'compliance-check'; data: ComplianceCheckCardData }
  // Phase 2: Business intelligence cards
  | { type: 'proposal'; data: ProposalCardData }
  | { type: 'comparison'; data: ComparisonCardData }
  | { type: 'dashboard'; data: DashboardCardData }
  | { type: 'portfolio-review'; data: PortfolioReviewCardData }
  // Phase 3: Workflow cards
  | { type: 'calendar'; data: CalendarCardData }
  | { type: 'meeting-notes'; data: MeetingNotesCardData }
  | { type: 'reminder'; data: ReminderCardData }
  | { type: 'progress-tracker'; data: ProgressTrackerCardData }
  | { type: 'renewal-notice'; data: RenewalNoticeCardData }
  | { type: 'document-preview'; data: DocumentPreviewCardData };

export interface TaskListCardData {
  title?: string;
  description?: string;
  tasks: TaskSummary[];
  show_actions?: boolean;
}

export interface TaskCardData {
  task: Task;
  show_actions?: boolean;
}

export interface ClientCardData {
  client?: Client | ClientSummary;
  show_policies?: boolean;
  recent_tasks?: TaskSummary[];
}

export interface ClientListCardData {
  title?: string;
  clients: ClientSummary[];
}

export interface PolicyCardData {
  policy?: Policy | PolicySummary;
  show_claims?: boolean;
}

export interface PolicyListCardData {
  title?: string;
  policies: PolicySummary[];
  client_name?: string;
}

export interface ReviewCardData {
  task_id?: string;
  title: string;
  action_type?: AIActionType;
  content?: string;
  message?: string;
  summary?: string;
  confidence?: number;
  task?: {
    task_id: string;
    title: string;
    status: string;
    ai_completed: boolean;
  };
  generated_content?: string;
}

export interface ConfirmationCardData {
  type: 'success' | 'error' | 'info';
  message: string;
  details?: Record<string, unknown>;
  undoable?: boolean;
  undo_action?: string;
}

export type ContentSegment =
  | { type: 'text'; content: string }
  | { type: 'card'; card: Card };

// Chat Request/Response types
export interface ChatRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context?: ChatContext;
}

export interface ChatContext {
  current_client_id?: string;
  current_policy_id?: string;
  current_task_id?: string;
  current_view?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    content: string;
    cards?: Card[];
    intent?: string;
    context?: {
      client_id?: string;
      policy_id?: string;
      task_id?: string;
      last_intent?: string;
      focused_task_id?: string;
      focused_client_id?: string;
      focused_policy_id?: string;
    };
    tasks_updated?: boolean;
  };
  error?: string;
  message?: string;
}

// =============================================================================
// Phase 1: Actionable Content Card Data Interfaces
// =============================================================================

export interface EmailComposerCardData {
  email_id?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachments?: Array<{
    name: string;
    url?: string;
    size?: number;
  }>;
  template_id?: string;
  template_name?: string;
  editable?: boolean;
  related_task_id?: string;
  related_client_id?: string;
  available_actions?: ('send' | 'save_draft' | 'copy' | 'discard')[];
}

export interface DataTableCardData {
  title?: string;
  description?: string;
  columns: Array<{
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
    format?: 'text' | 'number' | 'currency' | 'date' | 'percent' | 'status';
  }>;
  rows: Record<string, unknown>[];
  sortable?: boolean;
  filterable?: boolean;
  pageSize?: number;
  exportable?: boolean;
  available_actions?: ('export' | 'filter' | 'sort')[];
}

export interface ChartCardData {
  title?: string;
  description?: string;
  chart_type: 'line' | 'bar' | 'pie' | 'donut' | 'sparkline';
  data: Array<{
    name: string;
    value: number;
    [key: string]: string | number;
  }>;
  x_axis_key?: string;
  y_axis_key?: string;
  series?: Array<{
    key: string;
    name?: string;
    color?: string;
  }>;
  show_legend?: boolean;
  show_grid?: boolean;
  height?: number;
  time_periods?: string[];
  selected_period?: string;
  center_label?: string;
  center_value?: string | number;
}

export interface ComplianceCheckCardData {
  title: string;
  client_id?: string;
  client_name?: string;
  check_date: string;
  overall_score: number;
  items: Array<{
    id: string;
    label: string;
    status: 'pass' | 'fail' | 'warning' | 'pending';
    description?: string;
    details?: string;
    remediation?: string;
  }>;
  summary?: string;
  available_actions?: ('resolve' | 'schedule_review' | 'generate_report' | 'escalate')[];
}

// =============================================================================
// Phase 2: Business Intelligence Card Data Interfaces
// =============================================================================

export interface ProposalCardData {
  proposal_id: string;
  title: string;
  client_id?: string;
  client_name?: string;
  products?: Array<{
    product_id: string;
    name: string;
    type: string;
    carrier?: string;
    recommended?: boolean;
  }>;
  pricing_table?: Array<{
    coverage: string;
    monthly_premium: number;
    annual_premium: number;
    term?: string;
    notes?: string;
  }>;
  benefits?: string[];
  terms?: string[];
  expiry_date?: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  available_actions?: ('select_option' | 'send_to_client' | 'edit' | 'download_pdf')[];
}

export interface ComparisonCardData {
  title: string;
  items?: Array<{
    id: string;
    name: string;
    recommended?: boolean;
  }>;
  attributes?: Array<{
    key: string;
    label: string;
    format?: 'text' | 'boolean' | 'number' | 'currency';
    values: Record<string, unknown>;
    winner?: string;
  }>;
  recommendation?: string;
  available_actions?: ('select' | 'request_details')[];
}

export interface DashboardCardData {
  title?: string;
  period: string;
  metrics: Array<{
    id: string;
    label: string;
    value: number | string;
    format?: 'number' | 'currency' | 'percent';
    change?: number;
    change_period?: string;
    sparkline?: number[];
  }>;
  charts?: ChartCardData[];
  available_periods?: string[];
}

export interface PortfolioReviewCardData {
  client_id: string;
  client_name: string;
  total_value?: number;
  total_change?: number;
  total_change_percent?: number;
  period: string;
  allocation: Array<{
    category: string;
    value?: number;
    percent?: number;
    change?: number;
  }>;
  holdings?: Array<{
    name: string;
    ticker?: string;
    value?: number;
    shares?: number;
    change?: number;
    change_percent?: number;
  }>;
  performance_history?: Array<{
    date: string;
    value: number;
  }>;
  risk_score?: number;
  recommendation?: string;
  available_actions?: ('rebalance' | 'export' | 'compare_benchmark')[];
}

// =============================================================================
// Phase 3: Workflow Card Data Interfaces
// =============================================================================

export interface CalendarCardData {
  title?: string;
  view: 'day' | 'week' | 'month';
  date: string;
  events: Array<{
    id: string;
    title: string;
    start: string;
    end?: string;
    type: 'meeting' | 'task' | 'reminder' | 'deadline';
    client_id?: string;
    client_name?: string;
    location?: string;
    description?: string;
  }>;
  available_actions?: ('add_event' | 'change_view' | 'sync')[];
}

export interface MeetingNotesCardData {
  meeting_id?: string;
  title: string;
  meeting_date: string;
  attendees: Array<{
    name: string;
    email?: string;
    role?: string;
  }>;
  agenda?: string[];
  discussion_points?: string[];
  action_items: Array<{
    id: string;
    description: string;
    owner?: string;
    due_date?: string;
    completed?: boolean;
  }>;
  notes?: string;
  follow_up_date?: string;
  editable?: boolean;
  available_actions?: ('save' | 'share' | 'add_action_item' | 'schedule_followup')[];
}

export interface ReminderCardData {
  reminder_id: string;
  title: string;
  description?: string;
  due_date: string;
  due_time?: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval?: number;
    end_date?: string;
  };
  related_client_id?: string;
  related_client_name?: string;
  related_task_id?: string;
  related_task_title?: string;
  status: 'pending' | 'snoozed' | 'dismissed' | 'completed';
  snoozed_until?: string;
  available_actions?: ('snooze' | 'dismiss' | 'complete' | 'reschedule')[];
}

export interface ProgressTrackerCardData {
  process_id: string;
  title: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    status: 'pending' | 'current' | 'completed';
    completed_at?: string;
    notes?: string;
  }>;
  current_step: number;
  start_date: string;
  estimated_completion?: string;
  actual_completion?: string;
  available_actions?: ('advance_step' | 'add_note' | 'escalate')[];
}

export interface RenewalNoticeCardData {
  title?: string;
  policies?: Array<{
    policy_id: string;
    policy_number: string;
    type: string;
    client_name: string;
    expiry_date: string;
    days_remaining: number;
    current_premium: number;
    projected_premium?: number;
    premium_change?: number;
    status: 'due' | 'overdue' | 'renewed' | 'cancelled';
  }>;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  available_actions?: ('initiate_renewal' | 'contact_client' | 'compare_quotes' | 'set_reminder')[];
}

export interface DocumentPreviewCardData {
  title?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    thumbnail_url?: string;
    size?: number;
    uploaded_at?: string;
    uploaded_by?: string;
  }>;
  selected_document_id?: string;
  client_id?: string;
  policy_id?: string;
  available_actions?: ('view' | 'download' | 'share' | 'delete' | 'upload')[];
}
