// Audit Logger - Phase 5: Safety Patterns
// Provides audit logging for compliance and tracking of all mutations

import type { EntityType } from '@/types/tools';
import type { ExecutionPlan } from '@/types/execution-plan';

// ============================================
// Types
// ============================================

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'export'
  | 'confirm'
  | 'cancel'
  | 'undo'
  | 'login'
  | 'logout'
  | 'error';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEntry {
  /** Unique audit entry ID */
  id: string;
  /** Timestamp of the action */
  timestamp: string;
  /** Action type */
  action: AuditAction;
  /** Severity level */
  severity: AuditSeverity;
  /** User ID (for future auth integration) */
  userId: string;
  /** Session ID */
  sessionId: string;
  /** Entity type affected */
  entityType?: EntityType;
  /** Entity ID affected */
  entityId?: string;
  /** Entity name (for display) */
  entityName?: string;
  /** Tool that was executed */
  tool: string;
  /** Whether the action succeeded */
  success: boolean;
  /** Action parameters (sanitized) */
  parameters?: Record<string, unknown>;
  /** Result summary */
  resultSummary?: string;
  /** Error message if failed */
  errorMessage?: string;
  /** IP address (for future use) */
  ipAddress?: string;
  /** User agent (for future use) */
  userAgent?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface AuditFilter {
  /** Filter by action type */
  actions?: AuditAction[];
  /** Filter by entity type */
  entityTypes?: EntityType[];
  /** Filter by entity ID */
  entityId?: string;
  /** Filter by tool */
  tools?: string[];
  /** Filter by user ID */
  userId?: string;
  /** Filter by session ID */
  sessionId?: string;
  /** Filter by severity */
  severities?: AuditSeverity[];
  /** Filter by success status */
  success?: boolean;
  /** Filter by date range start */
  from?: string;
  /** Filter by date range end */
  to?: string;
  /** Search in result summary */
  searchTerm?: string;
}

export interface AuditStats {
  /** Total entries */
  total: number;
  /** Entries by action */
  byAction: Record<AuditAction, number>;
  /** Entries by entity type */
  byEntityType: Record<string, number>;
  /** Entries by severity */
  bySeverity: Record<AuditSeverity, number>;
  /** Success rate */
  successRate: number;
  /** Most recent entry timestamp */
  lastActivity?: string;
}

export interface AuditExport {
  /** Export format */
  format: 'json' | 'csv';
  /** Entries to export */
  entries: AuditEntry[];
  /** Generated at */
  generatedAt: string;
  /** Filter used */
  filter?: AuditFilter;
}

// ============================================
// Action Severity Mapping
// ============================================

const ACTION_SEVERITY: Record<string, AuditSeverity> = {
  // Critical actions
  delete_task: 'critical',
  archive_client: 'critical',
  archive_opportunity: 'critical',
  bulk_delete_tasks: 'critical',
  bulk_archive_clients: 'critical',
  cancel_workflow: 'critical',

  // Warning actions
  dismiss_opportunity: 'warning',
  export_clients: 'warning',
  export_tasks: 'warning',
  export_opportunities: 'warning',
  update_client: 'warning',

  // Info actions (default)
  create_task: 'info',
  create_client: 'info',
  update_task: 'info',
  complete_task: 'info',
  approve_task: 'info',
  reject_task: 'info',
  list_clients: 'info',
  list_tasks: 'info',
  get_client: 'info',
  get_task: 'info',
};

// ============================================
// Audit Logger Class
// ============================================

class AuditLogger {
  private entries: AuditEntry[] = [];
  private readonly maxEntries: number = 1000;
  private subscribers: Array<(entry: AuditEntry) => void> = [];
  private currentUserId: string = 'advisor-001'; // Default for mock
  private currentSessionId: string = '';
  private persistToStorage: boolean = true;
  private storageKey: string = 'ciri_audit_log';

  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.loadFromStorage();
  }

  // ============================================
  // Configuration
  // ============================================

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.currentSessionId;
  }

  /**
   * Enable/disable storage persistence
   */
  setPersistence(enabled: boolean): void {
    this.persistToStorage = enabled;
  }

  // ============================================
  // Subscription Management
  // ============================================

  subscribe(callback: (entry: AuditEntry) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(entry: AuditEntry): void {
    this.subscribers.forEach(cb => cb(entry));
  }

  // ============================================
  // Core Logging Methods
  // ============================================

  /**
   * Log an action
   */
  log(
    action: AuditAction,
    tool: string,
    success: boolean,
    options: {
      entityType?: EntityType;
      entityId?: string;
      entityName?: string;
      parameters?: Record<string, unknown>;
      resultSummary?: string;
      errorMessage?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): AuditEntry {
    const severity = this.getSeverity(tool, action);

    const entry: AuditEntry = {
      id: this.generateEntryId(),
      timestamp: new Date().toISOString(),
      action,
      severity,
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
      tool,
      success,
      ...options,
      // Sanitize parameters to remove sensitive data
      parameters: options.parameters
        ? this.sanitizeParameters(options.parameters)
        : undefined,
    };

    this.addEntry(entry);
    return entry;
  }

  /**
   * Log from an execution plan and result
   */
  logFromPlan(
    plan: ExecutionPlan,
    success: boolean,
    result?: {
      entityId?: string;
      entityName?: string;
      message?: string;
      error?: string;
    }
  ): AuditEntry {
    const action = this.getActionFromIntent(plan.intent);

    return this.log(action, plan.tool, success, {
      entityType: plan.entity,
      entityId: result?.entityId || (plan.arguments.id as string),
      entityName: result?.entityName || (plan.arguments.name as string),
      parameters: plan.arguments,
      resultSummary: result?.message,
      errorMessage: result?.error,
      metadata: {
        intent: plan.intent,
        confidence: plan.confidence,
        renderAs: plan.renderAs,
      },
    });
  }

  /**
   * Log a confirmation action
   */
  logConfirmation(
    confirmationId: string,
    confirmed: boolean,
    entityType?: EntityType,
    entityId?: string,
    entityName?: string
  ): AuditEntry {
    return this.log(confirmed ? 'confirm' : 'cancel', 'confirmation', true, {
      entityType,
      entityId,
      entityName,
      resultSummary: confirmed
        ? `User confirmed action ${confirmationId}`
        : `User cancelled action ${confirmationId}`,
      metadata: { confirmationId },
    });
  }

  /**
   * Log an undo action
   */
  logUndo(
    undoEntryId: string,
    success: boolean,
    entityType?: EntityType,
    entityId?: string,
    entityName?: string,
    errorMessage?: string
  ): AuditEntry {
    return this.log('undo', 'undo', success, {
      entityType,
      entityId,
      entityName,
      resultSummary: success
        ? `Successfully undid action ${undoEntryId}`
        : `Failed to undo action ${undoEntryId}`,
      errorMessage,
      metadata: { undoEntryId },
    });
  }

  /**
   * Log an error
   */
  logError(
    tool: string,
    errorMessage: string,
    metadata?: Record<string, unknown>
  ): AuditEntry {
    return this.log('error', tool, false, {
      errorMessage,
      resultSummary: `Error executing ${tool}`,
      metadata,
    });
  }

  // ============================================
  // Query Methods
  // ============================================

  /**
   * Get all entries
   */
  getEntries(limit?: number): AuditEntry[] {
    const entries = [...this.entries].reverse(); // Most recent first
    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Get filtered entries
   */
  getFilteredEntries(filter: AuditFilter): AuditEntry[] {
    let entries = [...this.entries].reverse();

    if (filter.actions?.length) {
      entries = entries.filter(e => filter.actions!.includes(e.action));
    }

    if (filter.entityTypes?.length) {
      entries = entries.filter(e => e.entityType && filter.entityTypes!.includes(e.entityType));
    }

    if (filter.entityId) {
      entries = entries.filter(e => e.entityId === filter.entityId);
    }

    if (filter.tools?.length) {
      entries = entries.filter(e => filter.tools!.includes(e.tool));
    }

    if (filter.userId) {
      entries = entries.filter(e => e.userId === filter.userId);
    }

    if (filter.sessionId) {
      entries = entries.filter(e => e.sessionId === filter.sessionId);
    }

    if (filter.severities?.length) {
      entries = entries.filter(e => filter.severities!.includes(e.severity));
    }

    if (filter.success !== undefined) {
      entries = entries.filter(e => e.success === filter.success);
    }

    if (filter.from) {
      const fromDate = new Date(filter.from);
      entries = entries.filter(e => new Date(e.timestamp) >= fromDate);
    }

    if (filter.to) {
      const toDate = new Date(filter.to);
      entries = entries.filter(e => new Date(e.timestamp) <= toDate);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      entries = entries.filter(e =>
        e.resultSummary?.toLowerCase().includes(term) ||
        e.entityName?.toLowerCase().includes(term) ||
        e.tool.toLowerCase().includes(term)
      );
    }

    return entries;
  }

  /**
   * Get entry by ID
   */
  getEntry(id: string): AuditEntry | null {
    return this.entries.find(e => e.id === id) || null;
  }

  /**
   * Get entries for an entity
   */
  getEntityHistory(entityType: EntityType, entityId: string): AuditEntry[] {
    return this.getFilteredEntries({
      entityTypes: [entityType],
      entityId,
    });
  }

  /**
   * Get statistics
   */
  getStats(filter?: AuditFilter): AuditStats {
    const entries = filter ? this.getFilteredEntries(filter) : this.entries;

    const byAction: Record<AuditAction, number> = {
      create: 0,
      read: 0,
      update: 0,
      delete: 0,
      archive: 0,
      restore: 0,
      export: 0,
      confirm: 0,
      cancel: 0,
      undo: 0,
      login: 0,
      logout: 0,
      error: 0,
    };

    const byEntityType: Record<string, number> = {};
    const bySeverity: Record<AuditSeverity, number> = {
      info: 0,
      warning: 0,
      critical: 0,
    };

    let successCount = 0;

    for (const entry of entries) {
      byAction[entry.action]++;
      bySeverity[entry.severity]++;

      if (entry.entityType) {
        byEntityType[entry.entityType] = (byEntityType[entry.entityType] || 0) + 1;
      }

      if (entry.success) {
        successCount++;
      }
    }

    return {
      total: entries.length,
      byAction,
      byEntityType,
      bySeverity,
      successRate: entries.length > 0 ? successCount / entries.length : 1,
      lastActivity: entries.length > 0 ? entries[entries.length - 1].timestamp : undefined,
    };
  }

  // ============================================
  // Export Methods
  // ============================================

  /**
   * Export entries to JSON
   */
  exportToJson(filter?: AuditFilter): string {
    const entries = filter ? this.getFilteredEntries(filter) : this.entries;

    const exportData: AuditExport = {
      format: 'json',
      entries,
      generatedAt: new Date().toISOString(),
      filter,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export entries to CSV
   */
  exportToCsv(filter?: AuditFilter): string {
    const entries = filter ? this.getFilteredEntries(filter) : this.entries;

    const headers = [
      'ID',
      'Timestamp',
      'Action',
      'Severity',
      'User ID',
      'Session ID',
      'Tool',
      'Entity Type',
      'Entity ID',
      'Entity Name',
      'Success',
      'Result Summary',
      'Error Message',
    ];

    const rows = entries.map(e => [
      e.id,
      e.timestamp,
      e.action,
      e.severity,
      e.userId,
      e.sessionId,
      e.tool,
      e.entityType || '',
      e.entityId || '',
      e.entityName || '',
      e.success.toString(),
      (e.resultSummary || '').replace(/,/g, ';'),
      (e.errorMessage || '').replace(/,/g, ';'),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // ============================================
  // Management Methods
  // ============================================

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  /**
   * Clear entries older than a date
   */
  clearOlderThan(date: string): number {
    const cutoff = new Date(date);
    const originalLength = this.entries.length;
    this.entries = this.entries.filter(e => new Date(e.timestamp) >= cutoff);
    this.saveToStorage();
    return originalLength - this.entries.length;
  }

  // ============================================
  // Private Methods
  // ============================================

  private addEntry(entry: AuditEntry): void {
    this.entries.push(entry);

    // Trim if exceeded max
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    this.saveToStorage();
    this.notifySubscribers(entry);
  }

  private generateEntryId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverity(tool: string, action: AuditAction): AuditSeverity {
    if (action === 'error') return 'critical';
    return ACTION_SEVERITY[tool] || 'info';
  }

  private getActionFromIntent(intent: string): AuditAction {
    const intentMap: Record<string, AuditAction> = {
      create: 'create',
      read: 'read',
      search: 'read',
      update: 'update',
      delete: 'delete',
      export: 'export',
      confirm: 'confirm',
      cancel: 'cancel',
      undo: 'undo',
    };
    return intentMap[intent] || 'read';
  }

  private sanitizeParameters(params: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key'];

    for (const [key, value] of Object.entries(params)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private saveToStorage(): void {
    if (!this.persistToStorage) return;
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch {
      // Storage full or unavailable, continue without persistence
      console.warn('Failed to save audit log to storage');
    }
  }

  private loadFromStorage(): void {
    if (!this.persistToStorage) return;
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch {
      // Invalid data, start fresh
      this.entries = [];
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

const auditLogger = new AuditLogger();

// ============================================
// Exported Functions
// ============================================

/**
 * Log an action
 */
export function logAudit(
  action: AuditAction,
  tool: string,
  success: boolean,
  options?: {
    entityType?: EntityType;
    entityId?: string;
    entityName?: string;
    parameters?: Record<string, unknown>;
    resultSummary?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }
): AuditEntry {
  return auditLogger.log(action, tool, success, options);
}

/**
 * Log from execution plan
 */
export function logAuditFromPlan(
  plan: ExecutionPlan,
  success: boolean,
  result?: {
    entityId?: string;
    entityName?: string;
    message?: string;
    error?: string;
  }
): AuditEntry {
  return auditLogger.logFromPlan(plan, success, result);
}

/**
 * Log a confirmation action
 */
export function logConfirmation(
  confirmationId: string,
  confirmed: boolean,
  entityType?: EntityType,
  entityId?: string,
  entityName?: string
): AuditEntry {
  return auditLogger.logConfirmation(confirmationId, confirmed, entityType, entityId, entityName);
}

/**
 * Log an undo action
 */
export function logUndo(
  undoEntryId: string,
  success: boolean,
  entityType?: EntityType,
  entityId?: string,
  entityName?: string,
  errorMessage?: string
): AuditEntry {
  return auditLogger.logUndo(undoEntryId, success, entityType, entityId, entityName, errorMessage);
}

/**
 * Log an error
 */
export function logAuditError(
  tool: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
): AuditEntry {
  return auditLogger.logError(tool, errorMessage, metadata);
}

/**
 * Get audit entries
 */
export function getAuditEntries(limit?: number): AuditEntry[] {
  return auditLogger.getEntries(limit);
}

/**
 * Get filtered audit entries
 */
export function getFilteredAuditEntries(filter: AuditFilter): AuditEntry[] {
  return auditLogger.getFilteredEntries(filter);
}

/**
 * Get entity history
 */
export function getEntityAuditHistory(entityType: EntityType, entityId: string): AuditEntry[] {
  return auditLogger.getEntityHistory(entityType, entityId);
}

/**
 * Get audit statistics
 */
export function getAuditStats(filter?: AuditFilter): AuditStats {
  return auditLogger.getStats(filter);
}

/**
 * Export audit to JSON
 */
export function exportAuditToJson(filter?: AuditFilter): string {
  return auditLogger.exportToJson(filter);
}

/**
 * Export audit to CSV
 */
export function exportAuditToCsv(filter?: AuditFilter): string {
  return auditLogger.exportToCsv(filter);
}

/**
 * Subscribe to audit events
 */
export function subscribeToAudit(callback: (entry: AuditEntry) => void): () => void {
  return auditLogger.subscribe(callback);
}

/**
 * Set current user ID
 */
export function setAuditUserId(userId: string): void {
  auditLogger.setUserId(userId);
}

/**
 * Get current session ID
 */
export function getAuditSessionId(): string {
  return auditLogger.getSessionId();
}

/**
 * Clear audit log
 */
export function clearAuditLog(): void {
  auditLogger.clear();
}

/**
 * Clear old audit entries
 */
export function clearOldAuditEntries(olderThan: string): number {
  return auditLogger.clearOlderThan(olderThan);
}

/**
 * Get the audit logger instance
 */
export function getAuditLogger(): AuditLogger {
  return auditLogger;
}

export default auditLogger;
