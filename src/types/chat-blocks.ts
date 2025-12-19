// Chat Blocks Types - Phase 1: Core Infrastructure
// These types define UI blocks that can be rendered in chat responses

import type { Client, ClientWithDetails, ClientAsset, TimelineEvent } from './client';
import type { Workflow, PrefilledMaterial } from './task';
import type { Opportunity, OpportunityStats } from './opportunity';
import type { ActiveAutomation, AutomationSuggestion, AutomationException } from './automation';
import type { EntityType } from './tools';

/**
 * All supported block types
 */
export type BlockType =
  // Existing card types (from chat.ts)
  | 'task-list'
  | 'task'
  | 'client'
  | 'review'
  | 'confirmation'
  // Table/List blocks (new)
  | 'client-table'
  | 'opportunity-list'
  | 'automation-list'
  // Detail blocks (new)
  | 'client-profile'
  | 'opportunity-detail'
  | 'workflow-status'
  // Interactive blocks (new)
  | 'timeline'
  | 'chart'
  | 'confirm-action'
  | 'select-entity'
  // Export blocks (new)
  | 'export-download'
  // Utility blocks
  | 'text'
  | 'error';

/**
 * Base block interface
 */
export interface BaseBlock {
  /** Unique block ID */
  id: string;
  /** Block type */
  type: BlockType;
  /** When the block was created */
  createdAt: string;
}

// ============================================
// Table/List Block Data Interfaces
// ============================================

/**
 * Client table block - sortable list of clients
 */
export interface ClientTableBlockData {
  /** Title for the table */
  title: string;
  /** Clients to display */
  clients: Client[];
  /** Total count (for pagination) */
  totalCount: number;
  /** Current sort field */
  sortBy?: 'name' | 'portfolioValue' | 'riskProfile' | 'lastContact';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Show actions column */
  showActions?: boolean;
  /** Allow row click to view profile */
  clickable?: boolean;
}

/**
 * Opportunity list block - opportunity cards with actions
 */
export interface OpportunityListBlockData {
  /** Title for the list */
  title: string;
  /** Opportunities to display */
  opportunities: Opportunity[];
  /** Summary statistics */
  stats?: OpportunityStats;
  /** Show snooze/dismiss actions */
  showActions?: boolean;
  /** Group by type */
  groupByType?: boolean;
}

/**
 * Automation list block - automation status cards
 */
export interface AutomationListBlockData {
  /** Title for the list */
  title: string;
  /** Active automations */
  automations?: ActiveAutomation[];
  /** Suggestions */
  suggestions?: AutomationSuggestion[];
  /** Exceptions */
  exceptions?: AutomationException[];
  /** Show pause/resume actions */
  showActions?: boolean;
}

// ============================================
// Detail Block Data Interfaces
// ============================================

/**
 * Client profile block - full client details
 */
export interface ClientProfileBlockData {
  /** Client with all details */
  client: ClientWithDetails;
  /** Recent timeline events */
  recentActivity?: TimelineEvent[];
  /** Client assets */
  assets?: ClientAsset[];
  /** Show edit button */
  showEditAction?: boolean;
  /** Show create task button */
  showCreateTaskAction?: boolean;
}

/**
 * Opportunity detail block - full opportunity view
 */
export interface OpportunityDetailBlockData {
  /** Opportunity details */
  opportunity: Opportunity;
  /** Related client info */
  client?: Client;
  /** Suggested workflow to start */
  suggestedWorkflow?: string;
  /** Show action buttons */
  showActions?: boolean;
}

/**
 * Workflow status block - workflow progress
 */
export interface WorkflowStatusBlockData {
  /** Workflow details */
  workflow: Workflow;
  /** Related materials */
  materials?: PrefilledMaterial[];
  /** Show complete step action */
  showCompleteStepAction?: boolean;
  /** Progress percentage */
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// ============================================
// Interactive Block Data Interfaces
// ============================================

/**
 * Timeline block - activity history
 */
export interface TimelineBlockData {
  /** Title for the timeline */
  title: string;
  /** Timeline events */
  events: TimelineEvent[];
  /** Client name for context */
  clientName?: string;
  /** Show expand/collapse */
  collapsible?: boolean;
  /** Max events to show initially */
  initialLimit?: number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Chart block - bar/line/donut charts
 */
export interface ChartBlockData {
  /** Chart title */
  title: string;
  /** Chart type */
  chartType: 'bar' | 'line' | 'donut' | 'area';
  /** Chart datasets */
  datasets: ChartDataset[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Period selector options */
  periodOptions?: Array<'day' | 'week' | 'month' | 'quarter' | 'year'>;
  /** Currently selected period */
  selectedPeriod?: string;
}

/**
 * Confirm action block - confirmation for destructive actions
 */
export interface ConfirmActionBlockData {
  /** Action ID for reference */
  actionId: string;
  /** Action title */
  title: string;
  /** Detailed message */
  message: string;
  /** What will happen if confirmed */
  consequence: string;
  /** Severity level */
  severity: 'info' | 'warning' | 'danger';
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Entity being affected */
  affectedEntity?: {
    type: EntityType;
    id: string;
    name: string;
  };
}

/**
 * Select entity block - disambiguation picker
 */
export interface SelectEntityBlockData {
  /** Prompt message */
  prompt: string;
  /** Entity type being selected */
  entityType: EntityType;
  /** Options to choose from */
  options: Array<{
    id: string;
    displayName: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }>;
  /** Allow multiple selection */
  multiSelect?: boolean;
  /** Action to perform after selection */
  pendingAction: string;
}

// ============================================
// Export Block Data Interfaces
// ============================================

/**
 * Export download block - file download link
 */
export interface ExportDownloadBlockData {
  /** File name */
  fileName: string;
  /** File format */
  format: 'csv' | 'json' | 'pdf';
  /** Download URL (blob URL) */
  downloadUrl: string;
  /** File size in bytes */
  fileSize: number;
  /** Record count */
  recordCount: number;
  /** When the export was generated */
  generatedAt: string;
  /** When the download link expires */
  expiresAt?: string;
  /** Entity type exported */
  entityType: EntityType;
}

// ============================================
// Utility Block Data Interfaces
// ============================================

/**
 * Text block - plain text content
 */
export interface TextBlockData {
  /** Text content */
  content: string;
  /** Format */
  format?: 'plain' | 'markdown';
}

/**
 * Error block - error display
 */
export interface ErrorBlockData {
  /** Error title */
  title: string;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Suggested action */
  suggestion?: string;
  /** Retry action */
  retryAction?: string;
}

// ============================================
// Block Union Type
// ============================================

/**
 * All block types with their data
 */
export type Block =
  | (BaseBlock & { type: 'client-table'; data: ClientTableBlockData })
  | (BaseBlock & { type: 'opportunity-list'; data: OpportunityListBlockData })
  | (BaseBlock & { type: 'automation-list'; data: AutomationListBlockData })
  | (BaseBlock & { type: 'client-profile'; data: ClientProfileBlockData })
  | (BaseBlock & { type: 'opportunity-detail'; data: OpportunityDetailBlockData })
  | (BaseBlock & { type: 'workflow-status'; data: WorkflowStatusBlockData })
  | (BaseBlock & { type: 'timeline'; data: TimelineBlockData })
  | (BaseBlock & { type: 'chart'; data: ChartBlockData })
  | (BaseBlock & { type: 'confirm-action'; data: ConfirmActionBlockData })
  | (BaseBlock & { type: 'select-entity'; data: SelectEntityBlockData })
  | (BaseBlock & { type: 'export-download'; data: ExportDownloadBlockData })
  | (BaseBlock & { type: 'text'; data: TextBlockData })
  | (BaseBlock & { type: 'error'; data: ErrorBlockData });

/**
 * Helper type to get block data by type
 */
export type BlockDataByType = {
  'client-table': ClientTableBlockData;
  'opportunity-list': OpportunityListBlockData;
  'automation-list': AutomationListBlockData;
  'client-profile': ClientProfileBlockData;
  'opportunity-detail': OpportunityDetailBlockData;
  'workflow-status': WorkflowStatusBlockData;
  'timeline': TimelineBlockData;
  'chart': ChartBlockData;
  'confirm-action': ConfirmActionBlockData;
  'select-entity': SelectEntityBlockData;
  'export-download': ExportDownloadBlockData;
  'text': TextBlockData;
  'error': ErrorBlockData;
};

/**
 * Block render options
 */
export interface BlockRenderOptions {
  /** Whether the block should be collapsible */
  collapsible?: boolean;
  /** Whether the block is initially collapsed */
  initiallyCollapsed?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: number;
  /** Custom class names */
  className?: string;
}
