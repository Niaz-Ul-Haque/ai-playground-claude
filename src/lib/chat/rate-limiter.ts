// Rate Limiter - Phase 5: Safety Patterns
// Provides rate limiting for sensitive operations to prevent accidental spam/abuse

import type { EntityType } from '@/types/tools';

// ============================================
// Types
// ============================================

export type RateLimitCategory =
  | 'create'      // Creating new entities
  | 'delete'      // Deleting/archiving entities
  | 'update'      // Updating entities
  | 'export'      // Exporting data
  | 'bulk'        // Bulk operations
  | 'sensitive';  // Sensitive operations

export interface RateLimitConfig {
  /** Maximum operations allowed in the window */
  maxOperations: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Whether to apply per-entity limits */
  perEntity?: boolean;
  /** Message to show when rate limited */
  message?: string;
}

export interface RateLimitEntry {
  /** Operation count in current window */
  count: number;
  /** Window start timestamp */
  windowStart: number;
  /** Last operation timestamp */
  lastOperation: number;
}

export interface RateLimitResult {
  /** Whether the operation is allowed */
  allowed: boolean;
  /** If not allowed, reason message */
  message?: string;
  /** Remaining operations in current window */
  remaining: number;
  /** Time until window resets (ms) */
  resetIn: number;
  /** When the rate limit will reset */
  resetAt: string;
}

// ============================================
// Rate Limit Configurations
// ============================================

const DEFAULT_RATE_LIMITS: Record<RateLimitCategory, RateLimitConfig> = {
  create: {
    maxOperations: 20,
    windowMs: 60000, // 1 minute
    message: 'You\'re creating items too quickly. Please wait a moment.',
  },
  delete: {
    maxOperations: 10,
    windowMs: 60000,
    perEntity: false,
    message: 'You\'re deleting items too quickly. Please slow down to avoid accidents.',
  },
  update: {
    maxOperations: 30,
    windowMs: 60000,
    message: 'You\'re making updates too quickly. Please wait a moment.',
  },
  export: {
    maxOperations: 5,
    windowMs: 300000, // 5 minutes
    message: 'You\'ve reached the export limit. Please wait before exporting again.',
  },
  bulk: {
    maxOperations: 3,
    windowMs: 300000, // 5 minutes
    message: 'Bulk operations are limited. Please wait before performing another.',
  },
  sensitive: {
    maxOperations: 5,
    windowMs: 60000,
    message: 'Please slow down. This action requires careful consideration.',
  },
};

// Map tools to rate limit categories
const TOOL_CATEGORIES: Record<string, RateLimitCategory> = {
  // Create operations
  create_task: 'create',
  create_client: 'create',
  create_opportunity: 'create',
  add_client: 'create',
  add_opportunity: 'create',
  suggest_automation: 'create',
  start_workflow: 'create',

  // Delete operations
  delete_task: 'delete',
  archive_client: 'delete',
  archive_opportunity: 'delete',
  dismiss_opportunity: 'delete',
  cancel_workflow: 'delete',

  // Update operations
  update_task: 'update',
  update_client: 'update',
  update_opportunity: 'update',
  complete_task: 'update',
  approve_task: 'update',
  reject_task: 'update',
  snooze_opportunity: 'update',
  pause_automation: 'update',
  resume_automation: 'update',
  reschedule_task: 'update',

  // Export operations
  export_tasks: 'export',
  export_clients: 'export',
  export_opportunities: 'export',

  // Bulk operations
  bulk_delete_tasks: 'bulk',
  bulk_archive_clients: 'bulk',
  bulk_update_tasks: 'bulk',
};

// ============================================
// Rate Limiter Class
// ============================================

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private configs: Record<RateLimitCategory, RateLimitConfig>;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers: Array<(key: string, result: RateLimitResult) => void> = [];

  constructor(customConfigs?: Partial<Record<RateLimitCategory, Partial<RateLimitConfig>>>) {
    // Merge custom configs with defaults
    this.configs = { ...DEFAULT_RATE_LIMITS };
    if (customConfigs) {
      for (const [category, config] of Object.entries(customConfigs)) {
        this.configs[category as RateLimitCategory] = {
          ...this.configs[category as RateLimitCategory],
          ...config,
        };
      }
    }

    // Start cleanup interval (every minute)
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  // ============================================
  // Subscription Management
  // ============================================

  subscribe(callback: (key: string, result: RateLimitResult) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(key: string, result: RateLimitResult): void {
    this.subscribers.forEach(cb => cb(key, result));
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Get the rate limit category for a tool
   */
  getCategoryForTool(tool: string): RateLimitCategory | null {
    return TOOL_CATEGORIES[tool] || null;
  }

  /**
   * Check if an operation is allowed
   */
  check(tool: string, entityType?: EntityType, entityId?: string): RateLimitResult {
    const category = this.getCategoryForTool(tool);

    if (!category) {
      // No rate limit configured for this tool
      return {
        allowed: true,
        remaining: Infinity,
        resetIn: 0,
        resetAt: new Date().toISOString(),
      };
    }

    const config = this.configs[category];
    const key = this.buildKey(category, entityType, entityId, config.perEntity);
    const now = Date.now();

    // Get or create entry
    let entry = this.limits.get(key);

    // Check if window has expired
    if (!entry || now - entry.windowStart >= config.windowMs) {
      // New window
      entry = {
        count: 0,
        windowStart: now,
        lastOperation: now,
      };
      this.limits.set(key, entry);
    }

    // Calculate remaining and reset time
    const remaining = Math.max(0, config.maxOperations - entry.count);
    const resetIn = Math.max(0, config.windowMs - (now - entry.windowStart));
    const resetAt = new Date(entry.windowStart + config.windowMs).toISOString();

    // Check if allowed
    const allowed = entry.count < config.maxOperations;

    const result: RateLimitResult = {
      allowed,
      remaining: allowed ? remaining - 1 : 0,
      resetIn,
      resetAt,
    };

    if (!allowed) {
      result.message = config.message || `Rate limit exceeded. Please wait ${Math.ceil(resetIn / 1000)} seconds.`;
    }

    return result;
  }

  /**
   * Record an operation (call after successful execution)
   */
  record(tool: string, entityType?: EntityType, entityId?: string): RateLimitResult {
    const category = this.getCategoryForTool(tool);

    if (!category) {
      return {
        allowed: true,
        remaining: Infinity,
        resetIn: 0,
        resetAt: new Date().toISOString(),
      };
    }

    const config = this.configs[category];
    const key = this.buildKey(category, entityType, entityId, config.perEntity);
    const now = Date.now();

    // Get or create entry
    let entry = this.limits.get(key);

    // Check if window has expired
    if (!entry || now - entry.windowStart >= config.windowMs) {
      entry = {
        count: 0,
        windowStart: now,
        lastOperation: now,
      };
    }

    // Increment count
    entry.count++;
    entry.lastOperation = now;
    this.limits.set(key, entry);

    // Calculate result
    const remaining = Math.max(0, config.maxOperations - entry.count);
    const resetIn = Math.max(0, config.windowMs - (now - entry.windowStart));
    const resetAt = new Date(entry.windowStart + config.windowMs).toISOString();
    const allowed = entry.count <= config.maxOperations;

    const result: RateLimitResult = {
      allowed,
      remaining,
      resetIn,
      resetAt,
    };

    this.notifySubscribers(key, result);

    return result;
  }

  /**
   * Check and record in one operation (atomic)
   */
  checkAndRecord(tool: string, entityType?: EntityType, entityId?: string): RateLimitResult {
    const checkResult = this.check(tool, entityType, entityId);

    if (!checkResult.allowed) {
      return checkResult;
    }

    return this.record(tool, entityType, entityId);
  }

  /**
   * Get current rate limit status for a tool
   */
  getStatus(tool: string, entityType?: EntityType, entityId?: string): RateLimitResult | null {
    const category = this.getCategoryForTool(tool);
    if (!category) return null;

    const config = this.configs[category];
    const key = this.buildKey(category, entityType, entityId, config.perEntity);
    const entry = this.limits.get(key);

    if (!entry) {
      return {
        allowed: true,
        remaining: config.maxOperations,
        resetIn: 0,
        resetAt: new Date().toISOString(),
      };
    }

    const now = Date.now();
    const elapsed = now - entry.windowStart;

    if (elapsed >= config.windowMs) {
      return {
        allowed: true,
        remaining: config.maxOperations,
        resetIn: 0,
        resetAt: new Date().toISOString(),
      };
    }

    const remaining = Math.max(0, config.maxOperations - entry.count);
    const resetIn = Math.max(0, config.windowMs - elapsed);
    const resetAt = new Date(entry.windowStart + config.windowMs).toISOString();

    return {
      allowed: remaining > 0,
      remaining,
      resetIn,
      resetAt,
    };
  }

  /**
   * Get all current rate limit statuses
   */
  getAllStatuses(): Record<string, RateLimitResult> {
    const result: Record<string, RateLimitResult> = {};
    const now = Date.now();

    for (const [key, entry] of this.limits.entries()) {
      // Extract category from key
      const category = key.split(':')[0] as RateLimitCategory;
      const config = this.configs[category];

      if (!config) continue;

      const elapsed = now - entry.windowStart;
      if (elapsed >= config.windowMs) continue;

      const remaining = Math.max(0, config.maxOperations - entry.count);
      const resetIn = Math.max(0, config.windowMs - elapsed);
      const resetAt = new Date(entry.windowStart + config.windowMs).toISOString();

      result[key] = {
        allowed: remaining > 0,
        remaining,
        resetIn,
        resetAt,
      };
    }

    return result;
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(tool: string, entityType?: EntityType, entityId?: string): void {
    const category = this.getCategoryForTool(tool);
    if (!category) return;

    const config = this.configs[category];
    const key = this.buildKey(category, entityType, entityId, config.perEntity);
    this.limits.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Build a unique key for rate limiting
   */
  private buildKey(
    category: RateLimitCategory,
    entityType?: EntityType,
    entityId?: string,
    perEntity?: boolean
  ): string {
    let key = category;

    if (perEntity && entityType) {
      key += `:${entityType}`;
      if (entityId) {
        key += `:${entityId}`;
      }
    }

    return key;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.limits.entries()) {
      const category = key.split(':')[0] as RateLimitCategory;
      const config = this.configs[category];

      if (!config) {
        this.limits.delete(key);
        continue;
      }

      // Remove if window has expired and entry is old
      if (now - entry.windowStart >= config.windowMs * 2) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter (cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
    this.subscribers = [];
  }
}

// ============================================
// Singleton Instance
// ============================================

const rateLimiter = new RateLimiter();

// ============================================
// Exported Functions
// ============================================

/**
 * Check if an operation is allowed
 */
export function checkRateLimit(
  tool: string,
  entityType?: EntityType,
  entityId?: string
): RateLimitResult {
  return rateLimiter.check(tool, entityType, entityId);
}

/**
 * Record an operation
 */
export function recordOperation(
  tool: string,
  entityType?: EntityType,
  entityId?: string
): RateLimitResult {
  return rateLimiter.record(tool, entityType, entityId);
}

/**
 * Check and record in one atomic operation
 */
export function checkAndRecordOperation(
  tool: string,
  entityType?: EntityType,
  entityId?: string
): RateLimitResult {
  return rateLimiter.checkAndRecord(tool, entityType, entityId);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(
  tool: string,
  entityType?: EntityType,
  entityId?: string
): RateLimitResult | null {
  return rateLimiter.getStatus(tool, entityType, entityId);
}

/**
 * Get all current rate limit statuses
 */
export function getAllRateLimitStatuses(): Record<string, RateLimitResult> {
  return rateLimiter.getAllStatuses();
}

/**
 * Reset rate limit for a tool
 */
export function resetRateLimit(
  tool: string,
  entityType?: EntityType,
  entityId?: string
): void {
  rateLimiter.reset(tool, entityType, entityId);
}

/**
 * Reset all rate limits
 */
export function resetAllRateLimits(): void {
  rateLimiter.resetAll();
}

/**
 * Subscribe to rate limit events
 */
export function subscribeToRateLimits(
  callback: (key: string, result: RateLimitResult) => void
): () => void {
  return rateLimiter.subscribe(callback);
}

/**
 * Get the rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  return rateLimiter;
}

export default rateLimiter;
