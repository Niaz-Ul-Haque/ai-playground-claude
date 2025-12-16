// Integration Types for Ciri
// Data source and communication channel integrations

// Integration provider identifiers
export type IntegrationProvider =
  | 'google_drive'
  | 'onedrive'
  | 'dropbox'
  | 'icloud_drive'
  | 'gmail'
  | 'outlook'
  | 'google_calendar'
  | 'outlook_calendar'
  | 'icloud_calendar';

// Integration categories
export type IntegrationCategory = 'file_storage' | 'email' | 'calendar';

// Integration health status
export type IntegrationStatus = 'healthy' | 'warning' | 'error' | 'syncing' | 'disconnected';

// Main integration interface
export interface Integration {
  id: string;
  provider: IntegrationProvider;
  providerName: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  connectedAt: string;
  connectedBy: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  recordsSynced: number;
  errorMessage?: string;
  warningMessage?: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  scope?: string[]; // What the integration has access to
  metadata?: Record<string, unknown>;
}

// Available integration definition (for "Add New" section)
export interface AvailableIntegration {
  provider: IntegrationProvider;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string; // Icon name or component identifier
  features: string[];
  setupInstructions?: string[];
  isPopular?: boolean;
  isPremium?: boolean;
}

// Sync log entry
export interface SyncLogEntry {
  id: string;
  integrationId: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors?: SyncError[];
  duration: number; // in milliseconds
}

// Sync error
export interface SyncError {
  code: string;
  message: string;
  recordId?: string;
  field?: string;
  recoverable: boolean;
}

// Integration statistics
export interface IntegrationStats {
  totalConnected: number;
  healthy: number;
  warning: number;
  error: number;
  syncing: number;
  totalRecordsSynced: number;
  lastSyncTime?: string;
}

// Filter options for integrations
export interface IntegrationFilters {
  category?: IntegrationCategory;
  status?: IntegrationStatus;
  provider?: IntegrationProvider;
  search?: string;
}

// OAuth flow state
export interface OAuthFlowState {
  provider: IntegrationProvider;
  status: 'idle' | 'redirecting' | 'authorizing' | 'exchanging' | 'success' | 'error';
  error?: string;
}

// Export options
export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';
export type ExportScope = 'all_clients' | 'filtered' | 'selected';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  includeFields?: string[];
  excludeFields?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  clientIds?: string[]; // For 'selected' scope
}

export interface ExportResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: ExportFormat;
  recordCount: number;
  fileSize?: number; // in bytes
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Label constants
export const INTEGRATION_PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  google_drive: 'Google Drive',
  onedrive: 'OneDrive',
  dropbox: 'Dropbox',
  icloud_drive: 'iCloud Drive',
  gmail: 'Gmail',
  outlook: 'Outlook',
  google_calendar: 'Google Calendar',
  outlook_calendar: 'Outlook Calendar',
  icloud_calendar: 'iCloud Calendar',
};

export const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  file_storage: 'File Storage',
  email: 'Email',
  calendar: 'Calendar',
};

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  error: 'Error',
  syncing: 'Syncing',
  disconnected: 'Disconnected',
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  xlsx: 'Excel (XLSX)',
  json: 'JSON',
  pdf: 'PDF',
};

export const EXPORT_SCOPE_LABELS: Record<ExportScope, string> = {
  all_clients: 'All Clients',
  filtered: 'Filtered Results',
  selected: 'Selected Only',
};

// Provider icon mapping (for UI)
export const PROVIDER_ICONS: Record<IntegrationProvider, string> = {
  google_drive: 'FolderOpen',
  onedrive: 'Cloud',
  dropbox: 'Box',
  icloud_drive: 'CloudRain',
  gmail: 'Mail',
  outlook: 'Mail',
  google_calendar: 'Calendar',
  outlook_calendar: 'Calendar',
  icloud_calendar: 'Calendar',
};

// Provider colors (for UI)
export const PROVIDER_COLORS: Record<IntegrationProvider, string> = {
  google_drive: '#4285F4',
  onedrive: '#0078D4',
  dropbox: '#0061FF',
  icloud_drive: '#3693F3',
  gmail: '#EA4335',
  outlook: '#0072C6',
  google_calendar: '#4285F4',
  outlook_calendar: '#0072C6',
  icloud_calendar: '#3693F3',
};
