// Response Builder V2 - Phase 1 & 5: Core Infrastructure + Safety Patterns
// Builds chat responses from tool execution results with enhanced confirmations

import type { ToolResult } from '@/types/tools';
import type { ExecutionPlan } from '@/types/execution-plan';
import type {
  Block,
  ClientTableBlockData,
  OpportunityListBlockData,
  ClientProfileBlockData,
  OpportunityDetailBlockData,
  WorkflowStatusBlockData,
  TimelineBlockData,
  ChartBlockData,
  ConfirmActionBlockData,
  SelectEntityBlockData,
  ExportDownloadBlockData,
  ErrorBlockData,
  AutomationListBlockData,
} from '@/types/chat-blocks';
import type { Card } from '@/types/chat';
import type { Client, ClientWithDetails, TimelineEvent } from '@/types/client';
import type { Task, TaskSummary, Workflow } from '@/types/task';
import type { Opportunity, OpportunityStats } from '@/types/opportunity';
import type { ActiveAutomation, AutomationSuggestion } from '@/types/automation';
import type { ActivityEntry } from '@/types/activity';
import { canUndo, getUndoDescription } from './tool-executor';
import {
  getConfirmationConfig,
  type ActionSeverity,
} from '@/lib/chat/confirmation-manager';

// ============================================
// Response Types
// ============================================

export interface ChatResponse {
  /** Text content of the response */
  text: string;
  /** UI blocks to render */
  blocks: Block[];
  /** Legacy cards for backward compatibility */
  cards: Card[];
  /** Context updates */
  contextUpdates: {
    focusedClientId?: string;
    focusedTaskId?: string;
    focusedOpportunityId?: string;
    tasksUpdated?: boolean;
    clientsUpdated?: boolean;
  };
  /** Whether undo is available */
  undoAvailable: boolean;
  /** Undo description */
  undoDescription?: string;
}

// ============================================
// Text Generation
// ============================================

/**
 * Generate conversational text for tool results
 */
function generateResponseText(
  plan: ExecutionPlan,
  result: ToolResult,
): string {
  if (!result.success) {
    return `I couldn't complete that request. ${result.error || 'Please try again.'}`;
  }

  // Use the result's message if available
  if (result.message) {
    return result.message;
  }

  // Generate based on intent and tool
  switch (plan.intent) {
    case 'read':
      return generateReadText(plan, result);
    case 'search':
      return generateSearchText(plan, result);
    case 'create':
      return generateCreateText(plan, result);
    case 'update':
      return generateUpdateText(plan, result);
    case 'delete':
      return generateDeleteText(plan);
    case 'report':
      return generateReportText(plan, result);
    case 'export':
      return generateExportText(plan, result);
    default:
      return 'Here\'s what I found:';
  }
}

function generateReadText(plan: ExecutionPlan, result: ToolResult): string {
  const data = result.data;

  switch (plan.tool) {
    case 'list_clients': {
      const clients = data as Client[];
      if (clients.length === 0) {
        return 'No clients found matching your criteria.';
      }
      return `Found ${clients.length} client${clients.length !== 1 ? 's' : ''}:`;
    }

    case 'get_client': {
      const client = data as ClientWithDetails;
      if (!client) {
        return 'Client not found.';
      }
      return `Here's ${client.name}'s profile:`;
    }

    case 'list_tasks': {
      const tasks = data as Task[];
      if (tasks.length === 0) {
        return 'No tasks found. Your schedule is clear!';
      }
      const dueToday = tasks.filter(t => {
        const today = new Date().toDateString();
        return new Date(t.dueDate).toDateString() === today;
      }).length;
      if (dueToday > 0) {
        return `You have ${tasks.length} task${tasks.length !== 1 ? 's' : ''}, ${dueToday} due today:`;
      }
      return `Found ${tasks.length} task${tasks.length !== 1 ? 's' : ''}:`;
    }

    case 'get_task': {
      const task = data as Task;
      if (!task) {
        return 'Task not found.';
      }
      return `Here's the ${task.title} task:`;
    }

    case 'list_opportunities': {
      const opps = data as Opportunity[];
      if (opps.length === 0) {
        return 'No opportunities found.';
      }
      const newOpps = opps.filter(o => o.status === 'new').length;
      if (newOpps > 0) {
        return `Found ${opps.length} opportunities, ${newOpps} new:`;
      }
      return `Found ${opps.length} opportunities:`;
    }

    case 'get_opportunity': {
      const opp = data as Opportunity;
      if (!opp) {
        return 'Opportunity not found.';
      }
      return `Here's the ${opp.title} opportunity:`;
    }

    case 'list_workflows': {
      const workflows = data as Workflow[];
      if (workflows.length === 0) {
        return 'No active workflows found.';
      }
      return `Found ${workflows.length} workflow${workflows.length !== 1 ? 's' : ''}:`;
    }

    case 'list_automations': {
      const automationData = data as { automations?: ActiveAutomation[]; suggestions?: AutomationSuggestion[] };
      const total = (automationData.automations?.length || 0) + (automationData.suggestions?.length || 0);
      if (total === 0) {
        return 'No automations found.';
      }
      return `Found ${total} automation${total !== 1 ? 's' : ''}:`;
    }

    case 'get_activity_feed': {
      const activities = data as ActivityEntry[];
      if (activities.length === 0) {
        return 'No recent activity found.';
      }
      return `Here's your recent activity (${activities.length} items):`;
    }

    default:
      return 'Here\'s what I found:';
  }
}

function generateSearchText(plan: ExecutionPlan, result: ToolResult): string {
  const query = plan.arguments.query || plan.arguments.searchTerm || '';
  const data = result.data as unknown[];

  if (!data || data.length === 0) {
    return `No results found for "${query}".`;
  }

  return `Found ${data.length} result${data.length !== 1 ? 's' : ''} for "${query}":`;
}

function generateCreateText(plan: ExecutionPlan, result: ToolResult): string {
  switch (plan.tool) {
    case 'create_task': {
      const task = result.data as Task;
      return `Created task "${task.title}". ${task.dueDate ? `Due: ${formatDate(task.dueDate)}` : ''}`;
    }
    case 'create_opportunity': {
      const opp = result.data as Opportunity;
      return `Created opportunity "${opp.title}" for ${opp.clientName}.`;
    }
    case 'create_client': {
      const client = result.data as Client;
      return `Created client record for ${client.name}.`;
    }
    case 'start_workflow': {
      const workflow = result.data as Workflow;
      return `Started ${workflow.name}. I'll guide you through each step.`;
    }
    default:
      return 'Created successfully.';
  }
}

function generateUpdateText(plan: ExecutionPlan, result: ToolResult): string {
  switch (plan.tool) {
    case 'complete_task': {
      const task = result.data as Task;
      return `Marked "${task?.title || 'task'}" as complete. Nice work!`;
    }
    case 'approve_task': {
      const task = result.data as Task;
      return `Approved "${task?.title || 'task'}". The action has been executed.`;
    }
    case 'reject_task': {
      const task = result.data as Task;
      return `Rejected "${task?.title || 'task'}". It's been reverted to pending.`;
    }
    case 'snooze_opportunity': {
      const opp = result.data as Opportunity;
      return `Snoozed "${opp?.title || 'opportunity'}". I'll remind you when it's time.`;
    }
    case 'dismiss_opportunity': {
      const opp = result.data as Opportunity;
      return `Dismissed "${opp?.title || 'opportunity'}". Removed from your pipeline.`;
    }
    case 'pause_automation': {
      const auto = result.data as ActiveAutomation;
      return `Paused "${auto?.name || 'automation'}". You can resume it anytime.`;
    }
    case 'resume_automation': {
      const auto = result.data as ActiveAutomation;
      return `Resumed "${auto?.name || 'automation'}". It's now running again.`;
    }
    default:
      return 'Updated successfully.';
  }
}

function generateDeleteText(plan: ExecutionPlan): string {
  switch (plan.tool) {
    case 'delete_task':
      return 'Task deleted. You can undo this if needed.';
    case 'archive_client':
      return 'Client archived. They\'ve been moved to inactive.';
    case 'archive_opportunity':
      return 'Opportunity archived. Removed from your active pipeline.';
    default:
      return 'Deleted successfully.';
  }
}

function generateReportText(plan: ExecutionPlan, result: ToolResult): string {
  switch (plan.tool) {
    case 'get_pipeline_summary': {
      const data = result.data as { stats: OpportunityStats };
      return `Your pipeline has ${data.stats.total} opportunities worth $${data.stats.totalEstimatedValue.toLocaleString()}. ${data.stats.expiringThisWeek} expiring this week.`;
    }
    case 'get_workload_summary': {
      const stats = result.data as { dueToday: number; overdue: number; total: number };
      return `You have ${stats.dueToday} tasks due today and ${stats.overdue} overdue out of ${stats.total} total.`;
    }
    case 'get_client_stats': {
      const stats = result.data as { totalClients: number; totalAUM: number };
      return `You have ${stats.totalClients} clients with $${stats.totalAUM.toLocaleString()} in total AUM.`;
    }
    default:
      return 'Here\'s your summary:';
  }
}

function generateExportText(plan: ExecutionPlan, result: ToolResult): string {
  const data = result.data as { recordCount: number; format: string };
  return `Exported ${data.recordCount} records to ${data.format.toUpperCase()}. Click below to download.`;
}

// ============================================
// Block Generation
// ============================================

/**
 * Generate UI blocks from tool result
 */
function generateBlocks(
  plan: ExecutionPlan,
  result: ToolResult
): Block[] {
  if (!result.success || !result.data) {
    // Return error block
    return [{
      id: `block-${Date.now()}`,
      type: 'error',
      createdAt: new Date().toISOString(),
      data: {
        title: 'Error',
        message: result.error || 'An error occurred',
        suggestion: 'Please try again or rephrase your request.',
      },
    } as Block];
  }

  const renderAs = result.renderAs || plan.renderAs;
  const blocks: Block[] = [];

  switch (renderAs) {
    case 'client-table':
      blocks.push(createClientTableBlock(result.data as Client[]));
      break;

    case 'client-profile':
      blocks.push(createClientProfileBlock(result.data as ClientWithDetails));
      break;

    case 'task-list':
      // For backward compatibility, we return both blocks and cards
      break;

    case 'task':
      // For backward compatibility
      break;

    case 'opportunity-list':
      blocks.push(createOpportunityListBlock(result.data as Opportunity[]));
      break;

    case 'opportunity-detail':
      blocks.push(createOpportunityDetailBlock(result.data as Opportunity));
      break;

    case 'workflow-status':
      blocks.push(createWorkflowStatusBlock(result.data as Workflow));
      break;

    case 'automation-list':
      blocks.push(createAutomationListBlock(result.data as { automations?: ActiveAutomation[]; suggestions?: AutomationSuggestion[] }));
      break;

    case 'timeline':
      blocks.push(createTimelineBlock(result.data as ActivityEntry[]));
      break;

    case 'chart':
      blocks.push(createChartBlock(plan.tool, result.data));
      break;

    case 'confirm-action':
      blocks.push(createConfirmActionBlock(plan));
      break;

    case 'select-entity':
      // Handle disambiguation
      if (plan.multiMatch) {
        blocks.push(createSelectEntityBlock(plan));
      }
      break;

    case 'export-download':
      blocks.push(createExportDownloadBlock(plan.tool, result.data as {
        content: string;
        format: string;
        recordCount: number;
        fileName?: string;
        fileSize?: number;
        downloadUrl?: string;
        generatedAt?: string;
      }));
      break;

    case 'confirmation':
      // Text-only confirmation, no special block
      break;
  }

  return blocks;
}

function createClientTableBlock(clients: Client[]): Block {
  const data: ClientTableBlockData = {
    title: 'Clients',
    clients,
    totalCount: clients.length,
    showActions: true,
    clickable: true,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'client-table',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createClientProfileBlock(client: ClientWithDetails): Block {
  const data: ClientProfileBlockData = {
    client,
    recentActivity: client.timeline?.slice(0, 5),
    assets: client.assets,
    showEditAction: true,
    showCreateTaskAction: true,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'client-profile',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createOpportunityListBlock(opportunities: Opportunity[]): Block {
  const data: OpportunityListBlockData = {
    title: 'Opportunities',
    opportunities,
    showActions: true,
    groupByType: false,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'opportunity-list',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createOpportunityDetailBlock(opportunity: Opportunity): Block {
  const data: OpportunityDetailBlockData = {
    opportunity,
    showActions: true,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'opportunity-detail',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createWorkflowStatusBlock(workflow: Workflow & { progress?: { completed: number; total: number; percentage: number } }): Block {
  const data: WorkflowStatusBlockData = {
    workflow,
    showCompleteStepAction: true,
    progress: workflow.progress || {
      completed: workflow.steps?.filter(s => s.status === 'completed').length || 0,
      total: workflow.steps?.length || 0,
      percentage: 0,
    },
  };
  data.progress.percentage = data.progress.total > 0
    ? Math.round((data.progress.completed / data.progress.total) * 100)
    : 0;

  return {
    id: `block-${Date.now()}`,
    type: 'workflow-status',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createAutomationListBlock(data: { automations?: ActiveAutomation[]; suggestions?: AutomationSuggestion[] }): Block {
  const blockData: AutomationListBlockData = {
    title: 'Automations',
    automations: data.automations,
    suggestions: data.suggestions,
    showActions: true,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'automation-list',
    createdAt: new Date().toISOString(),
    data: blockData,
  } as Block;
}

function createTimelineBlock(activities: ActivityEntry[]): Block {
  const events: TimelineEvent[] = activities.map(a => ({
    id: a.id,
    clientId: a.clientId || '',
    type: a.type as TimelineEvent['type'],
    title: a.title,
    description: a.description,
    timestamp: a.timestamp,
  }));

  const data: TimelineBlockData = {
    title: 'Recent Activity',
    events,
    collapsible: true,
    initialLimit: 10,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'timeline',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createChartBlock(tool: string, data: unknown): Block {
  const chartData: ChartBlockData = {
    title: 'Summary',
    chartType: 'bar',
    datasets: [],
    showLegend: true,
  };

  switch (tool) {
    case 'get_pipeline_summary': {
      const pipelineData = data as { stats: OpportunityStats; opportunities: Opportunity[] };
      chartData.title = 'Pipeline Summary';
      chartData.chartType = 'bar';
      chartData.datasets = [{
        label: 'Opportunities by Status',
        data: [
          { label: 'New', value: pipelineData.stats.byStatus.new, color: '#3b82f6' },
          { label: 'Viewed', value: pipelineData.stats.byStatus.viewed, color: '#8b5cf6' },
          { label: 'Snoozed', value: pipelineData.stats.byStatus.snoozed, color: '#f59e0b' },
          { label: 'Actioned', value: pipelineData.stats.byStatus.actioned, color: '#10b981' },
        ],
      }];
      break;
    }

    case 'get_workload_summary': {
      const taskStats = data as { pending: number; inProgress: number; needsReview: number; completed: number };
      chartData.title = 'Task Workload';
      chartData.chartType = 'donut';
      chartData.datasets = [{
        label: 'Tasks by Status',
        data: [
          { label: 'Pending', value: taskStats.pending, color: '#6b7280' },
          { label: 'In Progress', value: taskStats.inProgress, color: '#3b82f6' },
          { label: 'Needs Review', value: taskStats.needsReview, color: '#f59e0b' },
          { label: 'Completed', value: taskStats.completed, color: '#10b981' },
        ],
      }];
      break;
    }

    case 'get_client_stats': {
      const clientStats = data as { byRiskProfile: { conservative: number; moderate: number; aggressive: number } };
      chartData.title = 'Clients by Risk Profile';
      chartData.chartType = 'donut';
      chartData.datasets = [{
        label: 'Risk Profile Distribution',
        data: [
          { label: 'Conservative', value: clientStats.byRiskProfile.conservative, color: '#10b981' },
          { label: 'Moderate', value: clientStats.byRiskProfile.moderate, color: '#3b82f6' },
          { label: 'Aggressive', value: clientStats.byRiskProfile.aggressive, color: '#ef4444' },
        ],
      }];
      break;
    }

    case 'get_opportunity_stats': {
      const oppStats = data as OpportunityStats;
      chartData.title = 'Opportunities by Impact';
      chartData.chartType = 'bar';
      chartData.datasets = [{
        label: 'Impact Level',
        data: [
          { label: 'High', value: oppStats.byImpact.high, color: '#ef4444' },
          { label: 'Medium', value: oppStats.byImpact.medium, color: '#f59e0b' },
          { label: 'Low', value: oppStats.byImpact.low, color: '#10b981' },
        ],
      }];
      break;
    }

    case 'get_task_stats': {
      const stats = data as { byPriority: { high: number; medium: number; low: number } };
      chartData.title = 'Tasks by Priority';
      chartData.chartType = 'bar';
      chartData.datasets = [{
        label: 'Priority',
        data: [
          { label: 'High', value: stats.byPriority.high, color: '#ef4444' },
          { label: 'Medium', value: stats.byPriority.medium, color: '#f59e0b' },
          { label: 'Low', value: stats.byPriority.low, color: '#10b981' },
        ],
      }];
      break;
    }
  }

  return {
    id: `block-${Date.now()}`,
    type: 'chart',
    createdAt: new Date().toISOString(),
    data: chartData,
  } as Block;
}

function createConfirmActionBlock(plan: ExecutionPlan, entityName?: string, entityId?: string): Block {
  // Phase 5: Get configuration from confirmation manager
  const config = getConfirmationConfig(plan.tool);

  // Determine severity
  let severity: ActionSeverity = 'warning';
  if (plan.tool.includes('delete') || plan.tool.includes('archive')) {
    severity = 'danger';
  } else if (config?.severity) {
    severity = config.severity;
  }

  // Build message
  let message = `Are you sure you want to ${plan.tool.replace(/_/g, ' ')}?`;
  if (config?.messageTemplate && entityName) {
    message = config.messageTemplate.replace('{name}', entityName);
  }

  // Build consequence warning
  let consequence = 'This action cannot be easily undone.';
  if (config?.consequenceTemplate) {
    consequence = config.consequenceTemplate.replace('{name}', entityName || 'this item');
  } else if (config?.undoable) {
    consequence = 'This action can be undone if needed.';
  }

  const data: ConfirmActionBlockData = {
    actionId: `action-${Date.now()}`,
    title: severity === 'danger' ? 'Confirm Destructive Action' : 'Confirm Action',
    message,
    consequence,
    severity,
    confirmText: severity === 'danger' ? 'Yes, proceed' : 'Confirm',
    cancelText: 'Cancel',
    timeout: config?.timeout || 300000, // 5 minutes default
  };

  // Add affected entity info if available
  if (entityId && entityName && plan.entity) {
    data.affectedEntity = {
      type: plan.entity,
      id: entityId,
      name: entityName,
    };
  }

  return {
    id: `block-${Date.now()}`,
    type: 'confirm-action',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createSelectEntityBlock(plan: ExecutionPlan): Block {
  const data: SelectEntityBlockData = {
    prompt: plan.multiMatch?.reason || 'Multiple matches found. Please select one:',
    entityType: plan.multiMatch?.entityType || 'client',
    options: plan.multiMatch?.matches.map(m => ({
      id: m.id,
      displayName: m.displayName,
      description: m.summary,
    })) || [],
    multiSelect: false,
    pendingAction: plan.tool,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'select-entity',
    createdAt: new Date().toISOString(),
    data,
  } as Block;
}

function createExportDownloadBlock(
  tool: string,
  data: {
    content: string;
    format: string;
    recordCount: number;
    fileName?: string;
    fileSize?: number;
    downloadUrl?: string;
    generatedAt?: string;
  }
): Block {
  // Use provided data if available (from export-generator), otherwise create inline
  let downloadUrl = data.downloadUrl;
  let fileSize = data.fileSize;

  if (!downloadUrl) {
    // Fallback: Create blob URL inline
    const blob = new Blob([data.content], { type: data.format === 'json' ? 'application/json' : 'text/csv' });
    downloadUrl = URL.createObjectURL(blob);
    fileSize = blob.size;
  }

  const entityType = tool.replace('export_', '').slice(0, -1) as 'client' | 'task' | 'opportunity';

  const blockData: ExportDownloadBlockData = {
    fileName: data.fileName || `${tool.replace('export_', '')}_${new Date().toISOString().split('T')[0]}.${data.format}`,
    format: data.format as 'csv' | 'json',
    downloadUrl,
    fileSize: fileSize || new Blob([data.content]).size,
    recordCount: data.recordCount,
    generatedAt: data.generatedAt || new Date().toISOString(),
    entityType,
  };

  return {
    id: `block-${Date.now()}`,
    type: 'export-download',
    createdAt: new Date().toISOString(),
    data: blockData,
  } as Block;
}

// ============================================
// Legacy Card Generation (Backward Compatibility)
// ============================================

/**
 * Generate legacy cards for backward compatibility
 */
function generateLegacyCards(
  plan: ExecutionPlan,
  result: ToolResult
): Card[] {
  if (!result.success || !result.data) {
    return [];
  }

  const cards: Card[] = [];
  const renderAs = result.renderAs || plan.renderAs;

  switch (renderAs) {
    case 'task-list': {
      const tasks = result.data as Task[];
      if (tasks.length > 0) {
        cards.push({
          type: 'task-list',
          data: {
            title: plan.intent === 'read' && plan.arguments.status === 'needs-review'
              ? 'Pending Reviews'
              : plan.arguments.dueDate === 'today'
                ? 'Today\'s Tasks'
                : 'Tasks',
            tasks: tasks.map(taskToSummary),
            showActions: true,
          },
        });
      }
      break;
    }

    case 'task': {
      const task = result.data as Task;
      if (task) {
        cards.push({
          type: 'task',
          data: {
            task,
            showActions: true,
          },
        });
      }
      break;
    }

    case 'client':
    case 'client-profile': {
      const client = result.data as ClientWithDetails;
      if (client) {
        cards.push({
          type: 'client',
          data: {
            client,
            recentTasks: [], // Would need to fetch related tasks
          },
        });
      }
      break;
    }

    case 'confirmation': {
      const isSuccess = result.success;
      cards.push({
        type: 'confirmation',
        data: {
          type: isSuccess ? 'success' : 'error',
          message: result.message || (isSuccess ? 'Action completed.' : 'Action failed.'),
          undoable: result.undoable,
          undoAction: result.undoAction,
        },
      });
      break;
    }

    case 'review': {
      const task = result.data as Task;
      if (task && task.aiCompleted) {
        cards.push({
          type: 'review',
          data: {
            task,
            title: 'Review Required',
            message: task.aiCompletionData?.summary || 'This task was completed by Ciri and needs your approval.',
          },
        });
      }
      break;
    }
  }

  return cards;
}

function taskToSummary(task: Task): TaskSummary {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    clientName: task.clientName,
    priority: task.priority,
    aiCompleted: task.aiCompleted,
  };
}

// ============================================
// Context Updates
// ============================================

/**
 * Determine what context should be updated based on result
 */
function getContextUpdates(
  plan: ExecutionPlan,
  result: ToolResult
): ChatResponse['contextUpdates'] {
  const updates: ChatResponse['contextUpdates'] = {};

  if (!result.success || !result.data) {
    return updates;
  }

  // Set focused entity based on result
  switch (plan.entity) {
    case 'client': {
      if (plan.tool === 'get_client') {
        const client = result.data as ClientWithDetails;
        updates.focusedClientId = client.id;
      }
      if (['create_client', 'update_client', 'archive_client'].includes(plan.tool)) {
        updates.clientsUpdated = true;
      }
      break;
    }

    case 'task': {
      if (plan.tool === 'get_task') {
        const task = result.data as Task;
        updates.focusedTaskId = task.id;
      }
      if (['create_task', 'update_task', 'complete_task', 'approve_task', 'reject_task', 'delete_task'].includes(plan.tool)) {
        updates.tasksUpdated = true;
      }
      break;
    }

    case 'opportunity': {
      if (plan.tool === 'get_opportunity') {
        const opp = result.data as Opportunity;
        updates.focusedOpportunityId = opp.id;
      }
      break;
    }
  }

  return updates;
}

// ============================================
// Utility Functions
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// Main Builder Function
// ============================================

/**
 * Build a complete chat response from execution plan and result
 */
export function buildResponse(
  plan: ExecutionPlan,
  result: ToolResult
): ChatResponse {
  const text = generateResponseText(plan, result);
  const blocks = generateBlocks(plan, result);
  const cards = generateLegacyCards(plan, result);
  const contextUpdates = getContextUpdates(plan, result);
  const undoAvailable = canUndo();
  const undoDescription = undoAvailable ? getUndoDescription() || undefined : undefined;

  return {
    text,
    blocks,
    cards,
    contextUpdates,
    undoAvailable,
    undoDescription,
  };
}

/**
 * Build error response
 */
export function buildErrorResponse(error: string): ChatResponse {
  return {
    text: `I'm sorry, I encountered an error: ${error}`,
    blocks: [{
      id: `block-${Date.now()}`,
      type: 'error',
      createdAt: new Date().toISOString(),
      data: {
        title: 'Error',
        message: error,
        suggestion: 'Please try again or rephrase your request.',
      } as ErrorBlockData,
    } as Block],
    cards: [{
      type: 'confirmation',
      data: {
        type: 'error',
        message: error,
        undoable: false,
      },
    }],
    contextUpdates: {},
    undoAvailable: false,
  };
}

/**
 * Build disambiguation response
 */
export function buildDisambiguationResponse(plan: ExecutionPlan): ChatResponse {
  const block = createSelectEntityBlock(plan);

  return {
    text: plan.multiMatch?.reason || 'I found multiple matches. Which one did you mean?',
    blocks: [block],
    cards: [],
    contextUpdates: {},
    undoAvailable: false,
  };
}

/**
 * Build confirmation prompt response
 */
export function buildConfirmationPrompt(plan: ExecutionPlan, message: string): ChatResponse {
  const block = createConfirmActionBlock(plan);

  return {
    text: message,
    blocks: [block],
    cards: [],
    contextUpdates: {},
    undoAvailable: false,
  };
}

/**
 * Build clarification prompt response
 */
export function buildClarificationPrompt(plan: ExecutionPlan): ChatResponse {
  const clarification = plan.clarificationNeeded;

  return {
    text: clarification?.question || 'I need more information to help you. Could you clarify?',
    blocks: [],
    cards: [],
    contextUpdates: {},
    undoAvailable: false,
  };
}

/**
 * Build rate limit response (Phase 5 - Safety Patterns)
 */
export function buildRateLimitResponse(
  toolName: string,
  resetAt: string,
  message?: string
): ChatResponse {
  const resetDate = new Date(resetAt);
  const now = new Date();
  const secondsRemaining = Math.max(0, Math.ceil((resetDate.getTime() - now.getTime()) / 1000));

  const defaultMessage = secondsRemaining > 60
    ? `You're making requests too quickly. Please wait ${Math.ceil(secondsRemaining / 60)} minutes before trying again.`
    : `You're making requests too quickly. Please wait ${secondsRemaining} seconds before trying again.`;

  return {
    text: message || defaultMessage,
    blocks: [{
      id: `block-${Date.now()}`,
      type: 'error',
      createdAt: new Date().toISOString(),
      data: {
        title: 'Rate Limit Reached',
        message: message || defaultMessage,
        code: 'RATE_LIMITED',
        suggestion: `The rate limit will reset at ${resetDate.toLocaleTimeString()}.`,
      } as ErrorBlockData,
    } as Block],
    cards: [{
      type: 'confirmation',
      data: {
        type: 'error',
        message: message || defaultMessage,
        undoable: false,
      },
    }],
    contextUpdates: {},
    undoAvailable: false,
  };
}

/**
 * Build cooldown response (Phase 5 - Safety Patterns)
 */
export function buildCooldownResponse(
  toolName: string,
  remainingMs: number
): ChatResponse {
  const seconds = Math.ceil(remainingMs / 1000);

  const message = `Please wait ${seconds} seconds before performing this action again.`;

  return {
    text: message,
    blocks: [],
    cards: [{
      type: 'confirmation',
      data: {
        type: 'info',
        message,
        undoable: false,
      },
    }],
    contextUpdates: {},
    undoAvailable: false,
  };
}
