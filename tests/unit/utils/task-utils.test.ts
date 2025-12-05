import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStatusConfig,
  isValidTransition,
  getTasksForToday,
  getPendingReviewTasks,
  getTasksForClient,
  getPriorityColor,
  isOverdue,
} from '@/lib/utils/task-utils';
import type { Task, TaskStatus } from '@/types/task';
import { createMockTask } from '../../test-utils';

describe('task-utils', () => {
  describe('getStatusConfig', () => {
    it('should return config for pending status', () => {
      const config = getStatusConfig('pending');
      expect(config).toEqual({
        label: 'Pending',
        variant: 'outline',
        iconColor: 'text-gray-500',
      });
    });

    it('should return config for in-progress status', () => {
      const config = getStatusConfig('in-progress');
      expect(config).toEqual({
        label: 'In Progress',
        variant: 'default',
        iconColor: 'text-blue-500',
      });
    });

    it('should return config for completed status', () => {
      const config = getStatusConfig('completed');
      expect(config).toEqual({
        label: 'Completed',
        variant: 'secondary',
        iconColor: 'text-green-500',
      });
    });

    it('should return config for needs-review status', () => {
      const config = getStatusConfig('needs-review');
      expect(config).toEqual({
        label: 'Needs Review',
        variant: 'destructive',
        iconColor: 'text-yellow-500',
      });
    });
  });

  describe('isValidTransition', () => {
    it('should allow pending to in-progress', () => {
      expect(isValidTransition('pending', 'in-progress')).toBe(true);
    });

    it('should allow pending to completed', () => {
      expect(isValidTransition('pending', 'completed')).toBe(true);
    });

    it('should allow in-progress to completed', () => {
      expect(isValidTransition('in-progress', 'completed')).toBe(true);
    });

    it('should allow in-progress to pending', () => {
      expect(isValidTransition('in-progress', 'pending')).toBe(true);
    });

    it('should allow needs-review to completed', () => {
      expect(isValidTransition('needs-review', 'completed')).toBe(true);
    });

    it('should allow needs-review to pending', () => {
      expect(isValidTransition('needs-review', 'pending')).toBe(true);
    });

    it('should not allow completed to any status', () => {
      expect(isValidTransition('completed', 'pending')).toBe(false);
      expect(isValidTransition('completed', 'in-progress')).toBe(false);
      expect(isValidTransition('completed', 'needs-review')).toBe(false);
    });

    it('should not allow invalid transitions', () => {
      expect(isValidTransition('pending', 'needs-review')).toBe(false);
      expect(isValidTransition('in-progress', 'needs-review')).toBe(false);
    });
  });

  describe('getTasksForToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
    });

    it('should return tasks due today', () => {
      const tasks: Task[] = [
        createMockTask({
          id: '1',
          dueDate: '2025-12-04T10:00:00.000Z',
          status: 'pending',
        }),
        createMockTask({
          id: '2',
          dueDate: '2025-12-04T16:00:00.000Z',
          status: 'pending',
        }),
        createMockTask({
          id: '3',
          dueDate: '2025-12-05T10:00:00.000Z',
          status: 'pending',
        }),
      ];

      const result = getTasksForToday(tasks);
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '2']);
    });

    it('should exclude completed tasks', () => {
      const tasks: Task[] = [
        createMockTask({
          id: '1',
          dueDate: '2025-12-04T10:00:00.000Z',
          status: 'pending',
        }),
        createMockTask({
          id: '2',
          dueDate: '2025-12-04T16:00:00.000Z',
          status: 'completed',
        }),
      ];

      const result = getTasksForToday(tasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array when no tasks for today', () => {
      const tasks: Task[] = [
        createMockTask({
          dueDate: '2025-12-03T10:00:00.000Z',
          status: 'pending',
        }),
        createMockTask({
          dueDate: '2025-12-05T10:00:00.000Z',
          status: 'pending',
        }),
      ];

      const result = getTasksForToday(tasks);
      expect(result).toHaveLength(0);
    });

    it('should handle tasks at midnight boundaries', () => {
      const tasks: Task[] = [
        createMockTask({
          id: '1',
          dueDate: '2025-12-04T00:00:00.000Z',
          status: 'pending',
        }),
        createMockTask({
          id: '2',
          dueDate: '2025-12-04T23:59:59.000Z',
          status: 'pending',
        }),
      ];

      const result = getTasksForToday(tasks);
      expect(result).toHaveLength(2);
    });
  });

  describe('getPendingReviewTasks', () => {
    it('should return only tasks with needs-review status', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', status: 'needs-review' }),
        createMockTask({ id: '2', status: 'pending' }),
        createMockTask({ id: '3', status: 'needs-review' }),
        createMockTask({ id: '4', status: 'completed' }),
      ];

      const result = getPendingReviewTasks(tasks);
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '3']);
    });

    it('should return empty array when no review tasks', () => {
      const tasks: Task[] = [
        createMockTask({ status: 'pending' }),
        createMockTask({ status: 'completed' }),
      ];

      const result = getPendingReviewTasks(tasks);
      expect(result).toHaveLength(0);
    });
  });

  describe('getTasksForClient', () => {
    it('should return tasks for specific client', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', clientId: 'client-1' }),
        createMockTask({ id: '2', clientId: 'client-2' }),
        createMockTask({ id: '3', clientId: 'client-1' }),
        createMockTask({ id: '4' }), // No client
      ];

      const result = getTasksForClient(tasks, 'client-1');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '3']);
    });

    it('should return empty array when client has no tasks', () => {
      const tasks: Task[] = [
        createMockTask({ clientId: 'client-1' }),
        createMockTask({ clientId: 'client-2' }),
      ];

      const result = getTasksForClient(tasks, 'client-3');
      expect(result).toHaveLength(0);
    });
  });

  describe('getPriorityColor', () => {
    it('should return correct color for low priority', () => {
      expect(getPriorityColor('low')).toBe('text-gray-500');
    });

    it('should return correct color for medium priority', () => {
      expect(getPriorityColor('medium')).toBe('text-yellow-500');
    });

    it('should return correct color for high priority', () => {
      expect(getPriorityColor('high')).toBe('text-red-500');
    });
  });

  describe('isOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
    });

    it('should return true for past due date', () => {
      const task = createMockTask({
        dueDate: '2025-12-03T10:00:00.000Z',
        status: 'pending',
      });

      expect(isOverdue(task)).toBe(true);
    });

    it('should return false for future due date', () => {
      const task = createMockTask({
        dueDate: '2025-12-05T10:00:00.000Z',
        status: 'pending',
      });

      expect(isOverdue(task)).toBe(false);
    });

    it('should return false for completed tasks even if past due', () => {
      const task = createMockTask({
        dueDate: '2025-12-03T10:00:00.000Z',
        status: 'completed',
      });

      expect(isOverdue(task)).toBe(false);
    });

    it('should return false for today but future time', () => {
      const task = createMockTask({
        dueDate: '2025-12-04T14:00:00.000Z',
        status: 'pending',
      });

      expect(isOverdue(task)).toBe(false);
    });

    it('should return true for today but past time', () => {
      const task = createMockTask({
        dueDate: '2025-12-04T10:00:00.000Z',
        status: 'pending',
      });

      expect(isOverdue(task)).toBe(true);
    });
  });
});
