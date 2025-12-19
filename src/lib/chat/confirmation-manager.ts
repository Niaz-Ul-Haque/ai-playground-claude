// Confirmation Manager - Phase 5: Safety Patterns
// Centralized management of confirmation flows for destructive actions

import type { ExecutionPlan, PendingAction } from '@/types/execution-plan';
import type { EntityType } from '@/types/tools';

// ============================================
// Types
// ============================================

export type ActionSeverity = 'info' | 'warning' | 'danger';

export interface ConfirmationConfig {
  /** Action type (tool name) */
  action: string;
  /** Severity level */
  severity: ActionSeverity;
  /** Default timeout in milliseconds */
  timeout: number;
  /** Whether this action can be undone */
  undoable: boolean;
  /** Cooldown before allowing the same action again (ms) */
  cooldown: number;
  /** Custom confirmation message template */
  messageTemplate?: string;
  /** Custom consequence description */
  consequenceTemplate?: string;
}

export interface PendingConfirmation {
  /** Unique ID */
  id: string;
  /** The pending action */
  action: PendingAction;
  /** Severity level */
  severity: ActionSeverity;
  /** When this confirmation was created */
  createdAt: string;
  /** When this confirmation expires */
  expiresAt: string;
  /** Number of times user has been prompted */
  promptCount: number;
  /** Confirmation message */
  message: string;
  /** Consequence warning */
  consequence: string;
  /** Affected entity info */
  affectedEntity?: {
    type: EntityType;
    id: string;
    name: string;
  };
  /** Whether this has been resolved */
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  /** Resolution timestamp */
  resolvedAt?: string;
}

export interface ConfirmationResult {
  success: boolean;
  message: string;
  confirmation?: PendingConfirmation;
  shouldExecute?: boolean;
}

// ============================================
// Confirmation Configurations
// ============================================

const CONFIRMATION_CONFIGS: Record<string, ConfirmationConfig> = {
  // Delete/Archive actions - DANGER
  delete_task: {
    action: 'delete_task',
    severity: 'danger',
    timeout: 300000, // 5 minutes
    undoable: true,
    cooldown: 5000, // 5 seconds
    messageTemplate: 'Are you sure you want to delete the task "{name}"?',
    consequenceTemplate: 'This task will be moved to the archive. You can undo this action.',
  },
  archive_client: {
    action: 'archive_client',
    severity: 'danger',
    timeout: 300000,
    undoable: true,
    cooldown: 10000, // 10 seconds
    messageTemplate: 'Are you sure you want to archive client "{name}"?',
    consequenceTemplate: 'This client will be marked as inactive and hidden from your active client list. All associated tasks will remain.',
  },
  archive_opportunity: {
    action: 'archive_opportunity',
    severity: 'danger',
    timeout: 300000,
    undoable: true,
    cooldown: 5000,
    messageTemplate: 'Are you sure you want to archive the opportunity "{name}"?',
    consequenceTemplate: 'This opportunity will be removed from your pipeline. You can restore it later if needed.',
  },

  // Update actions that need confirmation - WARNING
  dismiss_opportunity: {
    action: 'dismiss_opportunity',
    severity: 'warning',
    timeout: 180000, // 3 minutes
    undoable: true,
    cooldown: 3000,
    messageTemplate: 'Are you sure you want to dismiss the opportunity "{name}"?',
    consequenceTemplate: 'This opportunity will be marked as dismissed and won\'t appear in your active pipeline.',
  },
  cancel_workflow: {
    action: 'cancel_workflow',
    severity: 'warning',
    timeout: 180000,
    undoable: false,
    cooldown: 5000,
    messageTemplate: 'Are you sure you want to cancel the workflow "{name}"?',
    consequenceTemplate: 'All progress on this workflow will be lost. This action cannot be undone.',
  },

  // Bulk actions - WARNING
  bulk_delete_tasks: {
    action: 'bulk_delete_tasks',
    severity: 'danger',
    timeout: 300000,
    undoable: false,
    cooldown: 30000, // 30 seconds
    messageTemplate: 'Are you sure you want to delete {count} tasks?',
    consequenceTemplate: 'These tasks will be permanently removed. This action cannot be undone.',
  },
  bulk_archive_clients: {
    action: 'bulk_archive_clients',
    severity: 'danger',
    timeout: 300000,
    undoable: false,
    cooldown: 30000,
    messageTemplate: 'Are you sure you want to archive {count} clients?',
    consequenceTemplate: 'These clients will be marked as inactive. This is a significant action.',
  },
};

// ============================================
// Confirmation Manager Class
// ============================================

class ConfirmationManager {
  private pendingConfirmations = new Map<string, PendingConfirmation>();
  private actionCooldowns = new Map<string, number>(); // action key -> timestamp
  private subscribers: Array<(confirmations: PendingConfirmation[]) => void> = [];
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start cleanup interval
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60000);
    }
  }

  // ============================================
  // Subscription Management
  // ============================================

  subscribe(callback: (confirmations: PendingConfirmation[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    const confirmations = Array.from(this.pendingConfirmations.values());
    this.subscribers.forEach(cb => cb(confirmations));
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Check if an action requires confirmation
   */
  requiresConfirmation(action: string): boolean {
    return action in CONFIRMATION_CONFIGS;
  }

  /**
   * Get configuration for an action
   */
  getConfig(action: string): ConfirmationConfig | null {
    return CONFIRMATION_CONFIGS[action] || null;
  }

  /**
   * Check if action is on cooldown
   */
  isOnCooldown(action: string, entityId?: string): boolean {
    const key = entityId ? `${action}:${entityId}` : action;
    const cooldownUntil = this.actionCooldowns.get(key);

    if (!cooldownUntil) return false;

    if (Date.now() >= cooldownUntil) {
      this.actionCooldowns.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get remaining cooldown time in milliseconds
   */
  getCooldownRemaining(action: string, entityId?: string): number {
    const key = entityId ? `${action}:${entityId}` : action;
    const cooldownUntil = this.actionCooldowns.get(key);

    if (!cooldownUntil) return 0;

    const remaining = cooldownUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Set cooldown for an action
   */
  private setCooldown(action: string, entityId?: string): void {
    const config = this.getConfig(action);
    if (!config || config.cooldown <= 0) return;

    const key = entityId ? `${action}:${entityId}` : action;
    this.actionCooldowns.set(key, Date.now() + config.cooldown);
  }

  /**
   * Create a pending confirmation
   */
  createConfirmation(
    plan: ExecutionPlan,
    entityName?: string,
    entityId?: string
  ): ConfirmationResult {
    const config = this.getConfig(plan.tool);

    if (!config) {
      return {
        success: true,
        message: 'No confirmation required',
        shouldExecute: true,
      };
    }

    // Check cooldown
    if (this.isOnCooldown(plan.tool, entityId)) {
      const remaining = this.getCooldownRemaining(plan.tool, entityId);
      return {
        success: false,
        message: `Please wait ${Math.ceil(remaining / 1000)} seconds before trying this action again.`,
        shouldExecute: false,
      };
    }

    // Generate confirmation ID
    const confirmationId = `confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.timeout);

    // Build message
    const message = this.buildMessage(config.messageTemplate, {
      name: entityName || 'this item',
      count: plan.arguments.count as number || 1,
    });

    const consequence = this.buildMessage(config.consequenceTemplate, {
      name: entityName || 'this item',
    });

    // Create pending action
    const pendingAction: PendingAction = {
      id: confirmationId,
      plan,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      message,
    };

    // Create confirmation
    const confirmation: PendingConfirmation = {
      id: confirmationId,
      action: pendingAction,
      severity: config.severity,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      promptCount: 1,
      message,
      consequence,
      status: 'pending',
    };

    // Add entity info if available
    if (entityId && entityName && plan.entity) {
      confirmation.affectedEntity = {
        type: plan.entity,
        id: entityId,
        name: entityName,
      };
    }

    // Store confirmation
    this.pendingConfirmations.set(confirmationId, confirmation);
    this.notifySubscribers();

    return {
      success: true,
      message: 'Confirmation required',
      confirmation,
      shouldExecute: false,
    };
  }

  /**
   * Confirm a pending action
   */
  confirm(confirmationId: string): ConfirmationResult {
    const confirmation = this.pendingConfirmations.get(confirmationId);

    if (!confirmation) {
      return {
        success: false,
        message: 'Confirmation not found. It may have expired.',
        shouldExecute: false,
      };
    }

    // Check if expired
    if (new Date(confirmation.expiresAt) < new Date()) {
      confirmation.status = 'expired';
      confirmation.resolvedAt = new Date().toISOString();
      this.pendingConfirmations.delete(confirmationId);
      this.notifySubscribers();

      return {
        success: false,
        message: 'This confirmation has expired. Please try again.',
        shouldExecute: false,
      };
    }

    // Mark as confirmed
    confirmation.status = 'confirmed';
    confirmation.resolvedAt = new Date().toISOString();

    // Set cooldown
    this.setCooldown(
      confirmation.action.plan.tool,
      confirmation.affectedEntity?.id
    );

    // Remove from pending
    this.pendingConfirmations.delete(confirmationId);
    this.notifySubscribers();

    return {
      success: true,
      message: 'Action confirmed',
      confirmation,
      shouldExecute: true,
    };
  }

  /**
   * Cancel a pending confirmation
   */
  cancel(confirmationId: string): ConfirmationResult {
    const confirmation = this.pendingConfirmations.get(confirmationId);

    if (!confirmation) {
      return {
        success: false,
        message: 'Confirmation not found.',
        shouldExecute: false,
      };
    }

    // Mark as cancelled
    confirmation.status = 'cancelled';
    confirmation.resolvedAt = new Date().toISOString();

    // Remove from pending
    this.pendingConfirmations.delete(confirmationId);
    this.notifySubscribers();

    return {
      success: true,
      message: 'Action cancelled. No changes were made.',
      confirmation,
      shouldExecute: false,
    };
  }

  /**
   * Get a pending confirmation by ID
   */
  getConfirmation(confirmationId: string): PendingConfirmation | null {
    return this.pendingConfirmations.get(confirmationId) || null;
  }

  /**
   * Get all pending confirmations
   */
  getPendingConfirmations(): PendingConfirmation[] {
    return Array.from(this.pendingConfirmations.values()).filter(
      c => c.status === 'pending' && new Date(c.expiresAt) > new Date()
    );
  }

  /**
   * Check if there are any pending confirmations
   */
  hasPendingConfirmations(): boolean {
    return this.getPendingConfirmations().length > 0;
  }

  /**
   * Get pending confirmation for a specific action/entity
   */
  findPendingConfirmation(action: string, entityId?: string): PendingConfirmation | null {
    const pending = this.getPendingConfirmations();

    return pending.find(c => {
      if (c.action.plan.tool !== action) return false;
      if (entityId && c.affectedEntity?.id !== entityId) return false;
      return true;
    }) || null;
  }

  // ============================================
  // Cleanup & Utilities
  // ============================================

  /**
   * Clean up expired confirmations
   */
  private cleanupExpired(): void {
    const now = new Date();
    let hasChanges = false;

    for (const [id, confirmation] of this.pendingConfirmations.entries()) {
      if (new Date(confirmation.expiresAt) < now) {
        confirmation.status = 'expired';
        confirmation.resolvedAt = now.toISOString();
        this.pendingConfirmations.delete(id);
        hasChanges = true;
      }
    }

    // Also clean up old cooldowns
    for (const [key, until] of this.actionCooldowns.entries()) {
      if (until < now.getTime()) {
        this.actionCooldowns.delete(key);
      }
    }

    if (hasChanges) {
      this.notifySubscribers();
    }
  }

  /**
   * Build message from template
   */
  private buildMessage(
    template: string | undefined,
    variables: Record<string, string | number>
  ): string {
    if (!template) return '';

    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
  }

  /**
   * Clear all pending confirmations
   */
  clearAll(): void {
    const now = new Date().toISOString();

    for (const confirmation of this.pendingConfirmations.values()) {
      confirmation.status = 'cancelled';
      confirmation.resolvedAt = now;
    }

    this.pendingConfirmations.clear();
    this.actionCooldowns.clear();
    this.notifySubscribers();
  }

  /**
   * Destroy the manager (cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.pendingConfirmations.clear();
    this.actionCooldowns.clear();
    this.subscribers = [];
  }
}

// ============================================
// Singleton Instance
// ============================================

const confirmationManager = new ConfirmationManager();

// ============================================
// Exported Functions
// ============================================

/**
 * Check if an action requires confirmation
 */
export function requiresConfirmation(action: string): boolean {
  return confirmationManager.requiresConfirmation(action);
}

/**
 * Get configuration for an action
 */
export function getConfirmationConfig(action: string): ConfirmationConfig | null {
  return confirmationManager.getConfig(action);
}

/**
 * Check if action is on cooldown
 */
export function isOnCooldown(action: string, entityId?: string): boolean {
  return confirmationManager.isOnCooldown(action, entityId);
}

/**
 * Get remaining cooldown time
 */
export function getCooldownRemaining(action: string, entityId?: string): number {
  return confirmationManager.getCooldownRemaining(action, entityId);
}

/**
 * Create a pending confirmation
 */
export function createConfirmation(
  plan: ExecutionPlan,
  entityName?: string,
  entityId?: string
): ConfirmationResult {
  return confirmationManager.createConfirmation(plan, entityName, entityId);
}

/**
 * Confirm a pending action
 */
export function confirmAction(confirmationId: string): ConfirmationResult {
  return confirmationManager.confirm(confirmationId);
}

/**
 * Cancel a pending confirmation
 */
export function cancelConfirmation(confirmationId: string): ConfirmationResult {
  return confirmationManager.cancel(confirmationId);
}

/**
 * Get a pending confirmation
 */
export function getConfirmation(confirmationId: string): PendingConfirmation | null {
  return confirmationManager.getConfirmation(confirmationId);
}

/**
 * Get all pending confirmations
 */
export function getPendingConfirmations(): PendingConfirmation[] {
  return confirmationManager.getPendingConfirmations();
}

/**
 * Check if there are pending confirmations
 */
export function hasPendingConfirmations(): boolean {
  return confirmationManager.hasPendingConfirmations();
}

/**
 * Find a pending confirmation for action/entity
 */
export function findPendingConfirmation(action: string, entityId?: string): PendingConfirmation | null {
  return confirmationManager.findPendingConfirmation(action, entityId);
}

/**
 * Subscribe to confirmation changes
 */
export function subscribeToConfirmations(
  callback: (confirmations: PendingConfirmation[]) => void
): () => void {
  return confirmationManager.subscribe(callback);
}

/**
 * Clear all pending confirmations
 */
export function clearAllConfirmations(): void {
  confirmationManager.clearAll();
}

/**
 * Get the confirmation manager instance
 */
export function getConfirmationManager(): ConfirmationManager {
  return confirmationManager;
}

export default confirmationManager;
