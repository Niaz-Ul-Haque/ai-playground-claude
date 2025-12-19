// Tool Executor - Phase 1, 2 & 5: Core Infrastructure + Mock Data Enhancement + Safety Patterns
// Executes tools against the mock data layer with rate limiting and audit logging

import type { ToolResult, ToolExecutionContext, EntityType } from '@/types/tools';
import type { ExecutionPlan } from '@/types/execution-plan';
import { getTool, validateToolArgs } from './tool-registry';
import * as mockData from '@/lib/mock-data';
import {
  recordUndo,
  canUndo as undoCanUndo,
  getUndoDescription as undoGetDescription,
  undoLast as undoManagerUndoLast,
} from '@/lib/chat/undo-manager';
import {
  checkRateLimit,
  recordOperation,
  type RateLimitResult,
} from '@/lib/chat/rate-limiter';
import {
  logAuditFromPlan,
  logUndo as logAuditUndo,
  logAuditError,
} from '@/lib/chat/audit-logger';
import {
  requiresConfirmation as checkRequiresConfirmation,
  getConfirmationConfig,
  isOnCooldown,
  getCooldownRemaining,
} from '@/lib/chat/confirmation-manager';
import {
  exportClients as generateClientExport,
  exportTasks as generateTaskExport,
  exportOpportunities as generateOpportunityExport,
  addToExportHistory,
} from '@/lib/chat/export-generator';
import type { Task, Workflow, WorkflowType, TaskFilters, TaskStats } from '@/types/task';
import type { Client, ClientWithDetails } from '@/types/client';
import type { Opportunity, OpportunityStats, OpportunityFilters, SnoozeOptions, DismissReason } from '@/types/opportunity';
import type { ActiveAutomation, AutomationSuggestion } from '@/types/automation';
import type { ActivityEntry, ActivityFilters } from '@/types/activity';
import type { Integration } from '@/types/integration';

// ============================================
// Extended Types for Tool Results
// ============================================

interface WorkflowProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface WorkflowWithProgress extends Workflow {
  progress: WorkflowProgress;
}

// ============================================
// Re-export Undo Functions for Backward Compatibility
// ============================================

export function canUndo(): boolean {
  return undoCanUndo();
}

export function getUndoDescription(): string | null {
  return undoGetDescription();
}

export function undoLast(): { success: boolean; message: string } {
  const result = undoManagerUndoLast();
  return {
    success: result.success,
    message: result.message,
  };
}

// Helper to record undo with proper typing
function recordToolUndo(
  action: string,
  entityType: EntityType,
  entityId: string,
  previousState: unknown,
  description?: string
): void {
  recordUndo(action, entityType, entityId, previousState, description);
}

// ============================================
// Tool Handlers
// ============================================

// READ Tools

async function handleListClients(args: Record<string, unknown>): Promise<ToolResult<Client[]>> {
  const filters: { name?: string; riskProfile?: string } = {};
  if (args.name) filters.name = String(args.name);
  if (args.riskProfile) filters.riskProfile = String(args.riskProfile);

  const clients = mockData.getClients(filters);
  const limit = Number(args.limit) || 20;

  return {
    success: true,
    data: clients.slice(0, limit),
    toolName: 'list_clients',
    arguments: args,
    renderAs: 'client-table',
    message: `Found ${clients.length} clients`,
  };
}

async function handleGetClient(args: Record<string, unknown>): Promise<ToolResult<ClientWithDetails | null>> {
  let client: ClientWithDetails | undefined;

  if (args.id) {
    client = mockData.getClientWithDetails(String(args.id));
  } else if (args.name) {
    const found = mockData.getClientByName(String(args.name));
    if (found) {
      client = mockData.getClientWithDetails(found.id);
    }
  }

  if (!client) {
    return {
      success: false,
      error: 'Client not found',
      toolName: 'get_client',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: client,
    toolName: 'get_client',
    arguments: args,
    renderAs: 'client-profile',
    message: `Found client: ${client.name}`,
  };
}

async function handleSearchClients(args: Record<string, unknown>): Promise<ToolResult<Client[]>> {
  const filters: mockData.ClientFilters = {};
  if (args.query) filters.name = String(args.query);
  if (args.riskProfile) filters.riskProfile = String(args.riskProfile);
  if (args.minPortfolioValue) filters.minPortfolioValue = Number(args.minPortfolioValue);
  if (args.maxPortfolioValue) filters.maxPortfolioValue = Number(args.maxPortfolioValue);

  const clients = mockData.searchClients(filters);

  return {
    success: true,
    data: clients,
    toolName: 'search_clients',
    arguments: args,
    renderAs: 'client-table',
    message: `Found ${clients.length} clients matching "${args.query}"`,
  };
}

async function handleListTasks(args: Record<string, unknown>): Promise<ToolResult<Task[]>> {
  const filters: TaskFilters = {};
  if (args.status) filters.status = args.status as Task['status'];
  if (args.priority) filters.priority = args.priority as Task['priority'];
  if (args.clientId) filters.clientId = String(args.clientId);
  if (args.dueDate) filters.dueDate = args.dueDate as TaskFilters['dueDate'];
  if (args.aiCompleted !== undefined) filters.aiCompleted = Boolean(args.aiCompleted);

  const tasks = mockData.getTasks(filters);

  return {
    success: true,
    data: tasks,
    toolName: 'list_tasks',
    arguments: args,
    renderAs: 'task-list',
    message: `Found ${tasks.length} tasks`,
  };
}

async function handleGetTask(args: Record<string, unknown>): Promise<ToolResult<Task | null>> {
  let task: Task | undefined;

  if (args.id) {
    task = mockData.getTaskById(String(args.id));
  } else if (args.title) {
    const tasks = mockData.searchTasks({ searchTerm: String(args.title) });
    task = tasks[0];
  }

  if (!task) {
    return {
      success: false,
      error: 'Task not found',
      toolName: 'get_task',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: task,
    toolName: 'get_task',
    arguments: args,
    renderAs: 'task',
    message: `Found task: ${task.title}`,
  };
}

async function handleSearchTasks(args: Record<string, unknown>): Promise<ToolResult<Task[]>> {
  const filters: TaskFilters = { searchTerm: String(args.query) };
  if (args.status) filters.status = args.status as Task['status'];
  if (args.priority) filters.priority = args.priority as Task['priority'];

  const tasks = mockData.searchTasks(filters);

  return {
    success: true,
    data: tasks,
    toolName: 'search_tasks',
    arguments: args,
    renderAs: 'task-list',
    message: `Found ${tasks.length} tasks matching "${args.query}"`,
  };
}

async function handleListOpportunities(args: Record<string, unknown>): Promise<ToolResult<Opportunity[]>> {
  const filters: OpportunityFilters = {};
  if (args.status) filters.status = args.status as Opportunity['status'];
  if (args.type) filters.type = args.type as Opportunity['type'];
  if (args.impactLevel) filters.impactLevel = args.impactLevel as Opportunity['impactLevel'];
  if (args.clientId) filters.clientId = String(args.clientId);

  const opportunities = mockData.getOpportunities(filters);

  return {
    success: true,
    data: opportunities,
    toolName: 'list_opportunities',
    arguments: args,
    renderAs: 'opportunity-list',
    message: `Found ${opportunities.length} opportunities`,
  };
}

async function handleGetOpportunity(args: Record<string, unknown>): Promise<ToolResult<Opportunity | null>> {
  const opportunity = mockData.getOpportunityById(String(args.id));

  if (!opportunity) {
    return {
      success: false,
      error: 'Opportunity not found',
      toolName: 'get_opportunity',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: opportunity,
    toolName: 'get_opportunity',
    arguments: args,
    renderAs: 'opportunity-detail',
    message: `Found opportunity: ${opportunity.title}`,
  };
}

async function handleListWorkflows(args: Record<string, unknown>): Promise<ToolResult<Workflow[]>> {
  const status = args.status as Workflow['status'] | undefined;
  const workflows = mockData.getWorkflows(status);

  return {
    success: true,
    data: workflows,
    toolName: 'list_workflows',
    arguments: args,
    renderAs: 'workflow-status',
    message: `Found ${workflows.length} workflows`,
  };
}

async function handleGetWorkflow(args: Record<string, unknown>): Promise<ToolResult<WorkflowWithProgress | null>> {
  const workflow = mockData.getWorkflowById(String(args.id));

  if (!workflow) {
    return {
      success: false,
      error: 'Workflow not found',
      toolName: 'get_workflow',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  const progressData = mockData.getWorkflowProgress(workflow.id);
  const progress: WorkflowProgress = progressData ?? { completed: 0, total: 0, percentage: 0 };

  return {
    success: true,
    data: { ...workflow, progress },
    toolName: 'get_workflow',
    arguments: args,
    renderAs: 'workflow-status',
    message: `Workflow: ${workflow.name} (${progress.percentage}% complete)`,
  };
}

async function handleListAutomations(args: Record<string, unknown>): Promise<ToolResult<{
  automations?: ActiveAutomation[];
  suggestions?: AutomationSuggestion[];
}>> {
  const type = String(args.type || 'all');

  const result: { automations?: ActiveAutomation[]; suggestions?: AutomationSuggestion[] } = {};

  if (type === 'all' || type === 'active') {
    const status = args.status as 'running' | 'paused' | undefined;
    result.automations = mockData.getActiveAutomations(status ? { status } : undefined);
  }

  if (type === 'all' || type === 'suggestions') {
    result.suggestions = mockData.getAutomationSuggestions('pending');
  }

  return {
    success: true,
    data: result,
    toolName: 'list_automations',
    arguments: args,
    renderAs: 'automation-list',
    message: `Found ${(result.automations?.length || 0) + (result.suggestions?.length || 0)} automations`,
  };
}

async function handleGetAutomation(args: Record<string, unknown>): Promise<ToolResult<ActiveAutomation | null>> {
  const automation = mockData.getActiveAutomationById(String(args.id));

  if (!automation) {
    return {
      success: false,
      error: 'Automation not found',
      toolName: 'get_automation',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: automation,
    toolName: 'get_automation',
    arguments: args,
    renderAs: 'automation-list',
    message: `Found automation: ${automation.name}`,
  };
}

async function handleListIntegrations(args: Record<string, unknown>): Promise<ToolResult<Integration[]>> {
  const filters: { status?: string; category?: string } = {};
  if (args.status) filters.status = String(args.status);
  if (args.category) filters.category = String(args.category);

  const integrations = mockData.getIntegrations(filters as Parameters<typeof mockData.getIntegrations>[0]);

  return {
    success: true,
    data: integrations,
    toolName: 'list_integrations',
    arguments: args,
    renderAs: 'confirmation',
    message: `Found ${integrations.length} integrations`,
  };
}

async function handleGetIntegration(args: Record<string, unknown>): Promise<ToolResult<Integration | null>> {
  let integration: Integration | undefined;

  if (args.id) {
    integration = mockData.getIntegrationById(String(args.id));
  } else if (args.provider) {
    integration = mockData.getIntegrationByProvider(args.provider as Parameters<typeof mockData.getIntegrationByProvider>[0]);
  }

  if (!integration) {
    return {
      success: false,
      error: 'Integration not found',
      toolName: 'get_integration',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: integration,
    toolName: 'get_integration',
    arguments: args,
    renderAs: 'confirmation',
    message: `Found integration: ${integration.providerName}`,
  };
}

async function handleGetActivityFeed(args: Record<string, unknown>): Promise<ToolResult<ActivityEntry[]>> {
  const limit = Number(args.limit) || 20;
  const filters: ActivityFilters = {};
  if (args.entityType) {
    filters.categories = [args.entityType as ActivityFilters['categories'] extends (infer T)[] | undefined ? T : never];
  }
  if (args.clientId) {
    // Would filter by client if the activity data supported it
  }

  const activity = mockData.getActivityEntries(filters).slice(0, limit);

  return {
    success: true,
    data: activity,
    toolName: 'get_activity_feed',
    arguments: args,
    renderAs: 'timeline',
    message: `Found ${activity.length} recent activities`,
  };
}

// CREATE Tools

async function handleCreateTask(args: Record<string, unknown>): Promise<ToolResult<Task>> {
  // Get client name if clientId provided
  let clientName = args.clientName ? String(args.clientName) : undefined;
  if (args.clientId && !clientName) {
    const client = mockData.getClientById(String(args.clientId));
    clientName = client?.name;
  }

  const newTask = mockData.createTask({
    title: String(args.title),
    description: String(args.description || ''),
    status: 'pending',
    dueDate: String(args.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
    clientId: args.clientId ? String(args.clientId) : undefined,
    clientName,
    priority: (args.priority as Task['priority']) || 'medium',
    tags: (args.tags as string[]) || [],
  });

  // Record for undo
  recordToolUndo('create_task', 'task', newTask.id, null, `Create task: ${newTask.title}`);

  return {
    success: true,
    data: newTask,
    toolName: 'create_task',
    arguments: args,
    renderAs: 'confirmation',
    message: `Created task: ${newTask.title}`,
    undoable: true,
    undoAction: 'delete_task',
  };
}

async function handleCreateOpportunity(args: Record<string, unknown>): Promise<ToolResult<Opportunity>> {
  const client = mockData.getClientById(String(args.clientId));

  const newOpp = mockData.createOpportunity({
    clientId: String(args.clientId),
    clientName: client?.name || 'Unknown Client',
    type: args.type as Opportunity['type'],
    title: String(args.title),
    description: String(args.description || ''),
    whyNow: String(args.whyNow || 'Created manually'),
    impactScore: Number(args.impactScore) || 50,
    impactLevel: (args.impactLevel as Opportunity['impactLevel']) || 'medium',
    estimatedValue: Number(args.estimatedValue) || 0,
    readiness: (args.readiness as Opportunity['readiness']) || 'needs_prep',
    sourceType: 'manual',
    sourceDescription: 'Created via chat',
    status: 'new',
  });

  // Record for undo
  recordToolUndo('create_opportunity', 'opportunity', newOpp.id, null, `Create opportunity: ${newOpp.title}`);

  return {
    success: true,
    data: newOpp,
    toolName: 'create_opportunity',
    arguments: args,
    renderAs: 'confirmation',
    message: `Created opportunity: ${newOpp.title}`,
    undoable: true,
  };
}

async function handleCreateClient(args: Record<string, unknown>): Promise<ToolResult<Client>> {
  const newClient = mockData.createClient({
    name: String(args.name),
    email: String(args.email || ''),
    phone: String(args.phone || ''),
    riskProfile: (args.riskProfile as Client['riskProfile']) || 'moderate',
    portfolioValue: Number(args.portfolioValue) || 0,
    accountType: String(args.accountType || 'Individual'),
    birthDate: String(args.birthDate || ''),
    address: String(args.address || ''),
    city: String(args.city || 'Toronto'),
    province: String(args.province || 'ON'),
    postalCode: String(args.postalCode || ''),
    notes: String(args.notes || ''),
    lastContact: new Date().toISOString(),
    tags: (args.tags as string[]) || [],
    status: (args.status as Client['status']) || 'prospect',
  });

  // Record for undo
  recordToolUndo('create_client', 'client', newClient.id, null, `Create client: ${newClient.name}`);

  return {
    success: true,
    data: newClient,
    toolName: 'create_client',
    arguments: args,
    renderAs: 'confirmation',
    message: `Created client: ${newClient.name}`,
    undoable: true,
  };
}

async function handleStartWorkflow(args: Record<string, unknown>): Promise<ToolResult<Workflow>> {
  const workflowType = args.type as WorkflowType;
  const clientId = String(args.clientId);

  const newWorkflow = mockData.startWorkflow(workflowType, clientId);

  // Record for undo
  recordToolUndo('start_workflow', 'workflow', newWorkflow.id, null, `Start workflow: ${newWorkflow.name}`);

  return {
    success: true,
    data: newWorkflow,
    toolName: 'start_workflow',
    arguments: args,
    renderAs: 'workflow-status',
    message: `Started workflow: ${newWorkflow.name}`,
    undoable: true,
  };
}

async function handleSuggestAutomation(args: Record<string, unknown>): Promise<ToolResult<AutomationSuggestion>> {
  const suggestion: AutomationSuggestion = {
    id: `sug-${Date.now()}`,
    patternDescription: String(args.description),
    automationDescription: String(args.description),
    expectedBenefit: String(args.benefit || 'Time savings and improved efficiency'),
    category: args.category as AutomationSuggestion['category'],
    triggerType: (args.triggerType as AutomationSuggestion['triggerType']) || 'manual',
    actionType: 'send_email',
    confidenceScore: 75,
    occurrenceCount: 1,
    estimatedTimeSaved: 15,
    status: 'pending',
    detectedAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: suggestion,
    toolName: 'suggest_automation',
    arguments: args,
    renderAs: 'confirmation',
    message: `Created automation suggestion: ${suggestion.automationDescription}`,
  };
}

// UPDATE Tools

async function handleUpdateTask(args: Record<string, unknown>): Promise<ToolResult<Task | null>> {
  const taskId = String(args.id);
  const currentTask = mockData.getTaskById(taskId);

  if (!currentTask) {
    return {
      success: false,
      error: 'Task not found',
      toolName: 'update_task',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('update_task', 'task', taskId, { ...currentTask }, `Update task: ${currentTask.title}`);

  const updates: Partial<Task> = {};
  if (args.title) updates.title = String(args.title);
  if (args.description) updates.description = String(args.description);
  if (args.status) updates.status = args.status as Task['status'];
  if (args.priority) updates.priority = args.priority as Task['priority'];
  if (args.dueDate) updates.dueDate = String(args.dueDate);

  const updatedTask = mockData.updateTask(taskId, updates);

  return {
    success: true,
    data: updatedTask || null,
    toolName: 'update_task',
    arguments: args,
    renderAs: 'confirmation',
    message: `Updated task: ${updatedTask?.title}`,
    undoable: true,
  };
}

async function handleCompleteTask(args: Record<string, unknown>): Promise<ToolResult<Task | null>> {
  const taskId = String(args.id);
  const currentTask = mockData.getTaskById(taskId);

  if (!currentTask) {
    return {
      success: false,
      error: 'Task not found',
      toolName: 'complete_task',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('complete_task', 'task', taskId, { status: currentTask.status }, `Complete task: ${currentTask.title}`);

  const updatedTask = mockData.updateTask(taskId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  return {
    success: true,
    data: updatedTask || null,
    toolName: 'complete_task',
    arguments: args,
    renderAs: 'confirmation',
    message: `Completed task: ${updatedTask?.title}`,
    undoable: true,
  };
}

async function handleApproveTask(args: Record<string, unknown>): Promise<ToolResult<Task | null>> {
  const taskId = String(args.id);
  const currentTask = mockData.getTaskById(taskId);

  if (!currentTask) {
    return {
      success: false,
      error: 'Task not found',
      toolName: 'approve_task',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('approve_task', 'task', taskId, { status: currentTask.status }, `Approve task: ${currentTask.title}`);

  const updatedTask = mockData.updateTask(taskId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  return {
    success: true,
    data: updatedTask || null,
    toolName: 'approve_task',
    arguments: args,
    renderAs: 'confirmation',
    message: `Approved and completed: ${updatedTask?.title}`,
    undoable: true,
  };
}

async function handleRejectTask(args: Record<string, unknown>): Promise<ToolResult<Task | null>> {
  const taskId = String(args.id);
  const currentTask = mockData.getTaskById(taskId);

  if (!currentTask) {
    return {
      success: false,
      error: 'Task not found',
      toolName: 'reject_task',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('reject_task', 'task', taskId, { status: currentTask.status, aiCompleted: currentTask.aiCompleted }, `Reject task: ${currentTask.title}`);

  const updatedTask = mockData.updateTask(taskId, {
    status: 'pending',
    aiCompleted: false,
    aiCompletionData: undefined,
  });

  return {
    success: true,
    data: updatedTask || null,
    toolName: 'reject_task',
    arguments: args,
    renderAs: 'confirmation',
    message: `Rejected: ${updatedTask?.title}. Reverted to pending.`,
    undoable: true,
  };
}

async function handleUpdateOpportunity(args: Record<string, unknown>): Promise<ToolResult<Opportunity | null>> {
  const oppId = String(args.id);
  const currentOpp = mockData.getOpportunityById(oppId);

  if (!currentOpp) {
    return {
      success: false,
      error: 'Opportunity not found',
      toolName: 'update_opportunity',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  recordToolUndo('update_opportunity', 'opportunity', oppId, { ...currentOpp }, `Update opportunity: ${currentOpp.title}`);

  const updates: Partial<Opportunity> = {};
  if (args.title) updates.title = String(args.title);
  if (args.description) updates.description = String(args.description);
  if (args.estimatedValue) updates.estimatedValue = Number(args.estimatedValue);
  if (args.impactLevel) updates.impactLevel = args.impactLevel as Opportunity['impactLevel'];

  const updatedOpp = mockData.updateOpportunity(oppId, updates);

  return {
    success: true,
    data: updatedOpp || null,
    toolName: 'update_opportunity',
    arguments: args,
    renderAs: 'confirmation',
    message: `Updated opportunity: ${updatedOpp?.title}`,
    undoable: true,
  };
}

async function handleSnoozeOpportunity(args: Record<string, unknown>): Promise<ToolResult<Opportunity | null>> {
  const oppId = String(args.id);
  const currentOpp = mockData.getOpportunityById(oppId);

  if (!currentOpp) {
    return {
      success: false,
      error: 'Opportunity not found',
      toolName: 'snooze_opportunity',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  recordToolUndo('snooze_opportunity', 'opportunity', oppId, { status: currentOpp.status, snoozedUntil: currentOpp.snoozedUntil }, `Snooze opportunity: ${currentOpp.title}`);

  const options: SnoozeOptions = {
    duration: args.duration as SnoozeOptions['duration'],
    customDate: args.customDate ? String(args.customDate) : undefined,
    reason: args.reason ? String(args.reason) : undefined,
  };

  const updatedOpp = mockData.snoozeOpportunity(oppId, options);

  return {
    success: true,
    data: updatedOpp || null,
    toolName: 'snooze_opportunity',
    arguments: args,
    renderAs: 'confirmation',
    message: `Snoozed opportunity: ${updatedOpp?.title}`,
    undoable: true,
  };
}

async function handleDismissOpportunity(args: Record<string, unknown>): Promise<ToolResult<Opportunity | null>> {
  const oppId = String(args.id);
  const currentOpp = mockData.getOpportunityById(oppId);

  if (!currentOpp) {
    return {
      success: false,
      error: 'Opportunity not found',
      toolName: 'dismiss_opportunity',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  recordToolUndo('dismiss_opportunity', 'opportunity', oppId, { status: currentOpp.status }, `Dismiss opportunity: ${currentOpp.title}`);

  const updatedOpp = mockData.dismissOpportunity(oppId, args.reason as DismissReason);

  return {
    success: true,
    data: updatedOpp || null,
    toolName: 'dismiss_opportunity',
    arguments: args,
    renderAs: 'confirmation',
    message: `Dismissed opportunity: ${updatedOpp?.title}`,
    undoable: true,
  };
}

async function handlePauseAutomation(args: Record<string, unknown>): Promise<ToolResult<ActiveAutomation | null>> {
  const automation = mockData.pauseAutomation(String(args.id));

  if (!automation) {
    return {
      success: false,
      error: 'Automation not found',
      toolName: 'pause_automation',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: automation,
    toolName: 'pause_automation',
    arguments: args,
    renderAs: 'confirmation',
    message: `Paused automation: ${automation.name}`,
    undoable: true,
  };
}

async function handleResumeAutomation(args: Record<string, unknown>): Promise<ToolResult<ActiveAutomation | null>> {
  const automation = mockData.resumeAutomation(String(args.id));

  if (!automation) {
    return {
      success: false,
      error: 'Automation not found',
      toolName: 'resume_automation',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  return {
    success: true,
    data: automation,
    toolName: 'resume_automation',
    arguments: args,
    renderAs: 'confirmation',
    message: `Resumed automation: ${automation.name}`,
  };
}

async function handleUpdateClient(args: Record<string, unknown>): Promise<ToolResult<Client | null>> {
  const clientId = String(args.id);
  const client = mockData.getClientById(clientId);

  if (!client) {
    return {
      success: false,
      error: 'Client not found',
      toolName: 'update_client',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('update_client', 'client', clientId, { ...client }, `Update client: ${client.name}`);

  // Build updates
  const updates: Partial<Client> = {};
  if (args.name) updates.name = String(args.name);
  if (args.email) updates.email = String(args.email);
  if (args.phone) updates.phone = String(args.phone);
  if (args.riskProfile) updates.riskProfile = args.riskProfile as Client['riskProfile'];
  if (args.status) updates.status = args.status as Client['status'];
  if (args.notes) updates.notes = String(args.notes);
  if (args.address) updates.address = String(args.address);
  if (args.city) updates.city = String(args.city);
  if (args.province) updates.province = String(args.province);
  if (args.postalCode) updates.postalCode = String(args.postalCode);

  const updatedClient = mockData.updateClient(clientId, updates);

  return {
    success: true,
    data: updatedClient,
    toolName: 'update_client',
    arguments: args,
    renderAs: 'confirmation',
    message: `Updated client: ${updatedClient?.name}`,
    undoable: true,
  };
}

// DELETE Tools

async function handleDeleteTask(args: Record<string, unknown>): Promise<ToolResult<boolean>> {
  const taskId = String(args.id);
  const task = mockData.getTaskById(taskId);

  if (!task) {
    return {
      success: false,
      error: 'Task not found',
      toolName: 'delete_task',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo (store the full task state before deletion)
  recordToolUndo('delete_task', 'task', taskId, { ...task }, `Delete task: ${task.title}`);

  // Actually delete the task
  const deleted = mockData.deleteTask(taskId);

  return {
    success: deleted,
    data: deleted,
    toolName: 'delete_task',
    arguments: args,
    renderAs: 'confirmation',
    message: deleted ? `Deleted task: ${task.title}` : 'Failed to delete task',
    undoable: true,
  };
}

async function handleArchiveClient(args: Record<string, unknown>): Promise<ToolResult<boolean>> {
  const clientId = String(args.id);
  const client = mockData.getClientById(clientId);

  if (!client) {
    return {
      success: false,
      error: 'Client not found',
      toolName: 'archive_client',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('archive_client', 'client', clientId, { ...client }, `Archive client: ${client.name}`);

  // Actually archive the client
  const archived = mockData.archiveClient(clientId);

  return {
    success: archived,
    data: archived,
    toolName: 'archive_client',
    arguments: args,
    renderAs: 'confirmation',
    message: archived ? `Archived client: ${client.name}` : 'Failed to archive client',
    undoable: true,
  };
}

async function handleArchiveOpportunity(args: Record<string, unknown>): Promise<ToolResult<boolean>> {
  const oppId = String(args.id);
  const opp = mockData.getOpportunityById(oppId);

  if (!opp) {
    return {
      success: false,
      error: 'Opportunity not found',
      toolName: 'archive_opportunity',
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Record for undo
  recordToolUndo('archive_opportunity', 'opportunity', oppId, { ...opp }, `Archive opportunity: ${opp.title}`);

  // Actually archive the opportunity
  const reason = args.reason ? String(args.reason) : undefined;
  const archived = mockData.archiveOpportunity(oppId, reason);

  return {
    success: archived,
    data: archived,
    toolName: 'archive_opportunity',
    arguments: args,
    renderAs: 'confirmation',
    message: archived ? `Archived opportunity: ${opp.title}` : 'Failed to archive opportunity',
    undoable: true,
  };
}

// REPORT Tools

async function handleGetPipelineSummary(args: Record<string, unknown>): Promise<ToolResult<{
  stats: OpportunityStats;
  opportunities: Opportunity[];
}>> {
  const stats = mockData.getOpportunityStats();
  const opportunities = mockData.getActiveOpportunities();

  return {
    success: true,
    data: { stats, opportunities },
    toolName: 'get_pipeline_summary',
    arguments: args,
    renderAs: 'chart',
    message: `Pipeline: ${stats.total} opportunities, $${stats.totalEstimatedValue.toLocaleString()} total value`,
  };
}

async function handleGetWorkloadSummary(args: Record<string, unknown>): Promise<ToolResult<TaskStats>> {
  const stats = mockData.getTaskStats();

  return {
    success: true,
    data: stats,
    toolName: 'get_workload_summary',
    arguments: args,
    renderAs: 'chart',
    message: `Workload: ${stats.dueToday} due today, ${stats.overdue} overdue`,
  };
}

async function handleGetClientStats(args: Record<string, unknown>): Promise<ToolResult<ReturnType<typeof mockData.getClientStats>>> {
  const stats = mockData.getClientStats();

  return {
    success: true,
    data: stats,
    toolName: 'get_client_stats',
    arguments: args,
    renderAs: 'chart',
    message: `${stats.totalClients} total clients, $${stats.totalAUM.toLocaleString()} AUM`,
  };
}

async function handleGetOpportunityStats(args: Record<string, unknown>): Promise<ToolResult<OpportunityStats>> {
  const stats = mockData.getOpportunityStats();

  return {
    success: true,
    data: stats,
    toolName: 'get_opportunity_stats',
    arguments: args,
    renderAs: 'chart',
    message: `${stats.byStatus.new} new, ${stats.expiringThisWeek} expiring this week`,
  };
}

async function handleGetTaskStats(args: Record<string, unknown>): Promise<ToolResult<TaskStats>> {
  const stats = mockData.getTaskStats();

  return {
    success: true,
    data: stats,
    toolName: 'get_task_stats',
    arguments: args,
    renderAs: 'chart',
    message: `${stats.total} total tasks, ${stats.completed} completed`,
  };
}

// EXPORT Tools

async function handleExportClients(args: Record<string, unknown>): Promise<ToolResult<{
  content: string;
  format: string;
  recordCount: number;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  generatedAt: string;
}>> {
  const filters: { riskProfile?: string; status?: string } = {};
  if (args.riskProfile) filters.riskProfile = String(args.riskProfile);
  if (args.status) filters.status = String(args.status);

  const clients = mockData.getClients(filters);
  const format = (String(args.format || 'csv')) as 'csv' | 'json';

  // Use the export generator for proper CSV/JSON generation
  const exportResult = generateClientExport(clients, { format });

  // Add to export history for tracking
  addToExportHistory(exportResult);

  return {
    success: true,
    data: {
      content: exportResult.content,
      format: exportResult.format,
      recordCount: exportResult.recordCount,
      fileName: exportResult.fileName,
      fileSize: exportResult.fileSize,
      downloadUrl: exportResult.downloadUrl,
      generatedAt: exportResult.generatedAt,
    },
    toolName: 'export_clients',
    arguments: args,
    renderAs: 'export-download',
    message: `Exported ${exportResult.recordCount} clients to ${format.toUpperCase()}`,
  };
}

async function handleExportOpportunities(args: Record<string, unknown>): Promise<ToolResult<{
  content: string;
  format: string;
  recordCount: number;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  generatedAt: string;
}>> {
  const filters: OpportunityFilters = {};
  if (args.status) filters.status = args.status as Opportunity['status'];
  if (args.type) filters.type = args.type as Opportunity['type'];
  if (args.impactLevel) filters.impactLevel = args.impactLevel as Opportunity['impactLevel'];

  const opportunities = mockData.getOpportunities(filters);
  const format = (String(args.format || 'csv')) as 'csv' | 'json';

  // Use the export generator for proper CSV/JSON generation
  const exportResult = generateOpportunityExport(opportunities, { format });

  // Add to export history for tracking
  addToExportHistory(exportResult);

  return {
    success: true,
    data: {
      content: exportResult.content,
      format: exportResult.format,
      recordCount: exportResult.recordCount,
      fileName: exportResult.fileName,
      fileSize: exportResult.fileSize,
      downloadUrl: exportResult.downloadUrl,
      generatedAt: exportResult.generatedAt,
    },
    toolName: 'export_opportunities',
    arguments: args,
    renderAs: 'export-download',
    message: `Exported ${exportResult.recordCount} opportunities to ${format.toUpperCase()}`,
  };
}

async function handleExportTasks(args: Record<string, unknown>): Promise<ToolResult<{
  content: string;
  format: string;
  recordCount: number;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  generatedAt: string;
}>> {
  const filters: TaskFilters = {};
  if (args.status) filters.status = args.status as Task['status'];
  if (args.priority) filters.priority = args.priority as Task['priority'];
  if (args.clientId) filters.clientId = String(args.clientId);

  const tasks = mockData.getTasks(filters);
  const format = (String(args.format || 'csv')) as 'csv' | 'json';

  // Use the export generator for proper CSV/JSON generation
  const exportResult = generateTaskExport(tasks, { format });

  // Add to export history for tracking
  addToExportHistory(exportResult);

  return {
    success: true,
    data: {
      content: exportResult.content,
      format: exportResult.format,
      recordCount: exportResult.recordCount,
      fileName: exportResult.fileName,
      fileSize: exportResult.fileSize,
      downloadUrl: exportResult.downloadUrl,
      generatedAt: exportResult.generatedAt,
    },
    toolName: 'export_tasks',
    arguments: args,
    renderAs: 'export-download',
    message: `Exported ${exportResult.recordCount} tasks to ${format.toUpperCase()}`,
  };
}

// ============================================
// Tool Handler Map
// ============================================

type ToolHandlerFn = (args: Record<string, unknown>) => Promise<ToolResult>;

const TOOL_HANDLERS: Record<string, ToolHandlerFn> = {
  // READ
  list_clients: handleListClients,
  get_client: handleGetClient,
  search_clients: handleSearchClients,
  list_tasks: handleListTasks,
  get_task: handleGetTask,
  search_tasks: handleSearchTasks,
  list_opportunities: handleListOpportunities,
  get_opportunity: handleGetOpportunity,
  list_workflows: handleListWorkflows,
  get_workflow: handleGetWorkflow,
  list_automations: handleListAutomations,
  get_automation: handleGetAutomation,
  list_integrations: handleListIntegrations,
  get_integration: handleGetIntegration,
  get_activity_feed: handleGetActivityFeed,
  // CREATE
  create_task: handleCreateTask,
  create_opportunity: handleCreateOpportunity,
  create_client: handleCreateClient,
  start_workflow: handleStartWorkflow,
  suggest_automation: handleSuggestAutomation,
  // UPDATE
  update_task: handleUpdateTask,
  complete_task: handleCompleteTask,
  approve_task: handleApproveTask,
  reject_task: handleRejectTask,
  update_opportunity: handleUpdateOpportunity,
  snooze_opportunity: handleSnoozeOpportunity,
  dismiss_opportunity: handleDismissOpportunity,
  pause_automation: handlePauseAutomation,
  resume_automation: handleResumeAutomation,
  update_client: handleUpdateClient,
  // DELETE
  delete_task: handleDeleteTask,
  archive_client: handleArchiveClient,
  archive_opportunity: handleArchiveOpportunity,
  // REPORT
  get_pipeline_summary: handleGetPipelineSummary,
  get_workload_summary: handleGetWorkloadSummary,
  get_client_stats: handleGetClientStats,
  get_opportunity_stats: handleGetOpportunityStats,
  get_task_stats: handleGetTaskStats,
  // EXPORT
  export_clients: handleExportClients,
  export_opportunities: handleExportOpportunities,
  export_tasks: handleExportTasks,
};

// ============================================
// Safety Check Functions
// ============================================

/**
 * Check rate limits for a tool
 */
export function checkToolRateLimit(
  toolName: string,
  entityType?: EntityType,
  entityId?: string
): RateLimitResult {
  return checkRateLimit(toolName, entityType, entityId);
}

/**
 * Check if a tool requires confirmation
 */
export function toolRequiresConfirmation(toolName: string): boolean {
  return checkRequiresConfirmation(toolName);
}

/**
 * Check if a tool is on cooldown
 */
export function checkToolCooldown(
  toolName: string,
  entityId?: string
): { onCooldown: boolean; remainingMs: number } {
  return {
    onCooldown: isOnCooldown(toolName, entityId),
    remainingMs: getCooldownRemaining(toolName, entityId),
  };
}

/**
 * Get tool safety info
 */
export function getToolSafetyInfo(toolName: string): {
  requiresConfirmation: boolean;
  confirmationConfig: ReturnType<typeof getConfirmationConfig> | null;
  rateLimitStatus: RateLimitResult;
} {
  return {
    requiresConfirmation: checkRequiresConfirmation(toolName),
    confirmationConfig: getConfirmationConfig(toolName),
    rateLimitStatus: checkRateLimit(toolName),
  };
}

// ============================================
// Main Executor Function
// ============================================

/**
 * Execute a tool by name with arguments
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context?: ToolExecutionContext
): Promise<ToolResult> {
  // Context is available for tools that need focused entity info
  // Currently passed through for future enhancement
  void context;

  // Validate tool exists
  const toolDef = getTool(toolName);
  if (!toolDef) {
    logAuditError(toolName, `Unknown tool: ${toolName}`);
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      toolName,
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Check rate limits (Phase 5 - Safety Patterns)
  const entityId = args.id ? String(args.id) : undefined;
  const entityType = toolDef.entityType;
  const rateLimitCheck = checkRateLimit(toolName, entityType, entityId);

  if (!rateLimitCheck.allowed) {
    logAuditError(toolName, rateLimitCheck.message || 'Rate limit exceeded', {
      rateLimitInfo: {
        remaining: rateLimitCheck.remaining,
        resetAt: rateLimitCheck.resetAt,
      },
    });
    return {
      success: false,
      error: rateLimitCheck.message || 'Rate limit exceeded. Please wait before trying again.',
      toolName,
      arguments: args,
      renderAs: 'confirmation',
      rateLimited: true,
      rateLimitResetAt: rateLimitCheck.resetAt,
    };
  }

  // Validate arguments
  const validation = validateToolArgs(toolName, args);
  if (!validation.valid) {
    logAuditError(toolName, validation.errors.map(e => e.message).join('; '), { args });
    return {
      success: false,
      error: validation.errors.map(e => e.message).join('; '),
      toolName,
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Get handler
  const handler = TOOL_HANDLERS[toolName];
  if (!handler) {
    logAuditError(toolName, `No handler for tool: ${toolName}`);
    return {
      success: false,
      error: `No handler for tool: ${toolName}`,
      toolName,
      arguments: args,
      renderAs: 'confirmation',
    };
  }

  // Execute
  try {
    const result = await handler(validation.sanitizedArgs || args);

    // Record the operation for rate limiting (Phase 5)
    if (result.success) {
      recordOperation(toolName, entityType, entityId);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logAuditError(toolName, errorMessage, { args });
    return {
      success: false,
      error: errorMessage,
      toolName,
      arguments: args,
      renderAs: 'confirmation',
    };
  }
}

/**
 * Execute an execution plan with audit logging
 */
export async function executePlan(
  plan: ExecutionPlan,
  context?: ToolExecutionContext
): Promise<ToolResult> {
  const result = await executeTool(plan.tool, plan.arguments, context);

  // Log to audit (Phase 5 - Safety Patterns)
  const resultData = result.data as { id?: string; name?: string; title?: string } | undefined;
  logAuditFromPlan(plan, result.success, {
    entityId: resultData?.id || (plan.arguments.id as string),
    entityName: resultData?.name || resultData?.title || (plan.arguments.name as string),
    message: result.message,
    error: result.error,
  });

  return result;
}

/**
 * Handle undo action with audit logging
 */
export async function handleUndo(): Promise<ToolResult> {
  const undoDescription = undoGetDescription();
  const result = undoLast();

  // Log undo to audit (Phase 5 - Safety Patterns)
  logAuditUndo(
    undoDescription || 'unknown',
    result.success,
    undefined,
    undefined,
    undoDescription || undefined,
    result.success ? undefined : result.message
  );

  return {
    success: result.success,
    data: null,
    error: result.success ? undefined : result.message,
    toolName: 'undo_action',
    arguments: {},
    renderAs: 'confirmation',
    message: result.message,
  };
}
