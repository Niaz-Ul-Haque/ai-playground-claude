export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'needs-review';

export type AIActionType =
  | 'email_draft'
  | 'portfolio_review'
  | 'meeting_notes'
  | 'report'
  | 'reminder'
  | 'analysis';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string; // ISO string
  clientId?: string;
  clientName?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  // AI auto-completion fields
  aiCompleted?: boolean;
  aiActionType?: AIActionType;
  aiCompletionData?: {
    completedAt: string;
    summary: string;
    details: string;
    confidence: number; // 0-100
  };
}

export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
  clientName?: string;
  priority: 'low' | 'medium' | 'high';
  aiCompleted?: boolean;
}

export interface TaskFilters {
  status?: TaskStatus;
  clientId?: string;
  dueDate?: 'today' | 'week' | 'overdue' | 'all';
  aiCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  searchTerm?: string;
  workflowId?: string;
}

// Suggested Actions - AI recommendations for next steps
export type SuggestedActionType =
  | 'follow_up'
  | 'review_required'
  | 'schedule_meeting'
  | 'send_document'
  | 'update_record'
  | 'complete_task'
  | 'escalate';

export interface SuggestedAction {
  id: string;
  type: SuggestedActionType;
  title: string;
  description: string;
  reason: string; // "Why this?" explanation
  clientId?: string;
  clientName?: string;
  relatedTaskId?: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  suggestedAt: string;
  expiresAt?: string;
  status: 'pending' | 'accepted' | 'dismissed';
  metadata?: Record<string, unknown>;
}

// Workflow definitions
export type WorkflowType =
  | 'client_onboarding'
  | 'annual_review'
  | 'portfolio_rebalance'
  | 'insurance_renewal'
  | 'estate_planning'
  | 'tax_planning';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  order: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string;
  assignedTo?: string;
  isAutomated?: boolean;
}

export interface Workflow {
  id: string;
  type: WorkflowType;
  name: string;
  description: string;
  clientId?: string;
  clientName?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedCompletionDate?: string;
  relatedTaskIds: string[];
}

// Process Recommendations
export type RecommendationType =
  | 'efficiency'
  | 'automation'
  | 'timing'
  | 'priority'
  | 'delegation';

export interface ProcessRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  expectedBenefit: string;
  impactLevel: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'applied' | 'dismissed' | 'reverted';
  appliedAt?: string;
  outcome?: {
    tracked: boolean;
    beforeMetrics?: Record<string, number>;
    afterMetrics?: Record<string, number>;
    notes?: string;
  };
  suggestedAt: string;
}

// Cycle Time Tracking
export interface CycleTimeStats {
  taskType: string;
  currentTaskMinutes?: number;
  averageMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  sampleSize: number;
  trend: 'improving' | 'stable' | 'declining';
  percentileRank?: number; // Where current task falls in historical distribution
}

// Prefilled Materials
export type MaterialType =
  | 'form'
  | 'document'
  | 'checklist'
  | 'template'
  | 'report';

export interface PrefilledMaterial {
  id: string;
  type: MaterialType;
  name: string;
  description: string;
  clientId?: string;
  clientName?: string;
  relatedTaskId?: string;
  relatedWorkflowId?: string;
  status: 'ready' | 'draft' | 'sent' | 'completed';
  prefilledFields: number;
  totalFields: number;
  createdAt: string;
  updatedAt: string;
  items?: ChecklistItem[]; // For checklists
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

// Task Statistics
export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  needsReview: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  aiCompleted: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}
