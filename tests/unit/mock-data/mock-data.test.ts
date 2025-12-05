import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTasks,
  getTaskById,
  updateTask,
  getClients,
  getClientById,
  getClientByName,
  resetMockData,
} from '@/lib/mock-data';
import type { TaskFilters } from '@/types/task';

describe('mock-data', () => {
  beforeEach(() => {
    // Reset mock data before each test
    resetMockData();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
  });

  describe('getTasks', () => {
    it('should return all tasks when no filters', () => {
      const tasks = getTasks();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should filter by status', () => {
      const filters: TaskFilters = { status: 'needs-review' };
      const tasks = getTasks(filters);

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.status).toBe('needs-review');
      });
    });

    it('should filter by clientId', () => {
      const filters: TaskFilters = { clientId: '1' };
      const tasks = getTasks(filters);

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.clientId).toBe('1');
      });
    });

    it('should filter by aiCompleted', () => {
      const filters: TaskFilters = { aiCompleted: true };
      const tasks = getTasks(filters);

      expect(tasks.length).toBeGreaterThan(0);
      tasks.forEach(task => {
        expect(task.aiCompleted).toBe(true);
      });
    });

    it('should filter tasks for today', () => {
      const filters: TaskFilters = { dueDate: 'today' };
      const tasks = getTasks(filters);

      tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date('2025-12-04');
        expect(dueDate.toDateString()).toBe(today.toDateString());
      });
    });

    it('should filter tasks for this week', () => {
      const filters: TaskFilters = { dueDate: 'week' };
      const tasks = getTasks(filters);

      const today = new Date('2025-12-04T00:00:00.000Z');
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
        expect(dueDate.getTime()).toBeLessThanOrEqual(weekFromNow.getTime());
      });
    });

    it('should filter overdue tasks', () => {
      const filters: TaskFilters = { dueDate: 'overdue' };
      const tasks = getTasks(filters);

      const today = new Date('2025-12-04T00:00:00.000Z');

      tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        expect(dueDate.getTime()).toBeLessThan(today.getTime());
        expect(task.status).not.toBe('completed');
      });
    });

    it('should combine multiple filters', () => {
      const filters: TaskFilters = {
        status: 'needs-review',
        aiCompleted: true,
      };
      const tasks = getTasks(filters);

      tasks.forEach(task => {
        expect(task.status).toBe('needs-review');
        expect(task.aiCompleted).toBe(true);
      });
    });

    it('should sort by due date (earliest first)', () => {
      const tasks = getTasks();

      for (let i = 1; i < tasks.length; i++) {
        const prevDate = new Date(tasks[i - 1].dueDate);
        const currDate = new Date(tasks[i].dueDate);
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
      }
    });

    it('should sort by priority when due dates are equal', () => {
      const filters: TaskFilters = { dueDate: 'today' };
      const todayTasks = getTasks(filters);

      if (todayTasks.length > 1) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        for (let i = 1; i < todayTasks.length; i++) {
          const prevTask = todayTasks[i - 1];
          const currTask = todayTasks[i];
          const prevDate = new Date(prevTask.dueDate);
          const currDate = new Date(currTask.dueDate);

          if (prevDate.getTime() === currDate.getTime()) {
            expect(priorityOrder[prevTask.priority]).toBeLessThanOrEqual(
              priorityOrder[currTask.priority]
            );
          }
        }
      }
    });

    it('should return empty array when no matches', () => {
      const filters: TaskFilters = { clientId: 'non-existent' };
      const tasks = getTasks(filters);

      expect(tasks).toHaveLength(0);
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', () => {
      const task = getTaskById('1');

      expect(task).toBeDefined();
      expect(task?.id).toBe('1');
    });

    it('should return undefined when not found', () => {
      const task = getTaskById('non-existent');

      expect(task).toBeUndefined();
    });

    it('should return task with all properties', () => {
      const task = getTaskById('1');

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('dueDate');
      expect(task).toHaveProperty('priority');
    });
  });

  describe('updateTask', () => {
    it('should update task status', () => {
      const updated = updateTask('1', { status: 'completed' });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('completed');
    });

    it('should update multiple properties', () => {
      const updates = {
        status: 'in-progress' as const,
        priority: 'high' as const,
      };
      const updated = updateTask('1', updates);

      expect(updated?.status).toBe('in-progress');
      expect(updated?.priority).toBe('high');
    });

    it('should update updatedAt timestamp', () => {
      const originalTask = getTaskById('1');
      const originalUpdatedAt = originalTask?.updatedAt;

      // Wait a bit
      vi.advanceTimersByTime(1000);

      const updated = updateTask('1', { status: 'completed' });

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should preserve unchanged properties', () => {
      const originalTask = getTaskById('1');
      const updated = updateTask('1', { status: 'completed' });

      expect(updated?.title).toBe(originalTask?.title);
      expect(updated?.description).toBe(originalTask?.description);
      expect(updated?.clientId).toBe(originalTask?.clientId);
    });

    it('should return undefined when task not found', () => {
      const updated = updateTask('non-existent', { status: 'completed' });

      expect(updated).toBeUndefined();
    });

    it('should persist update in subsequent calls', () => {
      updateTask('1', { status: 'completed' });
      const task = getTaskById('1');

      expect(task?.status).toBe('completed');
    });
  });

  describe('getClients', () => {
    it('should return all clients when no filters', () => {
      const clients = getClients();
      expect(clients.length).toBeGreaterThan(0);
    });

    it('should filter by name (case-insensitive)', () => {
      const clients = getClients({ name: 'johnson' });

      expect(clients.length).toBeGreaterThan(0);
      clients.forEach(client => {
        expect(client.name.toLowerCase()).toContain('johnson');
      });
    });

    it('should filter by partial name match', () => {
      const clients = getClients({ name: 'chen' });

      expect(clients.length).toBeGreaterThan(0);
      clients.forEach(client => {
        expect(client.name.toLowerCase()).toContain('chen');
      });
    });

    it('should filter by risk profile', () => {
      const clients = getClients({ riskProfile: 'moderate' });

      expect(clients.length).toBeGreaterThan(0);
      clients.forEach(client => {
        expect(client.riskProfile).toBe('moderate');
      });
    });

    it('should combine name and risk profile filters', () => {
      const clients = getClients({
        name: 'thompson',
        riskProfile: 'conservative',
      });

      clients.forEach(client => {
        expect(client.name.toLowerCase()).toContain('thompson');
        expect(client.riskProfile).toBe('conservative');
      });
    });

    it('should sort results alphabetically by name', () => {
      const clients = getClients();

      for (let i = 1; i < clients.length; i++) {
        expect(clients[i - 1].name.localeCompare(clients[i].name)).toBeLessThanOrEqual(0);
      }
    });

    it('should return empty array when no matches', () => {
      const clients = getClients({ name: 'nonexistent' });

      expect(clients).toHaveLength(0);
    });
  });

  describe('getClientById', () => {
    it('should return client when found', () => {
      const client = getClientById('1');

      expect(client).toBeDefined();
      expect(client?.id).toBe('1');
    });

    it('should return undefined when not found', () => {
      const client = getClientById('non-existent');

      expect(client).toBeUndefined();
    });

    it('should return client with all properties', () => {
      const client = getClientById('1');

      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name');
      expect(client).toHaveProperty('email');
      expect(client).toHaveProperty('riskProfile');
      expect(client).toHaveProperty('portfolioValue');
    });
  });

  describe('getClientByName', () => {
    it('should find client by exact name', () => {
      const client = getClientByName('Michael Johnson');

      expect(client).toBeDefined();
      expect(client?.name).toBe('Michael Johnson');
    });

    it('should find client by partial name (case-insensitive)', () => {
      const client = getClientByName('johnson');

      expect(client).toBeDefined();
      expect(client?.name.toLowerCase()).toContain('johnson');
    });

    it('should find client by first name only', () => {
      const client = getClientByName('Sarah');

      expect(client).toBeDefined();
      expect(client?.name).toContain('Sarah');
    });

    it('should find client by last name only', () => {
      const client = getClientByName('Chen');

      expect(client).toBeDefined();
      expect(client?.name).toContain('Chen');
    });

    it('should be case-insensitive', () => {
      const client = getClientByName('SARAH CHEN');

      expect(client).toBeDefined();
      expect(client?.name).toBe('Sarah Chen');
    });

    it('should return undefined when not found', () => {
      const client = getClientByName('Nonexistent Person');

      expect(client).toBeUndefined();
    });

    it('should return first match when multiple clients match', () => {
      // This tests the fuzzy matching behavior
      const client = getClientByName('a');

      expect(client).toBeDefined();
      expect(client?.name).toContain('a');
    });
  });

  describe('resetMockData', () => {
    it('should reset tasks to original state', () => {
      // Modify a task
      updateTask('1', { status: 'completed' });
      expect(getTaskById('1')?.status).toBe('completed');

      // Reset
      resetMockData();
      const task = getTaskById('1');

      expect(task?.status).not.toBe('completed');
    });

    it('should restore all original tasks', () => {
      const originalCount = getTasks().length;

      // Make some changes
      updateTask('1', { status: 'completed' });

      // Reset
      resetMockData();
      const tasks = getTasks();

      expect(tasks.length).toBe(originalCount);
    });

    it('should restore all original clients', () => {
      const originalCount = getClients().length;

      // Reset
      resetMockData();
      const clients = getClients();

      expect(clients.length).toBe(originalCount);
    });
  });
});
