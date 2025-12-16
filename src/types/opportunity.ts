// Opportunity Types - Phase 4: Opportunity Engine

export type OpportunityType = 'contract' | 'milestone' | 'market';

export type OpportunityStatus = 'new' | 'viewed' | 'snoozed' | 'dismissed' | 'actioned';

export type ReadinessLevel = 'ready' | 'needs_prep' | 'blocked';

export type ImpactLevel = 'high' | 'medium' | 'low';

// Source types for tracing where the opportunity signal came from
export type OpportunitySourceType =
  | 'policy_renewal'
  | 'contract_expiry'
  | 'contribution_room'
  | 'life_event'
  | 'milestone_birthday'
  | 'milestone_anniversary'
  | 'market_condition'
  | 'product_launch'
  | 'regulatory_change'
  | 'portfolio_analysis'
  | 'communication_analysis'
  | 'manual';

export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string;
  type: OpportunityType;
  title: string;
  description: string;
  whyNow: string; // Explanation for timing - "Why Now" summary
  whyNowDetails?: string; // Expanded explanation

  // Scoring
  impactScore: number; // 1-100
  impactLevel: ImpactLevel;
  estimatedValue?: number; // Potential revenue/value in dollars

  // Readiness
  readiness: ReadinessLevel;
  readinessNotes?: string;
  prerequisites?: string[]; // List of things needed before actioning

  // Source tracing
  sourceType: OpportunitySourceType;
  sourceDescription: string;
  sourceId?: string; // Link to source record (e.g., policy ID, event ID)
  sourceData?: Record<string, unknown>;

  // Status
  status: OpportunityStatus;
  snoozedUntil?: string; // ISO date string
  snoozeReason?: string;
  dismissReason?: string;

  // Dates
  surfacedAt: string; // When the opportunity was detected
  expiresAt?: string; // When the opportunity window closes
  actionedAt?: string;

  // Workflow integration
  suggestedWorkflow?: string; // e.g., 'annual_review', 'portfolio_rebalance'
  suggestedWorkflowName?: string;

  // Additional metadata
  tags?: string[];
  priority?: number; // For sorting, higher = more important
  metadata?: Record<string, unknown>;
}

// Filters for opportunity list
export interface OpportunityFilters {
  type?: OpportunityType;
  status?: OpportunityStatus;
  impactLevel?: ImpactLevel;
  readiness?: ReadinessLevel;
  clientId?: string;
  searchTerm?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'impact' | 'date' | 'expiry' | 'client';
  sortOrder?: 'asc' | 'desc';
}

// Statistics for opportunity dashboard
export interface OpportunityStats {
  total: number;
  byStatus: {
    new: number;
    viewed: number;
    snoozed: number;
    dismissed: number;
    actioned: number;
  };
  byType: {
    contract: number;
    milestone: number;
    market: number;
  };
  byImpact: {
    high: number;
    medium: number;
    low: number;
  };
  byReadiness: {
    ready: number;
    needs_prep: number;
    blocked: number;
  };
  totalEstimatedValue: number;
  expiringThisWeek: number;
}

// Snooze options
export type SnoozeDuration = '1_day' | '3_days' | '1_week' | '2_weeks' | '1_month' | 'custom';

export interface SnoozeOptions {
  duration: SnoozeDuration;
  customDate?: string; // For custom duration
  reason?: string;
}

// Dismiss reasons
export type DismissReason =
  | 'not_relevant'
  | 'client_declined'
  | 'already_addressed'
  | 'timing_not_right'
  | 'competitor_won'
  | 'other';

export const DISMISS_REASON_LABELS: Record<DismissReason, string> = {
  not_relevant: 'Not relevant to client',
  client_declined: 'Client declined',
  already_addressed: 'Already addressed elsewhere',
  timing_not_right: 'Timing not right',
  competitor_won: 'Lost to competitor',
  other: 'Other reason'
};

export const SNOOZE_DURATION_LABELS: Record<SnoozeDuration, string> = {
  '1_day': '1 day',
  '3_days': '3 days',
  '1_week': '1 week',
  '2_weeks': '2 weeks',
  '1_month': '1 month',
  custom: 'Custom date'
};

// Helper type for opportunity type labels
export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  contract: 'Contract',
  milestone: 'Milestone',
  market: 'Market'
};

export const OPPORTUNITY_TYPE_DESCRIPTIONS: Record<OpportunityType, string> = {
  contract: 'Based on policy renewals, contract expirations, or contribution windows',
  milestone: 'Based on life events, birthdays, anniversaries, or personal milestones',
  market: 'Based on market conditions, product launches, or regulatory changes'
};

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  high: 'High Impact',
  medium: 'Medium Impact',
  low: 'Low Impact'
};

export const READINESS_LABELS: Record<ReadinessLevel, string> = {
  ready: 'Ready to Action',
  needs_prep: 'Needs Preparation',
  blocked: 'Blocked'
};

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  new: 'New',
  viewed: 'Viewed',
  snoozed: 'Snoozed',
  dismissed: 'Dismissed',
  actioned: 'Actioned'
};
