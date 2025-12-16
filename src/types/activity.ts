/**
 * Activity Log Types
 * Type definitions for Activity Log / Audit Trail
 */

// ============================================================================
// Activity Entry Types
// ============================================================================

export type ActivityType =
  | 'client_created'
  | 'client_updated'
  | 'client_archived'
  | 'contact_added'
  | 'note_added'
  | 'task_created'
  | 'task_completed'
  | 'task_assigned'
  | 'opportunity_surfaced'
  | 'opportunity_actioned'
  | 'opportunity_dismissed'
  | 'automation_executed'
  | 'automation_approved'
  | 'automation_paused'
  | 'integration_connected'
  | 'integration_synced'
  | 'integration_error'
  | 'data_imported'
  | 'data_exported'
  | 'review_approved'
  | 'review_rejected'
  | 'email_sent'
  | 'email_received'
  | 'call_logged'
  | 'meeting_scheduled'
  | 'document_uploaded'
  | 'document_shared'
  | 'login'
  | 'logout'
  | 'settings_changed'
  | 'system_event';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  client_created: 'Client Created',
  client_updated: 'Client Updated',
  client_archived: 'Client Archived',
  contact_added: 'Contact Added',
  note_added: 'Note Added',
  task_created: 'Task Created',
  task_completed: 'Task Completed',
  task_assigned: 'Task Assigned',
  opportunity_surfaced: 'Opportunity Surfaced',
  opportunity_actioned: 'Opportunity Actioned',
  opportunity_dismissed: 'Opportunity Dismissed',
  automation_executed: 'Automation Executed',
  automation_approved: 'Automation Approved',
  automation_paused: 'Automation Paused',
  integration_connected: 'Integration Connected',
  integration_synced: 'Integration Synced',
  integration_error: 'Integration Error',
  data_imported: 'Data Imported',
  data_exported: 'Data Exported',
  review_approved: 'Review Approved',
  review_rejected: 'Review Rejected',
  email_sent: 'Email Sent',
  email_received: 'Email Received',
  call_logged: 'Call Logged',
  meeting_scheduled: 'Meeting Scheduled',
  document_uploaded: 'Document Uploaded',
  document_shared: 'Document Shared',
  login: 'Login',
  logout: 'Logout',
  settings_changed: 'Settings Changed',
  system_event: 'System Event',
};

// ============================================================================
// Activity Category Types
// ============================================================================

export type ActivityCategory =
  | 'clients'
  | 'tasks'
  | 'opportunities'
  | 'automations'
  | 'integrations'
  | 'data'
  | 'communications'
  | 'documents'
  | 'auth'
  | 'system';

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  clients: 'Clients',
  tasks: 'Tasks',
  opportunities: 'Opportunities',
  automations: 'Automations',
  integrations: 'Integrations',
  data: 'Data',
  communications: 'Communications',
  documents: 'Documents',
  auth: 'Authentication',
  system: 'System',
};

export const ACTIVITY_TYPE_CATEGORIES: Record<ActivityType, ActivityCategory> = {
  client_created: 'clients',
  client_updated: 'clients',
  client_archived: 'clients',
  contact_added: 'clients',
  note_added: 'clients',
  task_created: 'tasks',
  task_completed: 'tasks',
  task_assigned: 'tasks',
  opportunity_surfaced: 'opportunities',
  opportunity_actioned: 'opportunities',
  opportunity_dismissed: 'opportunities',
  automation_executed: 'automations',
  automation_approved: 'automations',
  automation_paused: 'automations',
  integration_connected: 'integrations',
  integration_synced: 'integrations',
  integration_error: 'integrations',
  data_imported: 'data',
  data_exported: 'data',
  review_approved: 'data',
  review_rejected: 'data',
  email_sent: 'communications',
  email_received: 'communications',
  call_logged: 'communications',
  meeting_scheduled: 'communications',
  document_uploaded: 'documents',
  document_shared: 'documents',
  login: 'auth',
  logout: 'auth',
  settings_changed: 'system',
  system_event: 'system',
};

// ============================================================================
// Activity Entry Interface
// ============================================================================

export type ActivityActor = 'user' | 'system' | 'automation';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  title: string;
  description: string;
  actor: ActivityActor;
  actorName?: string;
  timestamp: string;

  // Related entities
  clientId?: string;
  clientName?: string;
  taskId?: string;
  taskTitle?: string;
  opportunityId?: string;
  opportunityTitle?: string;
  automationId?: string;
  automationName?: string;
  integrationId?: string;
  integrationName?: string;
  documentId?: string;
  documentName?: string;

  // Additional details
  details?: Record<string, unknown>;
  changes?: ActivityChange[];
  metadata?: Record<string, unknown>;

  // Status and flags
  isRead?: boolean;
  isImportant?: boolean;
  isError?: boolean;
}

export interface ActivityChange {
  field: string;
  fieldLabel: string;
  oldValue?: string | number | boolean;
  newValue?: string | number | boolean;
}

// ============================================================================
// Activity Filters
// ============================================================================

export interface ActivityFilters {
  search?: string;
  types?: ActivityType[];
  categories?: ActivityCategory[];
  actors?: ActivityActor[];
  clientId?: string;
  startDate?: string;
  endDate?: string;
  isImportant?: boolean;
  isError?: boolean;
}

// ============================================================================
// Activity Stats
// ============================================================================

export interface ActivityStats {
  totalEntries: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  byCategory: Record<ActivityCategory, number>;
  byType: Record<ActivityType, number>;
  byActor: Record<ActivityActor, number>;
  errorCount: number;
  importantCount: number;
}

// ============================================================================
// Activity Group (for timeline display)
// ============================================================================

export interface ActivityGroup {
  date: string;
  dateLabel: string;
  entries: ActivityEntry[];
}

// ============================================================================
// Export Options
// ============================================================================

export interface ActivityExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: ActivityCategory[];
  types?: ActivityType[];
  includeDetails?: boolean;
}
