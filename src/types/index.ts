// Task types
export type {
  TaskStatus,
  AIActionType,
  TaskPriority,
  AICompletionData,
  Task,
  TaskSummary,
  TaskUpdate,
  TaskFilters
} from './task';

// Client types
export type {
  ClientStatus,
  ClientSegment,
  RiskProfile,
  Client,
  ClientSummary,
  ClientFilters
} from './client';
export { getClientFullName } from './client';

// Policy types
export type {
  PolicyStatus,
  PremiumFrequency,
  PaymentStatus,
  FundAllocation,
  Claim,
  Beneficiary,
  PolicyDocument,
  Policy,
  PolicySummary,
  PolicyFilters
} from './policy';

// Chat types
export type {
  MessageRole,
  CardType,
  Message,
  Card,
  TaskListCardData,
  TaskCardData,
  ClientCardData,
  ClientListCardData,
  PolicyCardData,
  PolicyListCardData,
  ReviewCardData,
  ConfirmationCardData,
  ContentSegment,
  ChatRequest,
  ChatContext,
  ChatResponse
} from './chat';

// State types
export type {
  ChatState,
  ChatContextValue,
  ChatAction
} from './state';
