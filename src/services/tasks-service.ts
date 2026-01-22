/**
 * Tasks Service - Handles task API interactions
 */

import { apiGet, apiPost, apiPatch, buildQueryString } from '@/lib/api-client';
import type { Task, TaskSummary, TaskFilters, TaskUpdate } from '@/types/task';

/**
 * List all tasks with optional filters
 */
export async function listTasks(filters?: TaskFilters): Promise<TaskSummary[]> {
  const query = filters ? buildQueryString({
    status: filters.status,
    client_id: filters.client_id,
    priority: filters.priority,
    ai_completed: filters.ai_completed,
    due_date: filters.due_date,
  }) : '';

  const response = await apiGet<{ tasks: TaskSummary[] }>(`/api/tasks${query}`);
  return response.data?.tasks || [];
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Task | null> {
  const response = await apiGet<{ task: Task }>(`/api/tasks/${taskId}`);
  return response.data?.task || null;
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
  const response = await apiPatch<{ task: Task }>(`/api/tasks/${taskId}`, updates);
  return response.data?.task || null;
}

/**
 * Approve an AI-completed task
 */
export async function approveTask(taskId: string, feedback?: string): Promise<boolean> {
  const response = await apiPost(`/api/tasks/${taskId}/approve`, { feedback });
  return response.success;
}

/**
 * Reject an AI-completed task
 */
export async function rejectTask(taskId: string, reason?: string): Promise<boolean> {
  const response = await apiPost(`/api/tasks/${taskId}/reject`, { reason });
  return response.success;
}

/**
 * Mark a task as completed
 */
export async function completeTask(taskId: string, notes?: string): Promise<boolean> {
  const response = await apiPost(`/api/tasks/${taskId}/complete`, { notes });
  return response.success;
}

/**
 * Get today's tasks
 */
export async function getTodaysTasks(): Promise<TaskSummary[]> {
  return listTasks({ due_date: 'today' });
}

/**
 * Get tasks needing review
 */
export async function getPendingReviewTasks(): Promise<TaskSummary[]> {
  return listTasks({ status: 'needs-review', ai_completed: true });
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(): Promise<TaskSummary[]> {
  return listTasks({ due_date: 'overdue' });
}

/**
 * Get tasks for a specific client
 */
export async function getTasksForClient(clientId: string): Promise<TaskSummary[]> {
  return listTasks({ client_id: clientId });
}
