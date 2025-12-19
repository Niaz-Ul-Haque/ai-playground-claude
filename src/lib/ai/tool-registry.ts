// Tool Registry - Phase 1: Core Infrastructure
// Defines all 41 tools for the chat interactive system

import type {
  ToolDefinition,
  ToolCategory,
  ToolValidationResult,
} from '@/types/tools';

// ============================================
// READ/SEARCH Tools (15)
// ============================================

const listClientsDefinition: ToolDefinition = {
  name: 'list_clients',
  description: 'List clients with optional filters. Shows all clients or filters by name, risk profile, or portfolio value.',
  category: 'read',
  entityType: 'client',
  parameters: [
    { name: 'name', type: 'string', description: 'Filter by name (partial match)', required: false },
    { name: 'riskProfile', type: 'enum', description: 'Filter by risk profile', required: false, enumValues: ['conservative', 'moderate', 'aggressive'] },
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['active', 'inactive', 'prospect'] },
    { name: 'limit', type: 'number', description: 'Maximum number of results', required: false, defaultValue: 20 },
  ],
  requiresConfirmation: false,
  renderAs: 'client-table',
  examples: [
    'Show me all my clients',
    'List my clients',
    'Who are my aggressive risk clients?',
    'Show clients with high net worth',
  ],
  tags: ['client', 'list', 'view'],
};

const getClientDefinition: ToolDefinition = {
  name: 'get_client',
  description: 'Get detailed information about a specific client by ID or name.',
  category: 'read',
  entityType: 'client',
  parameters: [
    { name: 'id', type: 'string', description: 'Client ID', required: false },
    { name: 'name', type: 'string', description: 'Client name to search for', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'client-profile',
  examples: [
    'Tell me about John Smith',
    'Show me Sarah Chen\'s profile',
    'Get client details for Michael Brown',
  ],
  tags: ['client', 'detail', 'profile'],
};

const searchClientsDefinition: ToolDefinition = {
  name: 'search_clients',
  description: 'Full-text search across client records.',
  category: 'read',
  entityType: 'client',
  parameters: [
    { name: 'query', type: 'string', description: 'Search query', required: true },
    { name: 'riskProfile', type: 'enum', description: 'Filter by risk profile', required: false, enumValues: ['conservative', 'moderate', 'aggressive'] },
    { name: 'minPortfolioValue', type: 'number', description: 'Minimum portfolio value', required: false },
    { name: 'maxPortfolioValue', type: 'number', description: 'Maximum portfolio value', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'client-table',
  examples: [
    'Search for clients named Johnson',
    'Find clients in Toronto',
    'Search for clients with RRSP',
  ],
  tags: ['client', 'search'],
};

const listTasksDefinition: ToolDefinition = {
  name: 'list_tasks',
  description: 'List tasks with optional filters. Shows all tasks or filters by status, priority, due date, or client.',
  category: 'read',
  entityType: 'task',
  parameters: [
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['pending', 'in-progress', 'completed', 'needs-review'] },
    { name: 'priority', type: 'enum', description: 'Filter by priority', required: false, enumValues: ['low', 'medium', 'high'] },
    { name: 'clientId', type: 'string', description: 'Filter by client ID', required: false },
    { name: 'dueDate', type: 'enum', description: 'Filter by due date range', required: false, enumValues: ['today', 'week', 'overdue', 'all'] },
    { name: 'aiCompleted', type: 'boolean', description: 'Filter by AI completion status', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'task-list',
  examples: [
    'What tasks do I have today?',
    'Show me my high priority tasks',
    'What\'s overdue?',
    'List all pending tasks',
  ],
  tags: ['task', 'list', 'todo'],
};

const getTaskDefinition: ToolDefinition = {
  name: 'get_task',
  description: 'Get detailed information about a specific task.',
  category: 'read',
  entityType: 'task',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID', required: false },
    { name: 'title', type: 'string', description: 'Task title to search for', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'task',
  examples: [
    'Show me the Johnson portfolio review task',
    'What\'s the status on the annual review?',
    'Get details on the follow-up call task',
  ],
  tags: ['task', 'detail'],
};

const searchTasksDefinition: ToolDefinition = {
  name: 'search_tasks',
  description: 'Full-text search across tasks.',
  category: 'read',
  entityType: 'task',
  parameters: [
    { name: 'query', type: 'string', description: 'Search query', required: true },
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['pending', 'in-progress', 'completed', 'needs-review'] },
    { name: 'priority', type: 'enum', description: 'Filter by priority', required: false, enumValues: ['low', 'medium', 'high'] },
  ],
  requiresConfirmation: false,
  renderAs: 'task-list',
  examples: [
    'Find tasks about portfolio review',
    'Search for email tasks',
    'Find tasks mentioning tax planning',
  ],
  tags: ['task', 'search'],
};

const listOpportunitiesDefinition: ToolDefinition = {
  name: 'list_opportunities',
  description: 'List opportunities with optional filters.',
  category: 'read',
  entityType: 'opportunity',
  parameters: [
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['new', 'viewed', 'snoozed', 'dismissed', 'actioned'] },
    { name: 'type', type: 'enum', description: 'Filter by type', required: false, enumValues: ['contract', 'milestone', 'market'] },
    { name: 'impactLevel', type: 'enum', description: 'Filter by impact level', required: false, enumValues: ['high', 'medium', 'low'] },
    { name: 'clientId', type: 'string', description: 'Filter by client ID', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'opportunity-list',
  examples: [
    'Show me opportunities',
    'What opportunities need attention?',
    'List high impact opportunities',
    'Show new opportunities',
  ],
  tags: ['opportunity', 'list', 'pipeline'],
};

const getOpportunityDefinition: ToolDefinition = {
  name: 'get_opportunity',
  description: 'Get detailed information about a specific opportunity.',
  category: 'read',
  entityType: 'opportunity',
  parameters: [
    { name: 'id', type: 'string', description: 'Opportunity ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'opportunity-detail',
  examples: [
    'Show me the RRSP contribution opportunity',
    'Tell me about the Chen renewal',
  ],
  tags: ['opportunity', 'detail'],
};

const listWorkflowsDefinition: ToolDefinition = {
  name: 'list_workflows',
  description: 'List workflows with optional status filter.',
  category: 'read',
  entityType: 'workflow',
  parameters: [
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['active', 'completed', 'paused', 'cancelled'] },
    { name: 'clientId', type: 'string', description: 'Filter by client ID', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'workflow-status',
  examples: [
    'Show active workflows',
    'What workflows are in progress?',
    'List completed workflows',
  ],
  tags: ['workflow', 'list'],
};

const getWorkflowDefinition: ToolDefinition = {
  name: 'get_workflow',
  description: 'Get detailed information about a specific workflow.',
  category: 'read',
  entityType: 'workflow',
  parameters: [
    { name: 'id', type: 'string', description: 'Workflow ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'workflow-status',
  examples: [
    'Show the onboarding workflow progress',
    'How is the annual review workflow going?',
  ],
  tags: ['workflow', 'detail', 'progress'],
};

const listAutomationsDefinition: ToolDefinition = {
  name: 'list_automations',
  description: 'List automations - active, suggestions, or both.',
  category: 'read',
  entityType: 'automation',
  parameters: [
    { name: 'type', type: 'enum', description: 'Type of automations', required: false, enumValues: ['active', 'suggestions', 'all'], defaultValue: 'all' },
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['running', 'paused', 'pending'] },
  ],
  requiresConfirmation: false,
  renderAs: 'automation-list',
  examples: [
    'Show my automations',
    'What automation suggestions do I have?',
    'List paused automations',
  ],
  tags: ['automation', 'list'],
};

const getAutomationDefinition: ToolDefinition = {
  name: 'get_automation',
  description: 'Get detailed information about a specific automation.',
  category: 'read',
  entityType: 'automation',
  parameters: [
    { name: 'id', type: 'string', description: 'Automation ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'automation-list',
  examples: [
    'Show details for the follow-up email automation',
  ],
  tags: ['automation', 'detail'],
};

const listIntegrationsDefinition: ToolDefinition = {
  name: 'list_integrations',
  description: 'List connected integrations.',
  category: 'read',
  entityType: 'integration',
  parameters: [
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['healthy', 'warning', 'error', 'syncing', 'disconnected'] },
    { name: 'category', type: 'enum', description: 'Filter by category', required: false, enumValues: ['email', 'calendar', 'crm', 'finance', 'storage', 'communication'] },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Show my integrations',
    'What integrations are connected?',
    'Are there any integration errors?',
  ],
  tags: ['integration', 'list'],
};

const getIntegrationDefinition: ToolDefinition = {
  name: 'get_integration',
  description: 'Get detailed information about a specific integration.',
  category: 'read',
  entityType: 'integration',
  parameters: [
    { name: 'id', type: 'string', description: 'Integration ID', required: false },
    { name: 'provider', type: 'string', description: 'Provider name', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Show Gmail integration status',
    'How is the Outlook sync doing?',
  ],
  tags: ['integration', 'detail'],
};

const getActivityFeedDefinition: ToolDefinition = {
  name: 'get_activity_feed',
  description: 'Get recent activity feed.',
  category: 'read',
  entityType: 'activity',
  parameters: [
    { name: 'limit', type: 'number', description: 'Maximum number of entries', required: false, defaultValue: 20 },
    { name: 'entityType', type: 'enum', description: 'Filter by entity type', required: false, enumValues: ['client', 'task', 'opportunity', 'automation'] },
    { name: 'clientId', type: 'string', description: 'Filter by client', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'timeline',
  examples: [
    'Show recent activity',
    'What happened today?',
    'Show activity for John Smith',
  ],
  tags: ['activity', 'timeline', 'history'],
};

// ============================================
// CREATE Tools (5)
// ============================================

const createTaskDefinition: ToolDefinition = {
  name: 'create_task',
  description: 'Create a new task.',
  category: 'create',
  entityType: 'task',
  parameters: [
    { name: 'title', type: 'string', description: 'Task title', required: true },
    { name: 'description', type: 'string', description: 'Task description', required: false },
    { name: 'clientId', type: 'string', description: 'Associated client ID', required: false },
    { name: 'clientName', type: 'string', description: 'Associated client name', required: false },
    { name: 'dueDate', type: 'date', description: 'Due date', required: false },
    { name: 'priority', type: 'enum', description: 'Priority level', required: false, enumValues: ['low', 'medium', 'high'], defaultValue: 'medium' },
    { name: 'tags', type: 'array', description: 'Task tags', required: false, itemType: 'string' },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Create a task to follow up with John',
    'Add a task for portfolio review',
    'Remind me to call Sarah next week',
  ],
  tags: ['task', 'create', 'add'],
};

const createOpportunityDefinition: ToolDefinition = {
  name: 'create_opportunity',
  description: 'Create a new opportunity.',
  category: 'create',
  entityType: 'opportunity',
  parameters: [
    { name: 'clientId', type: 'string', description: 'Client ID', required: true },
    { name: 'title', type: 'string', description: 'Opportunity title', required: true },
    { name: 'type', type: 'enum', description: 'Opportunity type', required: true, enumValues: ['contract', 'milestone', 'market'] },
    { name: 'description', type: 'string', description: 'Description', required: false },
    { name: 'estimatedValue', type: 'number', description: 'Estimated value', required: false },
    { name: 'impactLevel', type: 'enum', description: 'Impact level', required: false, enumValues: ['high', 'medium', 'low'], defaultValue: 'medium' },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Create an opportunity for RRSP contribution',
    'Add a renewal opportunity for Chen',
  ],
  tags: ['opportunity', 'create', 'add'],
};

const createClientDefinition: ToolDefinition = {
  name: 'create_client',
  description: 'Create a new client record.',
  category: 'create',
  entityType: 'client',
  parameters: [
    { name: 'name', type: 'string', description: 'Client name', required: true },
    { name: 'email', type: 'string', description: 'Email address', required: false },
    { name: 'phone', type: 'string', description: 'Phone number', required: false },
    { name: 'riskProfile', type: 'enum', description: 'Risk profile', required: false, enumValues: ['conservative', 'moderate', 'aggressive'], defaultValue: 'moderate' },
    { name: 'portfolioValue', type: 'number', description: 'Portfolio value', required: false },
    { name: 'status', type: 'enum', description: 'Client status', required: false, enumValues: ['active', 'inactive', 'prospect'], defaultValue: 'prospect' },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Add a new client named Jane Doe',
    'Create a prospect record for Michael Lee',
  ],
  tags: ['client', 'create', 'add'],
};

const startWorkflowDefinition: ToolDefinition = {
  name: 'start_workflow',
  description: 'Start a new workflow for a client.',
  category: 'workflow',
  entityType: 'workflow',
  parameters: [
    { name: 'type', type: 'enum', description: 'Workflow type', required: true, enumValues: ['client_onboarding', 'annual_review', 'portfolio_rebalance', 'insurance_renewal', 'estate_planning', 'tax_planning'] },
    { name: 'clientId', type: 'string', description: 'Client ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'workflow-status',
  examples: [
    'Start onboarding for new client',
    'Begin annual review workflow for Johnson',
    'Start portfolio rebalance process',
  ],
  tags: ['workflow', 'start', 'begin'],
};

const suggestAutomationDefinition: ToolDefinition = {
  name: 'suggest_automation',
  description: 'Create an automation suggestion.',
  category: 'create',
  entityType: 'automation',
  parameters: [
    { name: 'description', type: 'string', description: 'Automation description', required: true },
    { name: 'category', type: 'enum', description: 'Automation category', required: true, enumValues: ['communication', 'scheduling', 'data_entry', 'reporting', 'compliance'] },
    { name: 'triggerType', type: 'enum', description: 'What triggers this automation', required: false, enumValues: ['schedule', 'event', 'condition', 'manual'] },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Suggest an automation for birthday emails',
    'Create automation to remind about renewals',
  ],
  tags: ['automation', 'suggest', 'create'],
};

// ============================================
// UPDATE Tools (10)
// ============================================

const updateTaskDefinition: ToolDefinition = {
  name: 'update_task',
  description: 'Update a task\'s fields.',
  category: 'update',
  entityType: 'task',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID', required: true },
    { name: 'title', type: 'string', description: 'New title', required: false },
    { name: 'description', type: 'string', description: 'New description', required: false },
    { name: 'status', type: 'enum', description: 'New status', required: false, enumValues: ['pending', 'in-progress', 'completed', 'needs-review'] },
    { name: 'priority', type: 'enum', description: 'New priority', required: false, enumValues: ['low', 'medium', 'high'] },
    { name: 'dueDate', type: 'date', description: 'New due date', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Change the priority of that task to high',
    'Update the due date to next Monday',
    'Move the task to in progress',
  ],
  tags: ['task', 'update', 'edit'],
};

const completeTaskDefinition: ToolDefinition = {
  name: 'complete_task',
  description: 'Mark a task as completed.',
  category: 'update',
  entityType: 'task',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Mark that task as done',
    'Complete the follow-up call',
    'I finished the portfolio review',
  ],
  tags: ['task', 'complete', 'done'],
};

const approveTaskDefinition: ToolDefinition = {
  name: 'approve_task',
  description: 'Approve an AI-completed task.',
  category: 'update',
  entityType: 'task',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Approve that',
    'Looks good, approve it',
    'Yes, send it',
  ],
  tags: ['task', 'approve', 'ai'],
};

const rejectTaskDefinition: ToolDefinition = {
  name: 'reject_task',
  description: 'Reject an AI-completed task.',
  category: 'update',
  entityType: 'task',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID', required: true },
    { name: 'reason', type: 'string', description: 'Rejection reason', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Reject that',
    'Don\'t send it',
    'Cancel that action',
  ],
  tags: ['task', 'reject', 'ai'],
};

const updateOpportunityDefinition: ToolDefinition = {
  name: 'update_opportunity',
  description: 'Update an opportunity\'s fields.',
  category: 'update',
  entityType: 'opportunity',
  parameters: [
    { name: 'id', type: 'string', description: 'Opportunity ID', required: true },
    { name: 'title', type: 'string', description: 'New title', required: false },
    { name: 'description', type: 'string', description: 'New description', required: false },
    { name: 'estimatedValue', type: 'number', description: 'New estimated value', required: false },
    { name: 'impactLevel', type: 'enum', description: 'New impact level', required: false, enumValues: ['high', 'medium', 'low'] },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Update the estimated value to $50,000',
    'Change impact level to high',
  ],
  tags: ['opportunity', 'update', 'edit'],
};

const snoozeOpportunityDefinition: ToolDefinition = {
  name: 'snooze_opportunity',
  description: 'Snooze an opportunity for later.',
  category: 'update',
  entityType: 'opportunity',
  parameters: [
    { name: 'id', type: 'string', description: 'Opportunity ID', required: true },
    { name: 'duration', type: 'enum', description: 'Snooze duration', required: true, enumValues: ['1_day', '3_days', '1_week', '2_weeks', '1_month', 'custom'] },
    { name: 'customDate', type: 'date', description: 'Custom snooze until date', required: false },
    { name: 'reason', type: 'string', description: 'Snooze reason', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Snooze that for a week',
    'Remind me about this in 2 weeks',
    'Put this on hold until next month',
  ],
  tags: ['opportunity', 'snooze', 'defer'],
};

const dismissOpportunityDefinition: ToolDefinition = {
  name: 'dismiss_opportunity',
  description: 'Dismiss an opportunity.',
  category: 'update',
  entityType: 'opportunity',
  parameters: [
    { name: 'id', type: 'string', description: 'Opportunity ID', required: true },
    { name: 'reason', type: 'enum', description: 'Dismissal reason', required: true, enumValues: ['not_relevant', 'client_declined', 'already_addressed', 'timing_not_right', 'competitor_won', 'other'] },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Dismiss that opportunity',
    'Client declined, remove it',
    'Not relevant, dismiss',
  ],
  tags: ['opportunity', 'dismiss', 'remove'],
};

const pauseAutomationDefinition: ToolDefinition = {
  name: 'pause_automation',
  description: 'Pause a running automation.',
  category: 'update',
  entityType: 'automation',
  parameters: [
    { name: 'id', type: 'string', description: 'Automation ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Pause that automation',
    'Stop the email automation',
  ],
  tags: ['automation', 'pause', 'stop'],
};

const resumeAutomationDefinition: ToolDefinition = {
  name: 'resume_automation',
  description: 'Resume a paused automation.',
  category: 'update',
  entityType: 'automation',
  parameters: [
    { name: 'id', type: 'string', description: 'Automation ID', required: true },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Resume that automation',
    'Start the automation again',
  ],
  tags: ['automation', 'resume', 'start'],
};

const updateClientDefinition: ToolDefinition = {
  name: 'update_client',
  description: 'Update a client\'s information.',
  category: 'update',
  entityType: 'client',
  parameters: [
    { name: 'id', type: 'string', description: 'Client ID', required: true },
    { name: 'name', type: 'string', description: 'New name', required: false },
    { name: 'email', type: 'string', description: 'New email', required: false },
    { name: 'phone', type: 'string', description: 'New phone', required: false },
    { name: 'riskProfile', type: 'enum', description: 'New risk profile', required: false, enumValues: ['conservative', 'moderate', 'aggressive'] },
    { name: 'status', type: 'enum', description: 'New status', required: false, enumValues: ['active', 'inactive', 'prospect'] },
    { name: 'notes', type: 'string', description: 'New notes', required: false },
  ],
  requiresConfirmation: false,
  renderAs: 'confirmation',
  examples: [
    'Update John\'s email address',
    'Change risk profile to aggressive',
    'Add a note to the client record',
  ],
  tags: ['client', 'update', 'edit'],
};

// ============================================
// DELETE Tools (3)
// ============================================

const deleteTaskDefinition: ToolDefinition = {
  name: 'delete_task',
  description: 'Delete a task permanently.',
  category: 'delete',
  entityType: 'task',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID', required: true },
  ],
  requiresConfirmation: true,
  renderAs: 'confirm-action',
  examples: [
    'Delete that task',
    'Remove the follow-up task',
  ],
  tags: ['task', 'delete', 'remove'],
};

const archiveClientDefinition: ToolDefinition = {
  name: 'archive_client',
  description: 'Archive a client record.',
  category: 'delete',
  entityType: 'client',
  parameters: [
    { name: 'id', type: 'string', description: 'Client ID', required: true },
  ],
  requiresConfirmation: true,
  renderAs: 'confirm-action',
  examples: [
    'Archive John Smith',
    'Remove client from active list',
  ],
  tags: ['client', 'archive', 'delete'],
};

const archiveOpportunityDefinition: ToolDefinition = {
  name: 'archive_opportunity',
  description: 'Archive an opportunity.',
  category: 'delete',
  entityType: 'opportunity',
  parameters: [
    { name: 'id', type: 'string', description: 'Opportunity ID', required: true },
  ],
  requiresConfirmation: true,
  renderAs: 'confirm-action',
  examples: [
    'Archive that opportunity',
    'Remove from pipeline',
  ],
  tags: ['opportunity', 'archive', 'delete'],
};

// ============================================
// REPORT Tools (5)
// ============================================

const getPipelineSummaryDefinition: ToolDefinition = {
  name: 'get_pipeline_summary',
  description: 'Get a summary of the opportunity pipeline.',
  category: 'report',
  entityType: 'opportunity',
  parameters: [
    { name: 'period', type: 'enum', description: 'Time period', required: false, enumValues: ['week', 'month', 'quarter', 'year'], defaultValue: 'month' },
  ],
  requiresConfirmation: false,
  renderAs: 'chart',
  examples: [
    'Show me pipeline summary',
    'How is my pipeline doing?',
    'Give me a pipeline overview',
  ],
  tags: ['report', 'pipeline', 'summary'],
};

const getWorkloadSummaryDefinition: ToolDefinition = {
  name: 'get_workload_summary',
  description: 'Get a summary of tasks and workload.',
  category: 'report',
  entityType: 'task',
  parameters: [
    { name: 'period', type: 'enum', description: 'Time period', required: false, enumValues: ['day', 'week', 'month'], defaultValue: 'week' },
  ],
  requiresConfirmation: false,
  renderAs: 'chart',
  examples: [
    'What\'s my workload like?',
    'Show task summary for the week',
    'How busy am I this week?',
  ],
  tags: ['report', 'workload', 'tasks'],
};

const getClientStatsDefinition: ToolDefinition = {
  name: 'get_client_stats',
  description: 'Get client statistics and metrics.',
  category: 'report',
  entityType: 'client',
  parameters: [],
  requiresConfirmation: false,
  renderAs: 'chart',
  examples: [
    'Show client statistics',
    'How many clients do I have?',
    'Give me AUM breakdown',
  ],
  tags: ['report', 'clients', 'stats'],
};

const getOpportunityStatsDefinition: ToolDefinition = {
  name: 'get_opportunity_stats',
  description: 'Get opportunity statistics and metrics.',
  category: 'report',
  entityType: 'opportunity',
  parameters: [],
  requiresConfirmation: false,
  renderAs: 'chart',
  examples: [
    'Show opportunity stats',
    'Pipeline by status',
    'What\'s the total pipeline value?',
  ],
  tags: ['report', 'opportunities', 'stats'],
};

const getTaskStatsDefinition: ToolDefinition = {
  name: 'get_task_stats',
  description: 'Get task statistics and metrics.',
  category: 'report',
  entityType: 'task',
  parameters: [],
  requiresConfirmation: false,
  renderAs: 'chart',
  examples: [
    'Show task statistics',
    'How many tasks are overdue?',
    'Task completion rate',
  ],
  tags: ['report', 'tasks', 'stats'],
};

// ============================================
// EXPORT Tools (3)
// ============================================

const exportClientsDefinition: ToolDefinition = {
  name: 'export_clients',
  description: 'Export clients to CSV.',
  category: 'export',
  entityType: 'client',
  parameters: [
    { name: 'format', type: 'enum', description: 'Export format', required: false, enumValues: ['csv', 'json'], defaultValue: 'csv' },
    { name: 'riskProfile', type: 'enum', description: 'Filter by risk profile', required: false, enumValues: ['conservative', 'moderate', 'aggressive'] },
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['active', 'inactive', 'prospect'] },
  ],
  requiresConfirmation: false,
  renderAs: 'export-download',
  examples: [
    'Export clients to CSV',
    'Download client list',
    'Export all clients',
  ],
  tags: ['export', 'clients', 'csv'],
};

const exportOpportunitiesDefinition: ToolDefinition = {
  name: 'export_opportunities',
  description: 'Export opportunities to CSV.',
  category: 'export',
  entityType: 'opportunity',
  parameters: [
    { name: 'format', type: 'enum', description: 'Export format', required: false, enumValues: ['csv', 'json'], defaultValue: 'csv' },
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['new', 'viewed', 'snoozed', 'dismissed', 'actioned'] },
  ],
  requiresConfirmation: false,
  renderAs: 'export-download',
  examples: [
    'Export opportunities',
    'Download pipeline data',
  ],
  tags: ['export', 'opportunities', 'csv'],
};

const exportTasksDefinition: ToolDefinition = {
  name: 'export_tasks',
  description: 'Export tasks to CSV.',
  category: 'export',
  entityType: 'task',
  parameters: [
    { name: 'format', type: 'enum', description: 'Export format', required: false, enumValues: ['csv', 'json'], defaultValue: 'csv' },
    { name: 'status', type: 'enum', description: 'Filter by status', required: false, enumValues: ['pending', 'in-progress', 'completed', 'needs-review'] },
  ],
  requiresConfirmation: false,
  renderAs: 'export-download',
  examples: [
    'Export tasks to CSV',
    'Download task list',
  ],
  tags: ['export', 'tasks', 'csv'],
};

// ============================================
// Tool Collection
// ============================================

/**
 * All tool definitions
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // READ/SEARCH (15)
  listClientsDefinition,
  getClientDefinition,
  searchClientsDefinition,
  listTasksDefinition,
  getTaskDefinition,
  searchTasksDefinition,
  listOpportunitiesDefinition,
  getOpportunityDefinition,
  listWorkflowsDefinition,
  getWorkflowDefinition,
  listAutomationsDefinition,
  getAutomationDefinition,
  listIntegrationsDefinition,
  getIntegrationDefinition,
  getActivityFeedDefinition,
  // CREATE (5)
  createTaskDefinition,
  createOpportunityDefinition,
  createClientDefinition,
  startWorkflowDefinition,
  suggestAutomationDefinition,
  // UPDATE (10)
  updateTaskDefinition,
  completeTaskDefinition,
  approveTaskDefinition,
  rejectTaskDefinition,
  updateOpportunityDefinition,
  snoozeOpportunityDefinition,
  dismissOpportunityDefinition,
  pauseAutomationDefinition,
  resumeAutomationDefinition,
  updateClientDefinition,
  // DELETE (3)
  deleteTaskDefinition,
  archiveClientDefinition,
  archiveOpportunityDefinition,
  // REPORT (5)
  getPipelineSummaryDefinition,
  getWorkloadSummaryDefinition,
  getClientStatsDefinition,
  getOpportunityStatsDefinition,
  getTaskStatsDefinition,
  // EXPORT (3)
  exportClientsDefinition,
  exportOpportunitiesDefinition,
  exportTasksDefinition,
];

/**
 * Tool definitions indexed by name
 */
export const TOOLS_BY_NAME: Map<string, ToolDefinition> = new Map(
  TOOL_DEFINITIONS.map(tool => [tool.name, tool])
);

/**
 * Get tool by name
 */
export function getTool(name: string): ToolDefinition | undefined {
  return TOOLS_BY_NAME.get(name);
}

/**
 * Get all tools
 */
export function getAllTools(): ToolDefinition[] {
  return [...TOOL_DEFINITIONS];
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter(tool => tool.category === category);
}

/**
 * Get tools by entity type
 */
export function getToolsByEntity(entityType: string): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter(tool => tool.entityType === entityType);
}

/**
 * Validate tool arguments
 */
export function validateToolArgs(
  toolName: string,
  args: Record<string, unknown>
): ToolValidationResult {
  const tool = getTool(toolName);
  if (!tool) {
    return {
      valid: false,
      errors: [{ parameter: 'tool', message: `Unknown tool: ${toolName}` }],
    };
  }

  const errors: Array<{ parameter: string; message: string }> = [];
  const sanitizedArgs: Record<string, unknown> = {};

  for (const param of tool.parameters) {
    const value = args[param.name];

    // Check required
    if (param.required && (value === undefined || value === null || value === '')) {
      errors.push({
        parameter: param.name,
        message: `Required parameter '${param.name}' is missing`,
      });
      continue;
    }

    // If not provided and not required, use default or skip
    if (value === undefined || value === null) {
      if (param.defaultValue !== undefined) {
        sanitizedArgs[param.name] = param.defaultValue;
      }
      continue;
    }

    // Type validation
    if (param.type === 'enum' && param.enumValues) {
      if (!param.enumValues.includes(String(value))) {
        errors.push({
          parameter: param.name,
          message: `Invalid value '${value}' for '${param.name}'. Must be one of: ${param.enumValues.join(', ')}`,
        });
        continue;
      }
    }

    if (param.type === 'number' && typeof value !== 'number') {
      const parsed = Number(value);
      if (isNaN(parsed)) {
        errors.push({
          parameter: param.name,
          message: `Parameter '${param.name}' must be a number`,
        });
        continue;
      }
      sanitizedArgs[param.name] = parsed;
      continue;
    }

    if (param.type === 'boolean' && typeof value !== 'boolean') {
      sanitizedArgs[param.name] = value === 'true' || value === true;
      continue;
    }

    sanitizedArgs[param.name] = value;
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedArgs: errors.length === 0 ? sanitizedArgs : undefined,
  };
}

/**
 * Generate tool prompt for LLM classification
 */
export function generateToolPrompt(): string {
  let prompt = 'Available tools:\n\n';

  for (const tool of TOOL_DEFINITIONS) {
    prompt += `## ${tool.name}\n`;
    prompt += `Description: ${tool.description}\n`;
    prompt += `Category: ${tool.category}\n`;
    if (tool.entityType) {
      prompt += `Entity: ${tool.entityType}\n`;
    }
    if (tool.parameters.length > 0) {
      prompt += 'Parameters:\n';
      for (const param of tool.parameters) {
        const required = param.required ? '(required)' : '(optional)';
        prompt += `  - ${param.name} ${required}: ${param.description}`;
        if (param.enumValues) {
          prompt += ` [${param.enumValues.join(', ')}]`;
        }
        if (param.defaultValue !== undefined) {
          prompt += ` (default: ${param.defaultValue})`;
        }
        prompt += '\n';
      }
    }
    prompt += `Examples: ${tool.examples.join('; ')}\n\n`;
  }

  return prompt;
}

/**
 * Get compact tool list for prompts
 */
export function getToolSummary(): string {
  return TOOL_DEFINITIONS.map(t => `${t.name}: ${t.description}`).join('\n');
}
