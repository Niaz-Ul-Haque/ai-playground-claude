// Undo Manager - Phase 2: Mock Data Layer Enhancement
// Provides undo capability for mutations

import type { Task, Workflow } from '@/types/task';
import type { Client } from '@/types/client';
import type { Opportunity } from '@/types/opportunity';
import type { ActiveAutomation } from '@/types/automation';
import type { EntityType } from '@/types/tools';
import * as mockData from '@/lib/mock-data';

// ============================================
// Types
// ============================================

export interface UndoEntry {
  id: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  previousState: unknown;
  timestamp: string;
  description: string;
}

export interface UndoResult {
  success: boolean;
  message: string;
  restoredEntity?: unknown;
}

export type EntityState = Task | Client | Opportunity | Workflow | ActiveAutomation | null;

// ============================================
// Undo Manager Class
// ============================================

class UndoManager {
  private stack: UndoEntry[] = [];
  private readonly maxEntries: number = 10;

  /**
   * Record an operation for potential undo
   */
  recordOperation(
    action: string,
    entityType: EntityType,
    entityId: string,
    previousState: unknown,
    description?: string
  ): string {
    const entry: UndoEntry = {
      id: `undo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      previousState,
      timestamp: new Date().toISOString(),
      description: description || `${action} on ${entityType}`,
    };

    this.stack.unshift(entry);

    // Keep stack limited to maxEntries
    while (this.stack.length > this.maxEntries) {
      this.stack.pop();
    }

    return entry.id;
  }

  /**
   * Check if there's anything to undo
   */
  canUndo(): boolean {
    return this.stack.length > 0;
  }

  /**
   * Get description of what will be undone
   */
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.stack[0].description;
  }

  /**
   * Get the last entry without removing it
   */
  peekLast(): UndoEntry | null {
    return this.stack[0] || null;
  }

  /**
   * Get all entries (for debugging/display)
   */
  getEntries(): UndoEntry[] {
    return [...this.stack];
  }

  /**
   * Undo the last operation
   */
  undoLast(): UndoResult {
    if (!this.canUndo()) {
      return {
        success: false,
        message: 'Nothing to undo',
      };
    }

    const entry = this.stack.shift()!;

    try {
      const restored = this.restoreEntity(entry);
      return {
        success: true,
        message: `Successfully undid: ${entry.description}`,
        restoredEntity: restored,
      };
    } catch (error) {
      // Put the entry back if undo failed
      this.stack.unshift(entry);
      return {
        success: false,
        message: `Failed to undo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Undo a specific entry by ID
   */
  undoById(entryId: string): UndoResult {
    const index = this.stack.findIndex(e => e.id === entryId);
    if (index === -1) {
      return {
        success: false,
        message: 'Undo entry not found',
      };
    }

    const entry = this.stack[index];

    try {
      const restored = this.restoreEntity(entry);
      // Remove this entry and all entries after it (they depend on this one)
      this.stack.splice(index, 1);
      return {
        success: true,
        message: `Successfully undid: ${entry.description}`,
        restoredEntity: restored,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to undo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Clear all undo entries
   */
  clear(): void {
    this.stack = [];
  }

  /**
   * Restore an entity based on the undo entry
   */
  private restoreEntity(entry: UndoEntry): EntityState {
    const { entityType, entityId, previousState, action } = entry;

    switch (entityType) {
      case 'task':
        return this.restoreTask(entityId, previousState as Partial<Task>, action);

      case 'client':
        return this.restoreClient(entityId, previousState as Partial<Client>, action);

      case 'opportunity':
        return this.restoreOpportunity(entityId, previousState as Partial<Opportunity>, action);

      case 'workflow':
        return this.restoreWorkflow(entityId, previousState as Partial<Workflow>, action);

      case 'automation':
        return this.restoreAutomation(entityId, previousState as Partial<ActiveAutomation>, action);

      default:
        throw new Error(`Unsupported entity type for undo: ${entityType}`);
    }
  }

  /**
   * Restore a task
   */
  private restoreTask(id: string, state: Partial<Task>, action: string): Task | null {
    switch (action) {
      case 'create_task':
        // Undo create = delete
        mockData.deleteTask(id);
        return null;

      case 'delete_task':
        // Undo delete = restore
        return mockData.restoreTask(id);

      case 'update_task':
      case 'complete_task':
      case 'approve_task':
      case 'reject_task':
        // Undo update = restore previous state
        return mockData.updateTask(id, state) ?? null;

      default:
        // Generic update restoration
        return mockData.updateTask(id, state) ?? null;
    }
  }

  /**
   * Restore a client
   */
  private restoreClient(id: string, state: Partial<Client>, action: string): Client | null {
    switch (action) {
      case 'create_client':
        mockData.archiveClient(id);
        return null;

      case 'archive_client':
        return mockData.restoreClient(id);

      case 'update_client':
        return mockData.updateClient(id, state);

      default:
        return mockData.updateClient(id, state);
    }
  }

  /**
   * Restore an opportunity
   */
  private restoreOpportunity(id: string, state: Partial<Opportunity>, action: string): Opportunity | null {
    switch (action) {
      case 'create_opportunity':
        mockData.archiveOpportunity(id);
        return null;

      case 'archive_opportunity':
      case 'dismiss_opportunity':
        return mockData.restoreOpportunity(id);

      case 'update_opportunity':
      case 'snooze_opportunity':
        return mockData.updateOpportunity(id, state) ?? null;

      default:
        return mockData.updateOpportunity(id, state) ?? null;
    }
  }

  /**
   * Restore a workflow
   */
  private restoreWorkflow(id: string, state: Partial<Workflow>, action: string): Workflow | null {
    switch (action) {
      case 'start_workflow':
        mockData.cancelWorkflow(id);
        return null;

      case 'pause_workflow':
        mockData.resumeWorkflow(id);
        return mockData.getWorkflowById(id) ?? null;

      case 'resume_workflow':
        mockData.pauseWorkflow(id);
        return mockData.getWorkflowById(id) ?? null;

      case 'cancel_workflow':
        // Restore previous status
        return mockData.updateWorkflow(id, state);

      default:
        return mockData.updateWorkflow(id, state);
    }
  }

  /**
   * Restore an automation
   */
  private restoreAutomation(id: string, state: Partial<ActiveAutomation>, action: string): ActiveAutomation | null {
    switch (action) {
      case 'pause_automation':
        mockData.resumeAutomation(id);
        return mockData.getActiveAutomationById(id) ?? null;

      case 'resume_automation':
        mockData.pauseAutomation(id);
        return mockData.getActiveAutomationById(id) ?? null;

      default:
        return mockData.updateActiveAutomation(id, state) ?? null;
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

const undoManager = new UndoManager();

// ============================================
// Exported Functions (backwards-compatible with Phase 1)
// ============================================

/**
 * Record an operation for undo
 */
export function recordUndo(
  action: string,
  entityType: EntityType,
  entityId: string,
  previousState: unknown,
  description?: string
): string {
  return undoManager.recordOperation(action, entityType, entityId, previousState, description);
}

/**
 * Check if undo is available
 */
export function canUndo(): boolean {
  return undoManager.canUndo();
}

/**
 * Get description of what will be undone
 */
export function getUndoDescription(): string | null {
  return undoManager.getUndoDescription();
}

/**
 * Undo the last operation
 */
export function undoLast(): UndoResult {
  return undoManager.undoLast();
}

/**
 * Undo a specific operation by ID
 */
export function undoById(entryId: string): UndoResult {
  return undoManager.undoById(entryId);
}

/**
 * Get all undo entries
 */
export function getUndoEntries(): UndoEntry[] {
  return undoManager.getEntries();
}

/**
 * Clear all undo history
 */
export function clearUndoHistory(): void {
  undoManager.clear();
}

/**
 * Get the UndoManager instance (for advanced use)
 */
export function getUndoManager(): UndoManager {
  return undoManager;
}

export default undoManager;
