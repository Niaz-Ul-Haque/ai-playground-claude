// Task types
export type {
  TaskStatus,
  AIActionType,
  Task,
  TaskSummary,
  TaskFilters,
  SuggestedActionType,
  SuggestedAction,
  WorkflowType,
  WorkflowStep,
  Workflow,
  RecommendationType,
  ProcessRecommendation,
  CycleTimeStats,
  MaterialType,
  PrefilledMaterial,
  ChecklistItem,
  TaskStats
} from './task';

// Client types
export type {
  RiskProfile,
  Client,
  ClientSummary,
  RelationshipType,
  ClientRelationship,
  TimelineEventType,
  TimelineEvent,
  ArtifactType,
  ArtifactVersion,
  Artifact,
  AssetType,
  AssetStatus,
  AlertSeverity,
  AlertType,
  AssetAlert,
  ClientAsset,
  ClientWithDetails
} from './client';

// Chat types
export type {
  MessageRole,
  CardType,
  Message,
  Card,
  TaskListCardData,
  TaskCardData,
  ClientCardData,
  ReviewCardData,
  ConfirmationCardData,
  ContentSegment
} from './chat';

// Intent types
export type {
  UserIntent,
  ExtractedEntities,
  IntentClassification
} from './intent';

// State types
export type {
  ChatState,
  ChatContext,
  ChatAction
} from './state';

// Session types
export type {
  User,
  Session,
  ChatSession,
  SessionState,
  SessionContextType,
  SessionAction
} from './session';

// Opportunity types
export type {
  OpportunityType,
  OpportunityStatus,
  ReadinessLevel,
  ImpactLevel,
  OpportunitySourceType,
  Opportunity,
  OpportunityFilters,
  OpportunityStats,
  SnoozeDuration,
  SnoozeOptions,
  DismissReason
} from './opportunity';

export {
  DISMISS_REASON_LABELS,
  SNOOZE_DURATION_LABELS,
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_DESCRIPTIONS,
  IMPACT_LEVEL_LABELS,
  READINESS_LABELS,
  STATUS_LABELS
} from './opportunity';

// Review Queue types
export type {
  ReviewSourceType,
  ConfidenceLevel,
  ReviewItemStatus,
  ReviewItemType,
  ExtractedField,
  ReviewQueueItem,
  AlternativeMatch,
  ReviewFeedback,
  ReviewQueueStats,
  ReviewQueueFilters,
  BatchOperation,
  BatchOperationResult,
  ComparisonData
} from './review-queue';

export {
  REVIEW_SOURCE_LABELS,
  REVIEW_ITEM_TYPE_LABELS,
  CONFIDENCE_LEVEL_LABELS,
  REVIEW_STATUS_LABELS
} from './review-queue';

// Import types
export type {
  ImportStep,
  ImportFileType,
  ImportEntityType,
  ImportStatus,
  ParsedFile,
  SourceColumn,
  TargetField,
  FieldMapping,
  DataTransform,
  ValidationRule,
  ValidationError,
  RowValidation,
  ValidationSummary,
  ImportOptions,
  ImportRowResult,
  ImportResults,
  ImportSession
} from './import';

export {
  TARGET_FIELDS,
  IMPORT_STEP_LABELS,
  IMPORT_ENTITY_LABELS,
  IMPORT_FILE_TYPE_LABELS
} from './import';

// Integration types
export type {
  IntegrationProvider,
  IntegrationCategory,
  IntegrationStatus,
  Integration,
  AvailableIntegration,
  SyncLogEntry,
  SyncError,
  IntegrationStats,
  IntegrationFilters,
  OAuthFlowState,
  ExportFormat,
  ExportScope,
  ExportOptions,
  ExportResult
} from './integration';

export {
  INTEGRATION_PROVIDER_LABELS,
  INTEGRATION_CATEGORY_LABELS,
  INTEGRATION_STATUS_LABELS,
  EXPORT_FORMAT_LABELS,
  EXPORT_SCOPE_LABELS,
  PROVIDER_ICONS,
  PROVIDER_COLORS
} from './integration';

// Automation types
export type {
  AutomationSuggestionStatus,
  ActiveAutomationStatus,
  AutomationExceptionStatus,
  AdaptationLogType,
  AutomationTriggerType,
  AutomationActionType,
  AutomationCategory,
  AutomationSuggestion,
  SafetyBounds,
  AutomationRunEntry,
  ActiveAutomation,
  AutomationException,
  AdaptationLogEntry,
  AutomationActivityEntry,
  AutomationStats,
  AutomationFilters,
  ExceptionFilters
} from './automation';

export {
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_STATUS_LABELS,
  SUGGESTION_STATUS_LABELS,
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_SEVERITY_LABELS,
  ADAPTATION_TYPE_LABELS,
  DAYS_OF_WEEK,
  DAY_LABELS
} from './automation';

// Analytics types
export type {
  KPITrend,
  KPIMetric,
  KPICategory,
  TimeSeriesDataPoint,
  ChartDataset,
  ChartType,
  ChartConfig,
  TimePeriod,
  DashboardInsight,
  InsightSeverity,
  FocusRecommendation,
  FocusPriority,
  ClientMetrics,
  RevenueMetrics,
  PipelineMetrics,
  PerformanceMetrics,
  DashboardFilters,
  SavedView
} from './analytics';

export {
  KPI_CATEGORY_LABELS,
  TIME_PERIOD_LABELS,
  FOCUS_PRIORITY_LABELS
} from './analytics';

// Activity types
export type {
  ActivityType,
  ActivityCategory,
  ActivityActor,
  ActivityEntry,
  ActivityFilters,
  ActivityStats,
  ActivityGroup
} from './activity';

export {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_CATEGORY_LABELS
} from './activity';

// Settings types
export type {
  UserProfile,
  SecuritySettings,
  ActiveSession,
  LoginHistoryEntry,
  NotificationPreference,
  NotificationSettings,
  NotificationCategory,
  PreferenceSettings,
  Theme,
  DateFormat,
  TimeFormat,
  Currency,
  Product,
  ProductCategory,
  MarketCondition,
  ProductSettings,
  TeamMember,
  TeamRole,
  TeamInvitation,
  TeamSettings,
  UsageMetrics,
  BillingHistoryEntry,
  PaymentMethod,
  BillingSettings,
  PlanTier,
  AllSettings,
  SettingsSection
} from './settings';

export {
  NOTIFICATION_CATEGORY_LABELS,
  THEME_LABELS,
  DATE_FORMAT_LABELS,
  TIME_FORMAT_LABELS,
  CURRENCY_LABELS,
  PRODUCT_CATEGORY_LABELS,
  TEAM_ROLE_LABELS,
  PLAN_TIER_LABELS,
  SETTINGS_SECTION_LABELS
} from './settings';
