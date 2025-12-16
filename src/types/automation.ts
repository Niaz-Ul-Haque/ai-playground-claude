// Automation Types for Ciri
// Workflow automation, suggestions, and control

// Automation suggestion status
export type AutomationSuggestionStatus = 'pending' | 'approved' | 'rejected';

// Active automation status
export type ActiveAutomationStatus = 'running' | 'paused' | 'stopped';

// Exception status
export type AutomationExceptionStatus = 'pending' | 'resolved' | 'ignored';

// Adaptation log entry types
export type AdaptationLogType = 'pattern_detected' | 'sequence_adapted' | 'preference_inferred' | 'automation_learned';

// Automation trigger types
export type AutomationTriggerType =
  | 'time_based'
  | 'event_based'
  | 'condition_based'
  | 'client_action'
  | 'data_change';

// Automation action types
export type AutomationActionType =
  | 'send_email'
  | 'create_task'
  | 'update_record'
  | 'send_notification'
  | 'schedule_meeting'
  | 'generate_report'
  | 'file_action';

// Automation category
export type AutomationCategory =
  | 'client_outreach'
  | 'data_management'
  | 'task_management'
  | 'reporting'
  | 'compliance'
  | 'follow_up';

// Automation suggestion interface
export interface AutomationSuggestion {
  id: string;
  patternDescription: string;
  automationDescription: string;
  expectedBenefit: string;
  category: AutomationCategory;
  triggerType: AutomationTriggerType;
  actionType: AutomationActionType;
  detectedAt: string;
  occurrenceCount: number;
  confidenceScore: number; // 0-100
  status: AutomationSuggestionStatus;
  affectedClients?: string[];
  estimatedTimeSaved?: number; // in minutes per week
  example?: {
    trigger: string;
    action: string;
  };
}

// Safety bounds configuration
export interface SafetyBounds {
  maxPerDay?: number;
  maxPerWeek?: number;
  maxValue?: number;
  requireConfirmationAbove?: number;
  allowedDays?: string[]; // ['monday', 'tuesday', ...]
  allowedHours?: {
    start: number; // 0-23
    end: number;   // 0-23
  };
  blockedClients?: string[];
  blockedActions?: AutomationActionType[];
  cooldownPeriod?: number; // in hours
}

// Automation run history entry
export interface AutomationRunEntry {
  id: string;
  automationId: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  duration: number; // in milliseconds
  actionsExecuted: number;
  affectedRecords?: string[];
  error?: string;
  triggeredBy: string;
}

// Active automation interface
export interface ActiveAutomation {
  id: string;
  name: string;
  description: string;
  category: AutomationCategory;
  triggerType: AutomationTriggerType;
  triggerConfig: Record<string, unknown>;
  actionType: AutomationActionType;
  actionConfig: Record<string, unknown>;
  status: ActiveAutomationStatus;
  createdAt: string;
  createdBy: string;
  lastRunAt?: string;
  nextRunAt?: string;
  successCount: number;
  failureCount: number;
  exceptionCount: number;
  safetyBounds: SafetyBounds;
  isSystemGenerated: boolean;
  sourcePattern?: string;
}

// Automation exception interface
export interface AutomationException {
  id: string;
  automationId: string;
  automationName: string;
  reason: string;
  details?: string;
  occurredAt: string;
  status: AutomationExceptionStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  affectedClientId?: string;
  affectedClientName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction?: string;
}

// Adaptation log entry interface
export interface AdaptationLogEntry {
  id: string;
  type: AdaptationLogType;
  title: string;
  description: string;
  timestamp: string;
  relatedAutomationId?: string;
  relatedAutomationName?: string;
  insights?: string[];
  dataPoints?: number;
  metadata?: Record<string, unknown>;
}

// Automation activity log entry
export interface AutomationActivityEntry {
  id: string;
  automationId: string;
  automationName: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  affectedClientId?: string;
  affectedClientName?: string;
  details?: string;
  linkTo?: {
    type: 'client' | 'task' | 'opportunity' | 'email';
    id: string;
  };
}

// Automation statistics
export interface AutomationStats {
  totalSuggestions: number;
  pendingSuggestions: number;
  totalActive: number;
  runningAutomations: number;
  pausedAutomations: number;
  pendingExceptions: number;
  totalRunsToday: number;
  successRateToday: number;
  timeSavedThisWeek: number; // in minutes
}

// Automation filters
export interface AutomationFilters {
  category?: AutomationCategory;
  status?: ActiveAutomationStatus | AutomationSuggestionStatus;
  triggerType?: AutomationTriggerType;
  search?: string;
}

// Automation exception filters
export interface ExceptionFilters {
  status?: AutomationExceptionStatus;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  automationId?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Label constants
export const AUTOMATION_CATEGORY_LABELS: Record<AutomationCategory, string> = {
  client_outreach: 'Client Outreach',
  data_management: 'Data Management',
  task_management: 'Task Management',
  reporting: 'Reporting',
  compliance: 'Compliance',
  follow_up: 'Follow-Up',
};

export const AUTOMATION_TRIGGER_LABELS: Record<AutomationTriggerType, string> = {
  time_based: 'Time-Based',
  event_based: 'Event-Based',
  condition_based: 'Condition-Based',
  client_action: 'Client Action',
  data_change: 'Data Change',
};

export const AUTOMATION_ACTION_LABELS: Record<AutomationActionType, string> = {
  send_email: 'Send Email',
  create_task: 'Create Task',
  update_record: 'Update Record',
  send_notification: 'Send Notification',
  schedule_meeting: 'Schedule Meeting',
  generate_report: 'Generate Report',
  file_action: 'File Action',
};

export const AUTOMATION_STATUS_LABELS: Record<ActiveAutomationStatus, string> = {
  running: 'Running',
  paused: 'Paused',
  stopped: 'Stopped',
};

export const SUGGESTION_STATUS_LABELS: Record<AutomationSuggestionStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const EXCEPTION_STATUS_LABELS: Record<AutomationExceptionStatus, string> = {
  pending: 'Pending',
  resolved: 'Resolved',
  ignored: 'Ignored',
};

export const EXCEPTION_SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const ADAPTATION_TYPE_LABELS: Record<AdaptationLogType, string> = {
  pattern_detected: 'Pattern Detected',
  sequence_adapted: 'Sequence Adapted',
  preference_inferred: 'Preference Inferred',
  automation_learned: 'Automation Learned',
};

// Day of week constants
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};
