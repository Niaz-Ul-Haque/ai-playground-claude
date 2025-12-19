// Tool System Types - Phase 1: Core Infrastructure
// These types define the tool system for the chat interactive feature

/**
 * Categories of tools available in the system
 */
export type ToolCategory =
  | 'read'        // Read/query operations
  | 'create'      // Create new entities
  | 'update'      // Update existing entities
  | 'delete'      // Delete/archive entities
  | 'report'      // Generate reports/summaries
  | 'export'      // Export data to files
  | 'workflow'    // Workflow operations
  | 'integration';// Integration operations

/**
 * Entity types that tools can operate on
 */
export type EntityType =
  | 'client'
  | 'task'
  | 'opportunity'
  | 'workflow'
  | 'automation'
  | 'integration'
  | 'activity'
  | 'material';

/**
 * Parameter types supported by tools
 */
export type ToolParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'array'
  | 'object';

/**
 * Defines a single parameter for a tool
 */
export interface ToolParameter {
  /** Parameter name (used in arguments) */
  name: string;
  /** Type of the parameter */
  type: ToolParameterType;
  /** Human-readable description */
  description: string;
  /** Whether the parameter is required */
  required: boolean;
  /** Possible values for enum types */
  enumValues?: string[];
  /** Default value if not provided */
  defaultValue?: unknown;
  /** For array types, the type of items */
  itemType?: ToolParameterType;
}

/**
 * Block types for rendering tool results
 */
export type ToolRenderBlock =
  // Existing card types
  | 'task-list'
  | 'task'
  | 'client'
  | 'review'
  | 'confirmation'
  // Table/List blocks
  | 'client-table'
  | 'opportunity-list'
  | 'automation-list'
  // Detail blocks
  | 'client-profile'
  | 'opportunity-detail'
  | 'workflow-status'
  // Interactive blocks
  | 'timeline'
  | 'chart'
  | 'confirm-action'
  | 'select-entity'
  // Export blocks
  | 'export-download'
  // Text-only
  | 'text';

/**
 * Complete definition of a tool
 */
export interface ToolDefinition {
  /** Unique tool name (snake_case) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Tool category */
  category: ToolCategory;
  /** Entity type this tool operates on (optional) */
  entityType?: EntityType;
  /** Tool parameters */
  parameters: ToolParameter[];
  /** Whether this tool requires user confirmation before execution */
  requiresConfirmation: boolean;
  /** What UI block to render the result as */
  renderAs: ToolRenderBlock;
  /** Example user messages that would trigger this tool */
  examples: string[];
  /** Tags for search/filtering */
  tags?: string[];
}

/**
 * Result of a tool execution
 */
export interface ToolResult<T = unknown> {
  /** Whether the tool executed successfully */
  success: boolean;
  /** The data returned by the tool */
  data?: T;
  /** Error message if execution failed */
  error?: string;
  /** The tool that was executed */
  toolName: string;
  /** Arguments passed to the tool */
  arguments: Record<string, unknown>;
  /** How to render the result */
  renderAs: ToolRenderBlock;
  /** Optional message to display */
  message?: string;
  /** Whether this operation can be undone */
  undoable?: boolean;
  /** Undo action identifier */
  undoAction?: string;
  // Phase 5: Safety Pattern Properties
  /** Whether the request was rate limited */
  rateLimited?: boolean;
  /** When the rate limit resets */
  rateLimitResetAt?: string;
  /** Whether confirmation is required */
  confirmationRequired?: boolean;
  /** Pending confirmation ID */
  confirmationId?: string;
}

/**
 * Handler function type for tool execution
 */
export type ToolHandler<T = unknown> = (
  args: Record<string, unknown>
) => Promise<ToolResult<T>> | ToolResult<T>;

/**
 * Registry of all available tools
 */
export interface ToolRegistry {
  /** Map of tool names to their definitions */
  tools: Map<string, ToolDefinition>;
  /** Map of tool names to their handlers */
  handlers: Map<string, ToolHandler>;
  /** Get tool by name */
  getTool: (name: string) => ToolDefinition | undefined;
  /** Get all tools */
  getAllTools: () => ToolDefinition[];
  /** Get tools by category */
  getToolsByCategory: (category: ToolCategory) => ToolDefinition[];
  /** Get tools by entity type */
  getToolsByEntity: (entityType: EntityType) => ToolDefinition[];
  /** Execute a tool */
  execute: (name: string, args: Record<string, unknown>) => Promise<ToolResult>;
}

/**
 * Tool validation result
 */
export interface ToolValidationResult {
  /** Whether the arguments are valid */
  valid: boolean;
  /** Validation errors */
  errors: Array<{
    parameter: string;
    message: string;
  }>;
  /** Sanitized/coerced arguments */
  sanitizedArgs?: Record<string, unknown>;
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  /** Current focused entity IDs */
  focusedClientId?: string;
  focusedTaskId?: string;
  focusedOpportunityId?: string;
  /** Last intent for context */
  lastIntent?: string;
  /** User ID for audit */
  userId?: string;
  /** Session ID */
  sessionId?: string;
}
