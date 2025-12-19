// Export Generator - Phase 6: Export Functionality
// Generates CSV/JSON exports with proper formatting and blob URL creation

import type { Client } from '@/types/client';
import type { Task } from '@/types/task';
import type { Opportunity } from '@/types/opportunity';
import type { EntityType } from '@/types/tools';

// ============================================
// Types
// ============================================

export interface ExportOptions {
  /** Format for the export */
  format: 'csv' | 'json';
  /** Include headers in CSV */
  includeHeaders?: boolean;
  /** Pretty print JSON */
  prettyPrint?: boolean;
  /** Fields to include (all if not specified) */
  fields?: string[];
  /** Custom field labels */
  fieldLabels?: Record<string, string>;
}

export interface ExportResult {
  /** The generated content */
  content: string;
  /** File name */
  fileName: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Number of records exported */
  recordCount: number;
  /** When the export was generated */
  generatedAt: string;
  /** Entity type exported */
  entityType: EntityType;
  /** Format used */
  format: 'csv' | 'json';
  /** Download URL (blob) */
  downloadUrl: string;
  /** When the URL expires (optional) */
  expiresAt?: string;
}

// ============================================
// CSV Utilities
// ============================================

/**
 * Escape a value for CSV format
 * Handles quotes, commas, and newlines
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // If the value contains special characters, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}

/**
 * Format a date for export
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr || '';
  }
}

/**
 * Format currency for export
 */
function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return '';
  return value.toFixed(2);
}

/**
 * Format an array for CSV
 */
function formatArray(arr: unknown[] | undefined): string {
  if (!arr || arr.length === 0) return '';
  return arr.map(item => String(item)).join('; ');
}

// ============================================
// Client Export
// ============================================

const CLIENT_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'riskProfile', label: 'Risk Profile' },
  { key: 'portfolioValue', label: 'Portfolio Value' },
  { key: 'accountType', label: 'Account Type' },
  { key: 'status', label: 'Status' },
  { key: 'city', label: 'City' },
  { key: 'province', label: 'Province' },
  { key: 'postalCode', label: 'Postal Code' },
  { key: 'birthDate', label: 'Birth Date' },
  { key: 'lastContact', label: 'Last Contact' },
  { key: 'nextMeeting', label: 'Next Meeting' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'employer', label: 'Employer' },
  { key: 'annualIncome', label: 'Annual Income' },
  { key: 'tags', label: 'Tags' },
  { key: 'notes', label: 'Notes' },
  { key: 'createdAt', label: 'Created At' },
];

/**
 * Generate CSV content for clients
 */
export function generateClientsCsv(
  clients: Client[],
  options: Partial<ExportOptions> = {}
): string {
  const { includeHeaders = true, fields } = options;

  // Filter columns if specific fields requested
  const columns = fields
    ? CLIENT_COLUMNS.filter(col => fields.includes(col.key))
    : CLIENT_COLUMNS;

  const rows: string[] = [];

  // Add header row
  if (includeHeaders) {
    rows.push(columns.map(col => escapeCSVValue(col.label)).join(','));
  }

  // Add data rows
  for (const client of clients) {
    const values = columns.map(col => {
      const key = col.key as keyof Client;
      const value = client[key];

      // Special handling for certain fields
      switch (key) {
        case 'portfolioValue':
        case 'annualIncome':
          return escapeCSVValue(formatCurrency(value as number));
        case 'birthDate':
        case 'lastContact':
        case 'nextMeeting':
        case 'createdAt':
          return escapeCSVValue(formatDate(value as string));
        case 'tags':
          return escapeCSVValue(formatArray(value as string[]));
        default:
          return escapeCSVValue(value);
      }
    });

    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate JSON content for clients
 */
export function generateClientsJson(
  clients: Client[],
  options: Partial<ExportOptions> = {}
): string {
  const { prettyPrint = true, fields } = options;

  let data: Client[] | Record<string, unknown>[] = clients;

  // Filter fields if specified
  if (fields && fields.length > 0) {
    data = clients.map(client => {
      const filtered: Record<string, unknown> = {};
      const clientRecord = client as unknown as Record<string, unknown>;
      for (const field of fields) {
        if (field in client) {
          filtered[field] = clientRecord[field];
        }
      }
      return filtered;
    });
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

// ============================================
// Task Export
// ============================================

const TASK_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'clientId', label: 'Client ID' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'aiCompleted', label: 'AI Completed' },
  { key: 'aiActionType', label: 'AI Action Type' },
  { key: 'tags', label: 'Tags' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'updatedAt', label: 'Updated At' },
  { key: 'completedAt', label: 'Completed At' },
];

/**
 * Generate CSV content for tasks
 */
export function generateTasksCsv(
  tasks: Task[],
  options: Partial<ExportOptions> = {}
): string {
  const { includeHeaders = true, fields } = options;

  const columns = fields
    ? TASK_COLUMNS.filter(col => fields.includes(col.key))
    : TASK_COLUMNS;

  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(columns.map(col => escapeCSVValue(col.label)).join(','));
  }

  for (const task of tasks) {
    const values = columns.map(col => {
      const key = col.key as keyof Task;
      const value = task[key];

      switch (key) {
        case 'dueDate':
        case 'createdAt':
        case 'updatedAt':
        case 'completedAt':
          return escapeCSVValue(formatDate(value as string));
        case 'tags':
          return escapeCSVValue(formatArray(value as string[]));
        case 'aiCompleted':
          return escapeCSVValue(value ? 'Yes' : 'No');
        default:
          return escapeCSVValue(value);
      }
    });

    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate JSON content for tasks
 */
export function generateTasksJson(
  tasks: Task[],
  options: Partial<ExportOptions> = {}
): string {
  const { prettyPrint = true, fields } = options;

  let data: Task[] | Record<string, unknown>[] = tasks;

  if (fields && fields.length > 0) {
    data = tasks.map(task => {
      const filtered: Record<string, unknown> = {};
      const taskRecord = task as unknown as Record<string, unknown>;
      for (const field of fields) {
        if (field in task) {
          filtered[field] = taskRecord[field];
        }
      }
      return filtered;
    });
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

// ============================================
// Opportunity Export
// ============================================

const OPPORTUNITY_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'clientId', label: 'Client ID' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'whyNow', label: 'Why Now' },
  { key: 'status', label: 'Status' },
  { key: 'impactScore', label: 'Impact Score' },
  { key: 'impactLevel', label: 'Impact Level' },
  { key: 'estimatedValue', label: 'Estimated Value' },
  { key: 'readiness', label: 'Readiness' },
  { key: 'priority', label: 'Priority' },
  { key: 'sourceType', label: 'Source Type' },
  { key: 'surfacedAt', label: 'Surfaced At' },
  { key: 'expiresAt', label: 'Expires At' },
  { key: 'snoozedUntil', label: 'Snoozed Until' },
  { key: 'dismissedReason', label: 'Dismissed Reason' },
];

/**
 * Generate CSV content for opportunities
 */
export function generateOpportunitiesCsv(
  opportunities: Opportunity[],
  options: Partial<ExportOptions> = {}
): string {
  const { includeHeaders = true, fields } = options;

  const columns = fields
    ? OPPORTUNITY_COLUMNS.filter(col => fields.includes(col.key))
    : OPPORTUNITY_COLUMNS;

  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(columns.map(col => escapeCSVValue(col.label)).join(','));
  }

  for (const opp of opportunities) {
    const values = columns.map(col => {
      const key = col.key as keyof Opportunity;
      const value = opp[key];

      switch (key) {
        case 'estimatedValue':
        case 'impactScore':
          return escapeCSVValue(formatCurrency(value as number));
        case 'surfacedAt':
        case 'expiresAt':
        case 'snoozedUntil':
          return escapeCSVValue(formatDate(value as string));
        default:
          return escapeCSVValue(value);
      }
    });

    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate JSON content for opportunities
 */
export function generateOpportunitiesJson(
  opportunities: Opportunity[],
  options: Partial<ExportOptions> = {}
): string {
  const { prettyPrint = true, fields } = options;

  let data: Opportunity[] | Record<string, unknown>[] = opportunities;

  if (fields && fields.length > 0) {
    data = opportunities.map(opp => {
      const filtered: Record<string, unknown> = {};
      const oppRecord = opp as unknown as Record<string, unknown>;
      for (const field of fields) {
        if (field in opp) {
          filtered[field] = oppRecord[field];
        }
      }
      return filtered;
    });
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

// ============================================
// Blob URL Creation
// ============================================

/**
 * Create a download URL from content
 * Note: These URLs expire when the page is unloaded
 */
export function createDownloadUrl(
  content: string,
  format: 'csv' | 'json'
): string {
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  return URL.createObjectURL(blob);
}

/**
 * Revoke a download URL to free memory
 */
export function revokeDownloadUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore errors if URL is already revoked or invalid
  }
}

/**
 * Get file size from content
 */
export function getFileSize(content: string): number {
  return new Blob([content]).size;
}

// ============================================
// High-Level Export Functions
// ============================================

/**
 * Export clients with full result metadata
 */
export function exportClients(
  clients: Client[],
  options: Partial<ExportOptions> = {}
): ExportResult {
  const format = options.format || 'csv';
  const generatedAt = new Date().toISOString();

  const content = format === 'csv'
    ? generateClientsCsv(clients, options)
    : generateClientsJson(clients, options);

  const fileName = `clients_${generatedAt.split('T')[0]}.${format}`;
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const fileSize = getFileSize(content);
  const downloadUrl = createDownloadUrl(content, format);

  return {
    content,
    fileName,
    mimeType,
    fileSize,
    recordCount: clients.length,
    generatedAt,
    entityType: 'client',
    format,
    downloadUrl,
  };
}

/**
 * Export tasks with full result metadata
 */
export function exportTasks(
  tasks: Task[],
  options: Partial<ExportOptions> = {}
): ExportResult {
  const format = options.format || 'csv';
  const generatedAt = new Date().toISOString();

  const content = format === 'csv'
    ? generateTasksCsv(tasks, options)
    : generateTasksJson(tasks, options);

  const fileName = `tasks_${generatedAt.split('T')[0]}.${format}`;
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const fileSize = getFileSize(content);
  const downloadUrl = createDownloadUrl(content, format);

  return {
    content,
    fileName,
    mimeType,
    fileSize,
    recordCount: tasks.length,
    generatedAt,
    entityType: 'task',
    format,
    downloadUrl,
  };
}

/**
 * Export opportunities with full result metadata
 */
export function exportOpportunities(
  opportunities: Opportunity[],
  options: Partial<ExportOptions> = {}
): ExportResult {
  const format = options.format || 'csv';
  const generatedAt = new Date().toISOString();

  const content = format === 'csv'
    ? generateOpportunitiesCsv(opportunities, options)
    : generateOpportunitiesJson(opportunities, options);

  const fileName = `opportunities_${generatedAt.split('T')[0]}.${format}`;
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const fileSize = getFileSize(content);
  const downloadUrl = createDownloadUrl(content, format);

  return {
    content,
    fileName,
    mimeType,
    fileSize,
    recordCount: opportunities.length,
    generatedAt,
    entityType: 'opportunity',
    format,
    downloadUrl,
  };
}

// ============================================
// Export History (Optional - for future use)
// ============================================

interface ExportHistoryEntry {
  id: string;
  entityType: EntityType;
  format: 'csv' | 'json';
  recordCount: number;
  fileSize: number;
  generatedAt: string;
  downloadUrl: string;
}

const exportHistory: ExportHistoryEntry[] = [];
const MAX_HISTORY_ENTRIES = 10;

/**
 * Add an export to history
 */
export function addToExportHistory(result: ExportResult): void {
  const entry: ExportHistoryEntry = {
    id: `export-${Date.now()}`,
    entityType: result.entityType,
    format: result.format,
    recordCount: result.recordCount,
    fileSize: result.fileSize,
    generatedAt: result.generatedAt,
    downloadUrl: result.downloadUrl,
  };

  exportHistory.unshift(entry);

  // Clean up old entries and revoke their URLs
  while (exportHistory.length > MAX_HISTORY_ENTRIES) {
    const removed = exportHistory.pop();
    if (removed) {
      revokeDownloadUrl(removed.downloadUrl);
    }
  }
}

/**
 * Get export history
 */
export function getExportHistory(): ExportHistoryEntry[] {
  return [...exportHistory];
}

/**
 * Clear export history and revoke all URLs
 */
export function clearExportHistory(): void {
  for (const entry of exportHistory) {
    revokeDownloadUrl(entry.downloadUrl);
  }
  exportHistory.length = 0;
}

/**
 * Get an export from history by ID
 */
export function getExportById(id: string): ExportHistoryEntry | undefined {
  return exportHistory.find(entry => entry.id === id);
}
