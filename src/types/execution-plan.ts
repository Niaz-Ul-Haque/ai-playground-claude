// Execution Plan Types - Phase 1: Core Infrastructure
// These types define how user intents are translated into tool executions

import type { EntityType, ToolRenderBlock } from './tools';

/**
 * Categories of user intents
 */
export type IntentCategory =
  // Data operations
  | 'read'        // View/list data
  | 'search'      // Search for data
  | 'create'      // Create new records
  | 'update'      // Update records
  | 'delete'      // Delete/archive records
  // Analytics
  | 'summarize'   // Get summary/overview
  | 'report'      // Generate report
  | 'export'      // Export data
  // Workflow operations
  | 'workflow'    // Workflow operations
  | 'automation'  // Automation operations
  | 'integration' // Integration operations
  // Utility
  | 'help'        // Help/guidance
  | 'general'     // General conversation
  | 'confirm'     // Confirm pending action
  | 'cancel'      // Cancel pending action
  | 'undo';       // Undo last action

/**
 * Confidence levels for intent classification
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Information needed to clarify ambiguous requests
 */
export interface ClarificationNeeded {
  /** The field/parameter that needs clarification */
  field: string;
  /** Why clarification is needed */
  reason: string;
  /** Possible options to choose from */
  options?: string[];
  /** Question to ask the user */
  question: string;
}

/**
 * When multiple entities match a query
 */
export interface MultiMatch {
  /** The type of entity that matched */
  entityType: EntityType;
  /** The matches found */
  matches: Array<{
    id: string;
    displayName: string;
    summary: string;
    score?: number;
  }>;
  /** Why disambiguation is needed */
  reason: string;
}

/**
 * The execution plan created from user intent
 */
export interface ExecutionPlan {
  /** The classified intent category */
  intent: IntentCategory;
  /** The entity type being operated on (if applicable) */
  entity?: EntityType;
  /** The tool to execute */
  tool: string;
  /** Arguments to pass to the tool */
  arguments: Record<string, unknown>;
  /** How to render the result */
  renderAs: ToolRenderBlock;
  /** Whether user confirmation is required before execution */
  requiresConfirmation: boolean;
  /** Confidence in this classification (0-1) */
  confidence: number;
  /** Confidence level category */
  confidenceLevel: ConfidenceLevel;
  /** If clarification is needed before execution */
  clarificationNeeded?: ClarificationNeeded;
  /** If multiple entities matched the query */
  multiMatch?: MultiMatch;
  /** Raw extracted entities from the message */
  extractedEntities?: ExtractedEntities;
  /** The original user message */
  originalMessage: string;
  /** Alternative interpretations */
  alternatives?: Array<{
    tool: string;
    confidence: number;
    description: string;
  }>;
}

/**
 * Entities extracted from user message
 */
export interface ExtractedEntities {
  /** Client names mentioned */
  clientNames?: string[];
  /** Client IDs resolved */
  clientIds?: string[];
  /** Task titles mentioned */
  taskTitles?: string[];
  /** Task IDs resolved */
  taskIds?: string[];
  /** Dates mentioned */
  dates?: Array<{
    raw: string;
    parsed: string;
    type: 'absolute' | 'relative';
  }>;
  /** Numbers/amounts mentioned */
  numbers?: number[];
  /** Priorities mentioned */
  priorities?: Array<'high' | 'medium' | 'low'>;
  /** Statuses mentioned */
  statuses?: string[];
  /** Actions mentioned (verbs) */
  actions?: string[];
  /** References to previous context */
  references?: Array<{
    type: 'it' | 'that' | 'this' | 'them' | 'those';
    resolvedTo?: string;
    resolvedType?: EntityType;
  }>;
}

/**
 * Result of intent classification
 */
export interface IntentClassificationResult {
  /** The execution plan */
  plan: ExecutionPlan;
  /** Whether the plan is ready for execution */
  readyForExecution: boolean;
  /** Message to display before execution (for confirmation) */
  confirmationMessage?: string;
  /** If user input is needed */
  needsUserInput?: boolean;
  /** Prompt to show the user */
  userPrompt?: string;
}

/**
 * Pending action waiting for confirmation
 */
export interface PendingAction {
  /** Unique ID for this pending action */
  id: string;
  /** The execution plan waiting for confirmation */
  plan: ExecutionPlan;
  /** When this action was created */
  createdAt: string;
  /** When this action expires */
  expiresAt: string;
  /** Confirmation message shown to user */
  message: string;
}

/**
 * Context for intent routing
 */
export interface IntentRoutingContext {
  /** Current focused entity IDs */
  focusedClientId?: string;
  focusedTaskId?: string;
  focusedOpportunityId?: string;
  /** Last classified intent */
  lastIntent?: IntentCategory;
  /** Last tool executed */
  lastTool?: string;
  /** Last entity type accessed */
  lastEntityType?: EntityType;
  /** Pending action awaiting confirmation */
  pendingAction?: PendingAction;
  /** Recent entity mentions for reference resolution */
  recentEntities?: Array<{
    id: string;
    type: EntityType;
    name: string;
    mentionedAt: string;
  }>;
}

/**
 * History entry for intent classification
 */
export interface IntentHistoryEntry {
  /** Timestamp */
  timestamp: string;
  /** User message */
  message: string;
  /** Classified intent */
  intent: IntentCategory;
  /** Tool executed */
  tool: string;
  /** Whether execution was successful */
  success: boolean;
  /** Confidence score */
  confidence: number;
}
