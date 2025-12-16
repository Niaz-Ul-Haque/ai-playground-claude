import type {
  Task,
  TaskFilters,
  TaskStats,
  SuggestedAction,
  Workflow,
  ProcessRecommendation,
  PrefilledMaterial,
  CycleTimeStats,
  Label,
  Comment,
  TaskStatus
} from '@/types/task';
import type {
  Client,
  ClientRelationship,
  TimelineEvent,
  Artifact,
  ClientAsset,
  AssetAlert,
  ClientWithDetails
} from '@/types/client';
import type {
  Opportunity,
  OpportunityFilters,
  OpportunityStats,
  SnoozeOptions,
  DismissReason,
  SnoozeDuration
} from '@/types/opportunity';
import type {
  ReviewQueueItem,
  ReviewQueueFilters,
  ReviewQueueStats,
  ReviewItemStatus,
  BatchOperationResult
} from '@/types/review-queue';
import type {
  Integration,
  AvailableIntegration,
  SyncLogEntry,
  IntegrationStats,
  IntegrationFilters,
  IntegrationProvider,
  IntegrationStatus,
  ExportOptions,
  ExportResult
} from '@/types/integration';
import type {
  AutomationSuggestion,
  ActiveAutomation,
  AutomationException,
  AdaptationLogEntry,
  AutomationActivityEntry,
  AutomationStats,
  AutomationFilters,
  ExceptionFilters,
  SafetyBounds,
  AutomationSuggestionStatus,
  ActiveAutomationStatus,
  AutomationExceptionStatus
} from '@/types/automation';
import { MOCK_TASKS, MOCK_LABELS, getLabels, createLabel, deleteLabel, getCustomStatuses, createCustomStatus, type CustomStatus } from './tasks';
import { MOCK_CLIENTS } from './clients';
import { MOCK_RELATIONSHIPS } from './relationships';
import { MOCK_TIMELINE } from './timeline';
import { MOCK_ARTIFACTS } from './artifacts';
import { MOCK_ASSETS } from './assets';
import { MOCK_SUGGESTED_ACTIONS } from './suggested-actions';
import { MOCK_WORKFLOWS } from './workflows';
import { MOCK_MATERIALS } from './materials';
import { MOCK_RECOMMENDATIONS } from './recommendations';
import { MOCK_OPPORTUNITIES } from './opportunities';
import { MOCK_REVIEW_QUEUE } from './review-queue';
import {
  mockIntegrations,
  availableIntegrations,
  mockSyncLogs,
} from './integrations';
import {
  mockAutomationSuggestions,
  mockActiveAutomations,
  mockAutomationExceptions,
  mockAdaptationLogs,
  mockAutomationActivity,
} from './automations';
import {
  mockKPIs,
  mockCharts,
  mockInsights,
  mockFocusRecommendations,
  mockClientMetrics,
  mockRevenueMetrics,
  mockPipelineMetrics,
  mockPerformanceMetrics,
} from './analytics';
import {
  mockActivityEntries,
  mockActivityStats,
} from './activity';
import {
  mockUserProfile,
  mockSecuritySettings,
  mockNotificationSettings,
  mockPreferenceSettings,
  mockProductSettings,
  mockTeamSettings,
  mockBillingSettings,
} from './settings';
import type {
  KPIMetric,
  ChartConfig,
  DashboardInsight,
  FocusRecommendation,
  ClientMetrics,
  RevenueMetrics,
  PipelineMetrics,
  PerformanceMetrics,
} from '@/types/analytics';
import type {
  ActivityEntry,
  ActivityFilters,
  ActivityStats,
  ActivityGroup,
} from '@/types/activity';
import type {
  UserProfile,
  SecuritySettings,
  NotificationSettings,
  PreferenceSettings,
  ProductSettings,
  TeamSettings,
  BillingSettings,
} from '@/types/settings';

// In-memory storage
let tasks: Task[] = [...MOCK_TASKS];
let clients: Client[] = [...MOCK_CLIENTS];
const relationships: ClientRelationship[] = [...MOCK_RELATIONSHIPS];
const timeline: TimelineEvent[] = [...MOCK_TIMELINE];
const artifacts: Artifact[] = [...MOCK_ARTIFACTS];
const assets: ClientAsset[] = [...MOCK_ASSETS];
let suggestedActions: SuggestedAction[] = [...MOCK_SUGGESTED_ACTIONS];
let workflows: Workflow[] = [...MOCK_WORKFLOWS];
let materials: PrefilledMaterial[] = [...MOCK_MATERIALS];
let recommendations: ProcessRecommendation[] = [...MOCK_RECOMMENDATIONS];
let opportunities: Opportunity[] = [...MOCK_OPPORTUNITIES];
let reviewQueue: ReviewQueueItem[] = [...MOCK_REVIEW_QUEUE];
let integrations: Integration[] = [...mockIntegrations];
let syncLogs: SyncLogEntry[] = [...mockSyncLogs];
let automationSuggestions: AutomationSuggestion[] = [...mockAutomationSuggestions];
let activeAutomations: ActiveAutomation[] = [...mockActiveAutomations];
let automationExceptions: AutomationException[] = [...mockAutomationExceptions];
let adaptationLogs: AdaptationLogEntry[] = [...mockAdaptationLogs];
let automationActivity: AutomationActivityEntry[] = [...mockAutomationActivity];

// Task functions
export function getTasks(filters?: TaskFilters): Task[] {
  let filtered = [...tasks];

  if (filters?.status) {
    filtered = filtered.filter(task => task.status === filters.status);
  }

  if (filters?.clientId) {
    filtered = filtered.filter(task => task.clientId === filters.clientId);
  }

  if (filters?.aiCompleted !== undefined) {
    filtered = filtered.filter(task => task.aiCompleted === filters.aiCompleted);
  }

  if (filters?.dueDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    filtered = filtered.filter(task => {
      const dueDate = new Date(task.dueDate);

      switch (filters.dueDate) {
        case 'today':
          return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          return dueDate >= today && dueDate <= weekFromNow;
        case 'overdue':
          return dueDate < today && task.status !== 'completed';
        default:
          return true;
      }
    });
  }

  // Sort by due date (earliest first), then by priority
  return filtered.sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find(task => task.id === id);
}

export function updateTask(id: string, updates: Partial<Task>): Task | undefined {
  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return undefined;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return tasks[taskIndex];
}

// Kanban board helpers
export function getTasksByStatus(status: TaskStatus | string): Task[] {
  return tasks
    .filter(task => task.status === status)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function updateTaskStatus(taskId: string, newStatus: TaskStatus | string, newOrder?: number): Task | undefined {
  const task = getTaskById(taskId);
  if (!task) return undefined;

  return updateTask(taskId, {
    status: newStatus as TaskStatus,
    order: newOrder ?? task.order,
  });
}

export function reorderTask(taskId: string, newOrder: number): Task | undefined {
  return updateTask(taskId, { order: newOrder });
}

export function addLabelToTask(taskId: string, label: Label): Task | undefined {
  const task = getTaskById(taskId);
  if (!task) return undefined;

  const labels = task.labels || [];
  if (labels.find(l => l.id === label.id)) {
    return task; // Label already exists
  }

  return updateTask(taskId, {
    labels: [...labels, label],
  });
}

export function removeLabelFromTask(taskId: string, labelId: string): Task | undefined {
  const task = getTaskById(taskId);
  if (!task) return undefined;

  const labels = task.labels || [];
  return updateTask(taskId, {
    labels: labels.filter(l => l.id !== labelId),
  });
}

export function addCommentToTask(taskId: string, text: string, authorName: string): Task | undefined {
  const task = getTaskById(taskId);
  if (!task) return undefined;

  const newComment: Comment = {
    id: `c${Date.now()}`,
    text,
    authorId: 'user1',
    authorName,
    createdAt: new Date().toISOString(),
  };

  const comments = task.comments || [];
  return updateTask(taskId, {
    comments: [...comments, newComment],
  });
}

// Re-export label and status functions
export { getLabels, createLabel, deleteLabel, getCustomStatuses, createCustomStatus, type CustomStatus };

// Client functions
export function getClients(filters?: { name?: string; riskProfile?: string }): Client[] {
  let filtered = [...clients];

  if (filters?.name) {
    const searchTerm = filters.name.toLowerCase();
    filtered = filtered.filter(client =>
      client.name.toLowerCase().includes(searchTerm)
    );
  }

  if (filters?.riskProfile) {
    filtered = filtered.filter(client => client.riskProfile === filters.riskProfile);
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export function getClientById(id: string): Client | undefined {
  return clients.find(client => client.id === id);
}

export function getClientByName(name: string): Client | undefined {
  const searchTerm = name.toLowerCase();
  return clients.find(client =>
    client.name.toLowerCase().includes(searchTerm)
  );
}

// Extended client functions
export function getClientRelationships(clientId: string): ClientRelationship[] {
  return relationships.filter(rel => rel.clientId === clientId);
}

export function getClientTimeline(clientId: string, limit?: number): TimelineEvent[] {
  const clientTimeline = timeline
    .filter(event => event.clientId === clientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return limit ? clientTimeline.slice(0, limit) : clientTimeline;
}

export function getClientArtifacts(clientId: string): Artifact[] {
  return artifacts
    .filter(art => art.clientId === clientId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function getClientAssets(clientId: string): ClientAsset[] {
  return assets.filter(asset => asset.clientId === clientId);
}

export function getClientAlerts(clientId: string): AssetAlert[] {
  const clientAssets = getClientAssets(clientId);
  const allAlerts: AssetAlert[] = [];

  clientAssets.forEach(asset => {
    if (asset.alerts) {
      allAlerts.push(...asset.alerts);
    }
  });

  // Sort by severity (critical > warning > info) then by due date
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return allAlerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });
}

export function getClientWithDetails(clientId: string): ClientWithDetails | undefined {
  const client = getClientById(clientId);
  if (!client) return undefined;

  return {
    ...client,
    relationships: getClientRelationships(clientId),
    timeline: getClientTimeline(clientId),
    artifacts: getClientArtifacts(clientId),
    assets: getClientAssets(clientId),
    alerts: getClientAlerts(clientId)
  };
}

// Search clients with extended filters
export interface ClientFilters {
  name?: string;
  riskProfile?: string;
  status?: 'active' | 'inactive' | 'prospect';
  minPortfolioValue?: number;
  maxPortfolioValue?: number;
  city?: string;
  tags?: string[];
}

export function searchClients(filters?: ClientFilters): Client[] {
  let filtered = [...clients];

  if (filters?.name) {
    const searchTerm = filters.name.toLowerCase();
    filtered = filtered.filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm)
    );
  }

  if (filters?.riskProfile) {
    filtered = filtered.filter(client => client.riskProfile === filters.riskProfile);
  }

  if (filters?.status) {
    filtered = filtered.filter(client => (client.status || 'active') === filters.status);
  }

  if (filters?.minPortfolioValue !== undefined) {
    filtered = filtered.filter(client => client.portfolioValue >= filters.minPortfolioValue!);
  }

  if (filters?.maxPortfolioValue !== undefined) {
    filtered = filtered.filter(client => client.portfolioValue <= filters.maxPortfolioValue!);
  }

  if (filters?.city) {
    const searchCity = filters.city.toLowerCase();
    filtered = filtered.filter(client => client.city.toLowerCase().includes(searchCity));
  }

  if (filters?.tags && filters.tags.length > 0) {
    filtered = filtered.filter(client =>
      filters.tags!.some(tag => client.tags.includes(tag))
    );
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

// Get client statistics
export function getClientStats() {
  const allClients = [...clients];
  const totalAUM = allClients.reduce((sum, c) => sum + c.portfolioValue, 0);

  return {
    totalClients: allClients.length,
    activeClients: allClients.filter(c => (c.status || 'active') === 'active').length,
    totalAUM,
    avgPortfolioValue: totalAUM / allClients.length,
    byRiskProfile: {
      conservative: allClients.filter(c => c.riskProfile === 'conservative').length,
      moderate: allClients.filter(c => c.riskProfile === 'moderate').length,
      aggressive: allClients.filter(c => c.riskProfile === 'aggressive').length
    }
  };
}

// Reset function for testing
export function resetMockData(): void {
  tasks = [...MOCK_TASKS];
  clients = [...MOCK_CLIENTS];
  suggestedActions = [...MOCK_SUGGESTED_ACTIONS];
  workflows = [...MOCK_WORKFLOWS];
  materials = [...MOCK_MATERIALS];
  recommendations = [...MOCK_RECOMMENDATIONS];
  opportunities = [...MOCK_OPPORTUNITIES];
  reviewQueue = [...MOCK_REVIEW_QUEUE];
  integrations = [...mockIntegrations];
  syncLogs = [...mockSyncLogs];
  automationSuggestions = [...mockAutomationSuggestions];
  activeAutomations = [...mockActiveAutomations];
  automationExceptions = [...mockAutomationExceptions];
  adaptationLogs = [...mockAdaptationLogs];
  automationActivity = [...mockAutomationActivity];
}

// ============================================
// Task Statistics
// ============================================

export function getTaskStats(): TaskStats {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    needsReview: tasks.filter(t => t.status === 'needs-review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < today && t.status !== 'completed';
    }).length,
    dueToday: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length,
    dueThisWeek: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length,
    aiCompleted: tasks.filter(t => t.aiCompleted).length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
      medium: tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length,
      low: tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length,
    },
  };
}

// Extended task filtering with search
export function searchTasks(filters?: TaskFilters): Task[] {
  let filtered = [...tasks];

  if (filters?.status) {
    filtered = filtered.filter(task => task.status === filters.status);
  }

  if (filters?.clientId) {
    filtered = filtered.filter(task => task.clientId === filters.clientId);
  }

  if (filters?.aiCompleted !== undefined) {
    filtered = filtered.filter(task => task.aiCompleted === filters.aiCompleted);
  }

  if (filters?.priority) {
    filtered = filtered.filter(task => task.priority === filters.priority);
  }

  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term) ||
      task.clientName?.toLowerCase().includes(term) ||
      task.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  if (filters?.dueDate && filters.dueDate !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    filtered = filtered.filter(task => {
      const dueDate = new Date(task.dueDate);

      switch (filters.dueDate) {
        case 'today':
          return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          return dueDate >= today && dueDate <= weekFromNow;
        case 'overdue':
          return dueDate < today && task.status !== 'completed';
        default:
          return true;
      }
    });
  }

  // Sort by due date (earliest first), then by priority
  return filtered.sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================
// Suggested Actions
// ============================================

export function getSuggestedActions(status?: 'pending' | 'accepted' | 'dismissed'): SuggestedAction[] {
  let filtered = [...suggestedActions];

  if (status) {
    filtered = filtered.filter(action => action.status === status);
  }

  // Sort by priority (high first), then by confidence
  return filtered.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.confidence - a.confidence;
  });
}

export function updateSuggestedAction(id: string, status: 'accepted' | 'dismissed'): SuggestedAction | undefined {
  const index = suggestedActions.findIndex(a => a.id === id);
  if (index === -1) return undefined;

  suggestedActions[index] = { ...suggestedActions[index], status };
  return suggestedActions[index];
}

// ============================================
// Workflows
// ============================================

export function getWorkflows(status?: 'active' | 'completed' | 'paused' | 'cancelled'): Workflow[] {
  let filtered = [...workflows];

  if (status) {
    filtered = filtered.filter(wf => wf.status === status);
  }

  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getWorkflowById(id: string): Workflow | undefined {
  return workflows.find(wf => wf.id === id);
}

export function getWorkflowsByClient(clientId: string): Workflow[] {
  return workflows.filter(wf => wf.clientId === clientId);
}

export function getWorkflowProgress(workflowId: string): { completed: number; total: number; percentage: number } | undefined {
  const workflow = workflows.find(wf => wf.id === workflowId);
  if (!workflow) return undefined;

  const completed = workflow.steps.filter(s => s.status === 'completed').length;
  const total = workflow.steps.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}

// ============================================
// Prefilled Materials
// ============================================

export function getMaterials(filters?: { clientId?: string; taskId?: string; workflowId?: string; status?: string }): PrefilledMaterial[] {
  let filtered = [...materials];

  if (filters?.clientId) {
    filtered = filtered.filter(m => m.clientId === filters.clientId);
  }

  if (filters?.taskId) {
    filtered = filtered.filter(m => m.relatedTaskId === filters.taskId);
  }

  if (filters?.workflowId) {
    filtered = filtered.filter(m => m.relatedWorkflowId === filters.workflowId);
  }

  if (filters?.status) {
    filtered = filtered.filter(m => m.status === filters.status);
  }

  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getMaterialById(id: string): PrefilledMaterial | undefined {
  return materials.find(m => m.id === id);
}

// ============================================
// Process Recommendations
// ============================================

export function getRecommendations(status?: 'pending' | 'applied' | 'dismissed' | 'reverted'): ProcessRecommendation[] {
  let filtered = [...recommendations];

  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }

  // Sort by impact (high first), then by effort (low first)
  const impactOrder = { high: 0, medium: 1, low: 2 };
  const effortOrder = { low: 0, medium: 1, high: 2 };

  return filtered.sort((a, b) => {
    if (impactOrder[a.impactLevel] !== impactOrder[b.impactLevel]) {
      return impactOrder[a.impactLevel] - impactOrder[b.impactLevel];
    }
    return effortOrder[a.effort] - effortOrder[b.effort];
  });
}

export function updateRecommendation(id: string, updates: Partial<ProcessRecommendation>): ProcessRecommendation | undefined {
  const index = recommendations.findIndex(r => r.id === id);
  if (index === -1) return undefined;

  recommendations[index] = { ...recommendations[index], ...updates };
  return recommendations[index];
}

// ============================================
// Cycle Time Statistics
// ============================================

export function getCycleTimeStats(taskType?: string): CycleTimeStats[] {
  // Mock cycle time data based on task tags
  const cycleTimeData: CycleTimeStats[] = [
    {
      taskType: 'portfolio-review',
      averageMinutes: 35,
      minMinutes: 20,
      maxMinutes: 60,
      sampleSize: 24,
      trend: 'improving',
    },
    {
      taskType: 'email-draft',
      averageMinutes: 12,
      minMinutes: 5,
      maxMinutes: 25,
      sampleSize: 48,
      trend: 'stable',
    },
    {
      taskType: 'meeting-notes',
      averageMinutes: 18,
      minMinutes: 10,
      maxMinutes: 30,
      sampleSize: 32,
      trend: 'improving',
    },
    {
      taskType: 'client-call',
      averageMinutes: 25,
      minMinutes: 15,
      maxMinutes: 45,
      sampleSize: 56,
      trend: 'stable',
    },
    {
      taskType: 'annual-review',
      averageMinutes: 90,
      minMinutes: 60,
      maxMinutes: 150,
      sampleSize: 12,
      trend: 'improving',
    },
    {
      taskType: 'tax-planning',
      averageMinutes: 45,
      minMinutes: 30,
      maxMinutes: 90,
      sampleSize: 18,
      trend: 'declining',
    },
  ];

  if (taskType) {
    return cycleTimeData.filter(ct => ct.taskType === taskType);
  }

  return cycleTimeData;
}

export function getCycleTimeForTask(taskId: string): CycleTimeStats | undefined {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return undefined;

  // Match task to cycle time type based on tags or AI action type
  const allStats = getCycleTimeStats();

  if (task.aiActionType) {
    const typeMapping: Record<string, string> = {
      'email_draft': 'email-draft',
      'portfolio_review': 'portfolio-review',
      'meeting_notes': 'meeting-notes',
    };
    const mappedType = typeMapping[task.aiActionType];
    if (mappedType) {
      return allStats.find(s => s.taskType === mappedType);
    }
  }

  // Try to match by tags
  for (const tag of task.tags) {
    const match = allStats.find(s => s.taskType === tag);
    if (match) return match;
  }

  return undefined;
}

// ============================================
// Opportunities
// ============================================

export function getOpportunities(filters?: OpportunityFilters): Opportunity[] {
  let filtered = [...opportunities];

  // Filter by type
  if (filters?.type) {
    filtered = filtered.filter(opp => opp.type === filters.type);
  }

  // Filter by status
  if (filters?.status) {
    filtered = filtered.filter(opp => opp.status === filters.status);
  }

  // Filter by impact level
  if (filters?.impactLevel) {
    filtered = filtered.filter(opp => opp.impactLevel === filters.impactLevel);
  }

  // Filter by readiness
  if (filters?.readiness) {
    filtered = filtered.filter(opp => opp.readiness === filters.readiness);
  }

  // Filter by client
  if (filters?.clientId) {
    filtered = filtered.filter(opp => opp.clientId === filters.clientId);
  }

  // Filter by search term
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(opp =>
      opp.title.toLowerCase().includes(term) ||
      opp.description.toLowerCase().includes(term) ||
      opp.clientName.toLowerCase().includes(term) ||
      opp.whyNow.toLowerCase().includes(term) ||
      opp.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }

  // Filter by date range
  if (filters?.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter(opp => {
      const surfacedDate = new Date(opp.surfacedAt);

      switch (filters.dateRange) {
        case 'today':
          return surfacedDate >= today && surfacedDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return surfacedDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return surfacedDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // Sort
  const sortBy = filters?.sortBy || 'impact';
  const sortOrder = filters?.sortOrder || 'desc';
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        return (a.impactScore - b.impactScore) * multiplier;
      case 'date':
        return (new Date(a.surfacedAt).getTime() - new Date(b.surfacedAt).getTime()) * multiplier;
      case 'expiry':
        if (!a.expiresAt && !b.expiresAt) return 0;
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return (new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()) * multiplier;
      case 'client':
        return a.clientName.localeCompare(b.clientName) * multiplier;
      default:
        return (a.priority || 0) - (b.priority || 0) * multiplier;
    }
  });

  return filtered;
}

export function getOpportunityById(id: string): Opportunity | undefined {
  return opportunities.find(opp => opp.id === id);
}

export function getOpportunitiesByClient(clientId: string): Opportunity[] {
  return opportunities
    .filter(opp => opp.clientId === clientId)
    .sort((a, b) => b.impactScore - a.impactScore);
}

export function getActiveOpportunities(): Opportunity[] {
  return opportunities
    .filter(opp => opp.status === 'new' || opp.status === 'viewed')
    .sort((a, b) => b.impactScore - a.impactScore);
}

export function getOpportunityStats(): OpportunityStats {
  const allOpps = [...opportunities];

  // Filter out dismissed opportunities for active counts
  const activeOpps = allOpps.filter(opp => opp.status !== 'dismissed');

  // Calculate expiring this week
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringThisWeek = activeOpps.filter(opp => {
    if (!opp.expiresAt) return false;
    const expiryDate = new Date(opp.expiresAt);
    return expiryDate >= now && expiryDate <= weekFromNow;
  }).length;

  // Calculate total estimated value
  const totalEstimatedValue = activeOpps.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);

  return {
    total: allOpps.length,
    byStatus: {
      new: allOpps.filter(opp => opp.status === 'new').length,
      viewed: allOpps.filter(opp => opp.status === 'viewed').length,
      snoozed: allOpps.filter(opp => opp.status === 'snoozed').length,
      dismissed: allOpps.filter(opp => opp.status === 'dismissed').length,
      actioned: allOpps.filter(opp => opp.status === 'actioned').length,
    },
    byType: {
      contract: allOpps.filter(opp => opp.type === 'contract').length,
      milestone: allOpps.filter(opp => opp.type === 'milestone').length,
      market: allOpps.filter(opp => opp.type === 'market').length,
    },
    byImpact: {
      high: allOpps.filter(opp => opp.impactLevel === 'high').length,
      medium: allOpps.filter(opp => opp.impactLevel === 'medium').length,
      low: allOpps.filter(opp => opp.impactLevel === 'low').length,
    },
    byReadiness: {
      ready: activeOpps.filter(opp => opp.readiness === 'ready').length,
      needs_prep: activeOpps.filter(opp => opp.readiness === 'needs_prep').length,
      blocked: activeOpps.filter(opp => opp.readiness === 'blocked').length,
    },
    totalEstimatedValue,
    expiringThisWeek,
  };
}

export function updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | undefined {
  const index = opportunities.findIndex(opp => opp.id === id);
  if (index === -1) return undefined;

  opportunities[index] = { ...opportunities[index], ...updates };
  return opportunities[index];
}

export function snoozeOpportunity(id: string, options: SnoozeOptions): Opportunity | undefined {
  const opp = opportunities.find(o => o.id === id);
  if (!opp) return undefined;

  // Calculate snooze until date
  let snoozedUntil: string;

  if (options.duration === 'custom' && options.customDate) {
    snoozedUntil = options.customDate;
  } else {
    const now = new Date();
    const daysMap: Record<SnoozeDuration, number> = {
      '1_day': 1,
      '3_days': 3,
      '1_week': 7,
      '2_weeks': 14,
      '1_month': 30,
      'custom': 0,
    };
    const days = daysMap[options.duration] || 7;
    snoozedUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  return updateOpportunity(id, {
    status: 'snoozed',
    snoozedUntil,
    snoozeReason: options.reason,
  });
}

export function dismissOpportunity(id: string, reason: DismissReason): Opportunity | undefined {
  return updateOpportunity(id, {
    status: 'dismissed',
    dismissReason: reason,
  });
}

export function markOpportunityViewed(id: string): Opportunity | undefined {
  const opp = opportunities.find(o => o.id === id);
  if (!opp || opp.status !== 'new') return opp;

  return updateOpportunity(id, { status: 'viewed' });
}

export function markOpportunityActioned(id: string): Opportunity | undefined {
  return updateOpportunity(id, {
    status: 'actioned',
    actionedAt: new Date().toISOString(),
  });
}

// Get count of new opportunities (for badge in navigation)
export function getNewOpportunityCount(): number {
  return opportunities.filter(opp => opp.status === 'new').length;
}

// ============================================
// Review Queue
// ============================================

export function getReviewQueue(filters?: ReviewQueueFilters): ReviewQueueItem[] {
  let filtered = [...reviewQueue];

  // Filter by status
  if (filters?.status) {
    filtered = filtered.filter(item => item.status === filters.status);
  }

  // Filter by source type
  if (filters?.sourceType) {
    filtered = filtered.filter(item => item.sourceType === filters.sourceType);
  }

  // Filter by item type
  if (filters?.type) {
    filtered = filtered.filter(item => item.type === filters.type);
  }

  // Filter by confidence level
  if (filters?.confidenceLevel) {
    filtered = filtered.filter(item => item.confidenceLevel === filters.confidenceLevel);
  }

  // Filter by client
  if (filters?.clientId) {
    filtered = filtered.filter(item => item.suggestedClientId === filters.clientId);
  }

  // Filter by search term
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      item.sourceName.toLowerCase().includes(term) ||
      item.suggestedClientName?.toLowerCase().includes(term) ||
      item.matchReason?.toLowerCase().includes(term) ||
      item.extractedData.some(d =>
        String(d.value).toLowerCase().includes(term) ||
        d.fieldName.toLowerCase().includes(term)
      )
    );
  }

  // Filter by date range
  if (filters?.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter(item => {
      const extractedDate = new Date(item.extractedAt);

      switch (filters.dateRange) {
        case 'today':
          return extractedDate >= today && extractedDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return extractedDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return extractedDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // Sort
  const sortBy = filters?.sortBy || 'date';
  const sortOrder = filters?.sortOrder || 'desc';
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (new Date(a.extractedAt).getTime() - new Date(b.extractedAt).getTime()) * multiplier;
      case 'confidence':
        return (a.confidenceScore - b.confidenceScore) * multiplier;
      case 'source':
        return a.sourceName.localeCompare(b.sourceName) * multiplier;
      case 'type':
        return a.type.localeCompare(b.type) * multiplier;
      default:
        return (new Date(a.extractedAt).getTime() - new Date(b.extractedAt).getTime()) * multiplier;
    }
  });

  return filtered;
}

export function getReviewQueueById(id: string): ReviewQueueItem | undefined {
  return reviewQueue.find(item => item.id === id);
}

export function getReviewQueueStats(): ReviewQueueStats {
  const all = [...reviewQueue];

  return {
    total: all.length,
    pending: all.filter(i => i.status === 'pending').length,
    approved: all.filter(i => i.status === 'approved').length,
    rejected: all.filter(i => i.status === 'rejected').length,
    edited: all.filter(i => i.status === 'edited').length,
    merged: all.filter(i => i.status === 'merged').length,
    highConfidence: all.filter(i => i.confidenceLevel === 'high').length,
    mediumConfidence: all.filter(i => i.confidenceLevel === 'medium').length,
    lowConfidence: all.filter(i => i.confidenceLevel === 'low').length,
    bySource: {
      file: all.filter(i => i.sourceType === 'file').length,
      email: all.filter(i => i.sourceType === 'email').length,
      calendar: all.filter(i => i.sourceType === 'calendar').length,
      manual: all.filter(i => i.sourceType === 'manual').length,
      integration: all.filter(i => i.sourceType === 'integration').length,
    },
    byType: {
      client_data: all.filter(i => i.type === 'client_data').length,
      contact_info: all.filter(i => i.type === 'contact_info').length,
      transaction: all.filter(i => i.type === 'transaction').length,
      document: all.filter(i => i.type === 'document').length,
      relationship: all.filter(i => i.type === 'relationship').length,
    },
  };
}

export function updateReviewItem(
  id: string,
  updates: Partial<ReviewQueueItem>
): ReviewQueueItem | undefined {
  const index = reviewQueue.findIndex(item => item.id === id);
  if (index === -1) return undefined;

  reviewQueue[index] = { ...reviewQueue[index], ...updates };
  return reviewQueue[index];
}

export function batchUpdateReviewItems(
  ids: string[],
  status: ReviewItemStatus
): BatchOperationResult {
  let success = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  ids.forEach(id => {
    const result = updateReviewItem(id, {
      status,
      reviewedAt: new Date().toISOString(),
    });

    if (result) {
      success++;
    } else {
      failed++;
      errors.push({ id, error: 'Item not found' });
    }
  });

  return { success, failed, errors };
}

export function getPendingReviewCount(): number {
  return reviewQueue.filter(item => item.status === 'pending').length;
}

// ============================================
// Integrations
// ============================================

export function getIntegrations(filters?: IntegrationFilters): Integration[] {
  let filtered = [...integrations];

  if (filters?.category) {
    filtered = filtered.filter(int => int.category === filters.category);
  }

  if (filters?.status) {
    filtered = filtered.filter(int => int.status === filters.status);
  }

  if (filters?.provider) {
    filtered = filtered.filter(int => int.provider === filters.provider);
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(int =>
      int.providerName.toLowerCase().includes(term) ||
      int.metadata?.accountEmail?.toString().toLowerCase().includes(term)
    );
  }

  return filtered.sort((a, b) =>
    new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime()
  );
}

export function getIntegrationById(id: string): Integration | undefined {
  return integrations.find(int => int.id === id);
}

export function getIntegrationByProvider(provider: IntegrationProvider): Integration | undefined {
  return integrations.find(int => int.provider === provider);
}

export function getAvailableIntegrations(): AvailableIntegration[] {
  return availableIntegrations;
}

export function getUnconnectedProviders(): AvailableIntegration[] {
  const connectedProviders = integrations
    .filter(int => int.status !== 'disconnected')
    .map(int => int.provider);

  return availableIntegrations.filter(
    avail => !connectedProviders.includes(avail.provider)
  );
}

export function getIntegrationStats(): IntegrationStats {
  const all = [...integrations];

  return {
    totalConnected: all.filter(i => i.status !== 'disconnected').length,
    healthy: all.filter(i => i.status === 'healthy').length,
    warning: all.filter(i => i.status === 'warning').length,
    error: all.filter(i => i.status === 'error').length,
    syncing: all.filter(i => i.status === 'syncing').length,
    totalRecordsSynced: all.reduce((sum, i) => sum + i.recordsSynced, 0),
    lastSyncTime: all
      .filter(i => i.lastSyncAt)
      .sort((a, b) => new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime())[0]
      ?.lastSyncAt,
  };
}

export function updateIntegration(id: string, updates: Partial<Integration>): Integration | undefined {
  const index = integrations.findIndex(int => int.id === id);
  if (index === -1) return undefined;

  integrations[index] = { ...integrations[index], ...updates };
  return integrations[index];
}

export function connectIntegration(provider: IntegrationProvider): Integration {
  const available = availableIntegrations.find(a => a.provider === provider);
  if (!available) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const newIntegration: Integration = {
    id: `int-${Date.now()}`,
    provider,
    providerName: available.name,
    category: available.category,
    status: 'syncing',
    connectedAt: new Date().toISOString(),
    connectedBy: 'advisor@example.com',
    recordsSynced: 0,
    syncFrequency: 'hourly',
    scope: ['read'],
  };

  integrations.push(newIntegration);
  return newIntegration;
}

export function disconnectIntegration(id: string): boolean {
  const index = integrations.findIndex(int => int.id === id);
  if (index === -1) return false;

  integrations[index] = {
    ...integrations[index],
    status: 'disconnected',
  };
  return true;
}

export function triggerSync(id: string): Integration | undefined {
  const integration = integrations.find(int => int.id === id);
  if (!integration) return undefined;

  return updateIntegration(id, {
    status: 'syncing',
    lastSyncAt: new Date().toISOString(),
  });
}

export function getSyncLogs(integrationId?: string, limit?: number): SyncLogEntry[] {
  let logs = [...syncLogs];

  if (integrationId) {
    logs = logs.filter(log => log.integrationId === integrationId);
  }

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return limit ? logs.slice(0, limit) : logs;
}

// Export simulation
export function createExport(options: ExportOptions): ExportResult {
  return {
    id: `export-${Date.now()}`,
    status: 'processing',
    format: options.format,
    recordCount: options.scope === 'all_clients' ? clients.length : 0,
    createdAt: new Date().toISOString(),
  };
}

// Get integration health indicator
export function getIntegrationHealthIndicator(): 'healthy' | 'warning' | 'error' {
  const stats = getIntegrationStats();
  if (stats.error > 0) return 'error';
  if (stats.warning > 0) return 'warning';
  return 'healthy';
}

// ============================================
// Automations
// ============================================

export function getAutomationSuggestions(
  status?: AutomationSuggestionStatus
): AutomationSuggestion[] {
  let filtered = [...automationSuggestions];

  if (status) {
    filtered = filtered.filter(sug => sug.status === status);
  }

  return filtered.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export function getAutomationSuggestionById(id: string): AutomationSuggestion | undefined {
  return automationSuggestions.find(sug => sug.id === id);
}

export function updateAutomationSuggestion(
  id: string,
  updates: Partial<AutomationSuggestion>
): AutomationSuggestion | undefined {
  const index = automationSuggestions.findIndex(sug => sug.id === id);
  if (index === -1) return undefined;

  automationSuggestions[index] = { ...automationSuggestions[index], ...updates };
  return automationSuggestions[index];
}

export function approveAutomationSuggestion(id: string): ActiveAutomation | undefined {
  const suggestion = automationSuggestions.find(sug => sug.id === id);
  if (!suggestion) return undefined;

  // Update suggestion status
  updateAutomationSuggestion(id, { status: 'approved' });

  // Create new active automation
  const newAutomation: ActiveAutomation = {
    id: `auto-${Date.now()}`,
    name: suggestion.automationDescription.split(' ').slice(0, 5).join(' '),
    description: suggestion.automationDescription,
    category: suggestion.category,
    triggerType: suggestion.triggerType,
    triggerConfig: {},
    actionType: suggestion.actionType,
    actionConfig: {},
    status: 'running',
    createdAt: new Date().toISOString(),
    createdBy: 'advisor@example.com',
    successCount: 0,
    failureCount: 0,
    exceptionCount: 0,
    safetyBounds: {
      maxPerDay: 10,
    },
    isSystemGenerated: true,
    sourcePattern: suggestion.patternDescription,
  };

  activeAutomations.push(newAutomation);
  return newAutomation;
}

export function rejectAutomationSuggestion(id: string): AutomationSuggestion | undefined {
  return updateAutomationSuggestion(id, { status: 'rejected' });
}

export function getActiveAutomations(
  filters?: AutomationFilters
): ActiveAutomation[] {
  let filtered = [...activeAutomations];

  if (filters?.category) {
    filtered = filtered.filter(auto => auto.category === filters.category);
  }

  if (filters?.status) {
    filtered = filtered.filter(auto => auto.status === filters.status);
  }

  if (filters?.triggerType) {
    filtered = filtered.filter(auto => auto.triggerType === filters.triggerType);
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(auto =>
      auto.name.toLowerCase().includes(term) ||
      auto.description.toLowerCase().includes(term)
    );
  }

  return filtered.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getActiveAutomationById(id: string): ActiveAutomation | undefined {
  return activeAutomations.find(auto => auto.id === id);
}

export function updateActiveAutomation(
  id: string,
  updates: Partial<ActiveAutomation>
): ActiveAutomation | undefined {
  const index = activeAutomations.findIndex(auto => auto.id === id);
  if (index === -1) return undefined;

  activeAutomations[index] = { ...activeAutomations[index], ...updates };
  return activeAutomations[index];
}

export function pauseAutomation(id: string): ActiveAutomation | undefined {
  return updateActiveAutomation(id, { status: 'paused' });
}

export function resumeAutomation(id: string): ActiveAutomation | undefined {
  return updateActiveAutomation(id, { status: 'running' });
}

export function updateSafetyBounds(
  id: string,
  bounds: Partial<SafetyBounds>
): ActiveAutomation | undefined {
  const automation = activeAutomations.find(auto => auto.id === id);
  if (!automation) return undefined;

  return updateActiveAutomation(id, {
    safetyBounds: { ...automation.safetyBounds, ...bounds },
  });
}

export function getAutomationExceptions(
  filters?: ExceptionFilters
): AutomationException[] {
  let filtered = [...automationExceptions];

  if (filters?.status) {
    filtered = filtered.filter(exc => exc.status === filters.status);
  }

  if (filters?.severity) {
    filtered = filtered.filter(exc => exc.severity === filters.severity);
  }

  if (filters?.automationId) {
    filtered = filtered.filter(exc => exc.automationId === filters.automationId);
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(exc =>
      exc.reason.toLowerCase().includes(term) ||
      exc.automationName.toLowerCase().includes(term) ||
      exc.affectedClientName?.toLowerCase().includes(term)
    );
  }

  if (filters?.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter(exc => {
      const date = new Date(exc.occurredAt);
      return date >= start && date <= end;
    });
  }

  // Sort by severity (critical first), then by date
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return filtered.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });
}

export function getAutomationExceptionById(id: string): AutomationException | undefined {
  return automationExceptions.find(exc => exc.id === id);
}

export function updateAutomationException(
  id: string,
  updates: Partial<AutomationException>
): AutomationException | undefined {
  const index = automationExceptions.findIndex(exc => exc.id === id);
  if (index === -1) return undefined;

  automationExceptions[index] = { ...automationExceptions[index], ...updates };
  return automationExceptions[index];
}

export function resolveException(
  id: string,
  resolution: string
): AutomationException | undefined {
  return updateAutomationException(id, {
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: 'advisor@example.com',
    resolution,
  });
}

export function ignoreException(id: string): AutomationException | undefined {
  return updateAutomationException(id, { status: 'ignored' });
}

export function getAdaptationLogs(limit?: number): AdaptationLogEntry[] {
  const logs = [...adaptationLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return limit ? logs.slice(0, limit) : logs;
}

export function getAutomationActivity(
  automationId?: string,
  limit?: number
): AutomationActivityEntry[] {
  let activity = [...automationActivity];

  if (automationId) {
    activity = activity.filter(act => act.automationId === automationId);
  }

  activity.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return limit ? activity.slice(0, limit) : activity;
}

export function getAutomationStats(): AutomationStats {
  const suggestions = [...automationSuggestions];
  const active = [...activeAutomations];
  const exceptions = [...automationExceptions];
  const activity = [...automationActivity];

  // Calculate today's runs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayActivity = activity.filter(
    act => new Date(act.timestamp) >= today
  );
  const successfulToday = todayActivity.filter(act => act.status === 'success').length;

  // Calculate time saved this week
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekActivity = activity.filter(
    act => new Date(act.timestamp) >= weekAgo && act.status === 'success'
  );
  // Estimate 5 minutes saved per successful action
  const timeSavedThisWeek = weekActivity.length * 5;

  return {
    totalSuggestions: suggestions.length,
    pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
    totalActive: active.length,
    runningAutomations: active.filter(a => a.status === 'running').length,
    pausedAutomations: active.filter(a => a.status === 'paused').length,
    pendingExceptions: exceptions.filter(e => e.status === 'pending').length,
    totalRunsToday: todayActivity.length,
    successRateToday: todayActivity.length > 0
      ? Math.round((successfulToday / todayActivity.length) * 100)
      : 100,
    timeSavedThisWeek,
  };
}

// Get count of pending exceptions (for badge in navigation)
export function getPendingExceptionCount(): number {
  return automationExceptions.filter(exc => exc.status === 'pending').length;
}

// ============================================
// Analytics (Phase 7)
// ============================================

// In-memory storage for analytics
let kpiMetrics: KPIMetric[] = [...mockKPIs];
let chartConfigs: ChartConfig[] = [...mockCharts];
let dashboardInsights: DashboardInsight[] = [...mockInsights];
let focusRecommendations: FocusRecommendation[] = [...mockFocusRecommendations];

export function getKPIMetrics(): KPIMetric[] {
  return [...kpiMetrics];
}

export function getKPIMetricById(id: string): KPIMetric | undefined {
  return kpiMetrics.find(kpi => kpi.id === id);
}

export function getChartConfigs(): ChartConfig[] {
  return [...chartConfigs];
}

export function getChartConfigById(id: string): ChartConfig | undefined {
  return chartConfigs.find(chart => chart.id === id);
}

export function getDashboardInsights(): DashboardInsight[] {
  return [...dashboardInsights];
}

export function getFocusRecommendations(status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'): FocusRecommendation[] {
  let filtered = [...focusRecommendations];

  if (status) {
    filtered = filtered.filter(rec => rec.status === status);
  }

  // Sort by priority (critical > high > medium > low)
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function updateFocusRecommendation(
  id: string,
  updates: Partial<FocusRecommendation>
): FocusRecommendation | undefined {
  const index = focusRecommendations.findIndex(rec => rec.id === id);
  if (index === -1) return undefined;

  focusRecommendations[index] = { ...focusRecommendations[index], ...updates };
  return focusRecommendations[index];
}

export function getClientMetrics(): ClientMetrics {
  return { ...mockClientMetrics };
}

export function getRevenueMetrics(): RevenueMetrics {
  return { ...mockRevenueMetrics };
}

export function getPipelineMetrics(): PipelineMetrics {
  return { ...mockPipelineMetrics };
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...mockPerformanceMetrics };
}

// ============================================
// Activity Log (Phase 7)
// ============================================

// In-memory storage for activity
let activityEntries: ActivityEntry[] = [...mockActivityEntries];

export function getActivityEntries(filters?: ActivityFilters): ActivityEntry[] {
  let filtered = [...activityEntries];

  // Filter by categories
  if (filters?.categories && filters.categories.length > 0) {
    filtered = filtered.filter(entry => filters.categories?.includes(entry.category));
  }

  // Filter by actors
  if (filters?.actors && filters.actors.length > 0) {
    filtered = filtered.filter(entry => filters.actors?.includes(entry.actor));
  }

  // Filter by date range
  if (filters?.startDate || filters?.endDate) {
    filtered = filtered.filter(entry => {
      const entryDate = new Date(entry.timestamp);

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (entryDate < startDate) return false;
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (entryDate > endDate) return false;
      }

      return true;
    });
  }

  // Filter by search term
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(entry =>
      entry.title.toLowerCase().includes(term) ||
      entry.description.toLowerCase().includes(term) ||
      entry.actorName?.toLowerCase().includes(term) ||
      entry.clientName?.toLowerCase().includes(term)
    );
  }

  // Filter by important only
  if (filters?.isImportant) {
    filtered = filtered.filter(entry => entry.isImportant === true);
  }

  // Filter by errors only
  if (filters?.isError) {
    filtered = filtered.filter(entry => entry.isError === true);
  }

  // Sort by timestamp (newest first)
  return filtered.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getActivityById(id: string): ActivityEntry | undefined {
  return activityEntries.find(entry => entry.id === id);
}

export function getActivityStats(): ActivityStats {
  return { ...mockActivityStats };
}

export function getActivityGroupedByDate(filters?: ActivityFilters): ActivityGroup[] {
  const entries = getActivityEntries(filters);
  const groups: Record<string, ActivityEntry[]> = {};

  entries.forEach(entry => {
    const date = new Date(entry.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
  });

  return Object.entries(groups).map(([date, entriesList]) => {
    const parsedDate = new Date(date);
    return {
      date,
      dateLabel: parsedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      entries: entriesList,
    };
  });
}

export function getRecentActivity(limit: number = 10): ActivityEntry[] {
  return activityEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ============================================
// Settings (Phase 7)
// ============================================

// In-memory storage for settings
let userProfile: UserProfile = { ...mockUserProfile };
let securitySettings: SecuritySettings = { ...mockSecuritySettings };
let notificationSettings: NotificationSettings = { ...mockNotificationSettings };
let preferenceSettings: PreferenceSettings = { ...mockPreferenceSettings };
let productSettings: ProductSettings = { ...mockProductSettings };
let teamSettings: TeamSettings = { ...mockTeamSettings };
let billingSettings: BillingSettings = { ...mockBillingSettings };

export function getUserProfile(): UserProfile {
  return { ...userProfile };
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  userProfile = { ...userProfile, ...updates };
  return { ...userProfile };
}

export function getSecuritySettings(): SecuritySettings {
  return { ...securitySettings };
}

export function updateSecuritySettings(updates: Partial<SecuritySettings>): SecuritySettings {
  securitySettings = { ...securitySettings, ...updates };
  return { ...securitySettings };
}

export function getNotificationSettings(): NotificationSettings {
  return { ...notificationSettings };
}

export function updateNotificationSettings(updates: Partial<NotificationSettings>): NotificationSettings {
  notificationSettings = { ...notificationSettings, ...updates };
  return { ...notificationSettings };
}

export function getPreferenceSettings(): PreferenceSettings {
  return { ...preferenceSettings };
}

export function updatePreferenceSettings(updates: Partial<PreferenceSettings>): PreferenceSettings {
  preferenceSettings = { ...preferenceSettings, ...updates };
  return { ...preferenceSettings };
}

export function getProductSettings(): ProductSettings {
  return { ...productSettings };
}

export function updateProductSettings(updates: Partial<ProductSettings>): ProductSettings {
  productSettings = { ...productSettings, ...updates };
  return { ...productSettings };
}

export function getTeamSettings(): TeamSettings {
  return { ...teamSettings };
}

export function updateTeamSettings(updates: Partial<TeamSettings>): TeamSettings {
  teamSettings = { ...teamSettings, ...updates };
  return { ...teamSettings };
}

export function getBillingSettings(): BillingSettings {
  return { ...billingSettings };
}

export function updateBillingSettings(updates: Partial<BillingSettings>): BillingSettings {
  billingSettings = { ...billingSettings, ...updates };
  return { ...billingSettings };
}
