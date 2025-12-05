import type { Task, TaskFilters } from '@/types/task';
import type { Client } from '@/types/client';
import { MOCK_TASKS } from './tasks';
import { MOCK_CLIENTS } from './clients';

// In-memory storage
let tasks: Task[] = [...MOCK_TASKS];
let clients: Client[] = [...MOCK_CLIENTS];

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

// Reset function for testing
export function resetMockData(): void {
  tasks = [...MOCK_TASKS];
  clients = [...MOCK_CLIENTS];
}
