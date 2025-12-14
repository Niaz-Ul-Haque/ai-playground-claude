import type {
  Task,
  TaskFilters,
  TaskStats,
  SuggestedAction,
  Workflow,
  ProcessRecommendation,
  PrefilledMaterial,
  CycleTimeStats
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
import { MOCK_TASKS } from './tasks';
import { MOCK_CLIENTS } from './clients';
import { MOCK_RELATIONSHIPS } from './relationships';
import { MOCK_TIMELINE } from './timeline';
import { MOCK_ARTIFACTS } from './artifacts';
import { MOCK_ASSETS } from './assets';
import { MOCK_SUGGESTED_ACTIONS } from './suggested-actions';
import { MOCK_WORKFLOWS } from './workflows';
import { MOCK_MATERIALS } from './materials';
import { MOCK_RECOMMENDATIONS } from './recommendations';

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
