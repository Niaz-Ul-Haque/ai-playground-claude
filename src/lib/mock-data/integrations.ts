// Mock integrations data for Ciri
import {
  Integration,
  AvailableIntegration,
  SyncLogEntry,
  IntegrationProvider,
} from '@/types/integration';

// Currently connected integrations
export const mockIntegrations: Integration[] = [
  {
    id: 'int-001',
    provider: 'google_drive',
    providerName: 'Google Drive',
    category: 'file_storage',
    status: 'healthy',
    connectedAt: '2024-10-15T09:00:00Z',
    connectedBy: 'advisor@example.com',
    lastSyncAt: '2024-12-15T08:30:00Z',
    nextSyncAt: '2024-12-15T09:30:00Z',
    recordsSynced: 1247,
    syncFrequency: 'hourly',
    scope: ['read', 'write'],
    metadata: {
      folderPath: '/Clients',
      accountEmail: 'advisor@gmail.com',
    },
  },
  {
    id: 'int-002',
    provider: 'gmail',
    providerName: 'Gmail',
    category: 'email',
    status: 'healthy',
    connectedAt: '2024-10-15T09:15:00Z',
    connectedBy: 'advisor@example.com',
    lastSyncAt: '2024-12-15T08:45:00Z',
    nextSyncAt: '2024-12-15T08:50:00Z',
    recordsSynced: 8934,
    syncFrequency: 'realtime',
    scope: ['read', 'send'],
    metadata: {
      accountEmail: 'advisor@gmail.com',
      labelsTracked: ['Clients', 'Important', 'Inbox'],
    },
  },
  {
    id: 'int-003',
    provider: 'google_calendar',
    providerName: 'Google Calendar',
    category: 'calendar',
    status: 'healthy',
    connectedAt: '2024-10-15T09:20:00Z',
    connectedBy: 'advisor@example.com',
    lastSyncAt: '2024-12-15T08:40:00Z',
    nextSyncAt: '2024-12-15T08:45:00Z',
    recordsSynced: 342,
    syncFrequency: 'realtime',
    scope: ['read', 'write'],
    metadata: {
      accountEmail: 'advisor@gmail.com',
      calendarsTracked: ['Primary', 'Client Meetings'],
    },
  },
  {
    id: 'int-004',
    provider: 'onedrive',
    providerName: 'OneDrive',
    category: 'file_storage',
    status: 'warning',
    connectedAt: '2024-11-01T14:00:00Z',
    connectedBy: 'advisor@example.com',
    lastSyncAt: '2024-12-15T06:00:00Z',
    nextSyncAt: '2024-12-15T12:00:00Z',
    recordsSynced: 523,
    warningMessage: 'Rate limited - syncing slower than usual',
    syncFrequency: 'hourly',
    scope: ['read'],
    metadata: {
      folderPath: '/Documents/Client Files',
      accountEmail: 'advisor@company.com',
    },
  },
  {
    id: 'int-005',
    provider: 'outlook',
    providerName: 'Outlook',
    category: 'email',
    status: 'error',
    connectedAt: '2024-11-15T10:00:00Z',
    connectedBy: 'advisor@example.com',
    lastSyncAt: '2024-12-14T16:00:00Z',
    recordsSynced: 1205,
    errorMessage: 'Authentication expired - please re-authenticate',
    syncFrequency: 'hourly',
    scope: ['read'],
    metadata: {
      accountEmail: 'advisor@company.com',
    },
  },
  {
    id: 'int-006',
    provider: 'dropbox',
    providerName: 'Dropbox',
    category: 'file_storage',
    status: 'syncing',
    connectedAt: '2024-12-01T08:00:00Z',
    connectedBy: 'advisor@example.com',
    lastSyncAt: '2024-12-15T08:00:00Z',
    recordsSynced: 156,
    syncFrequency: 'daily',
    scope: ['read', 'write'],
    metadata: {
      folderPath: '/Client Documents',
      accountEmail: 'advisor@dropbox.com',
    },
  },
];

// Available integrations that can be connected
export const availableIntegrations: AvailableIntegration[] = [
  // File Storage
  {
    provider: 'google_drive',
    name: 'Google Drive',
    description: 'Sync client documents from Google Drive folders',
    category: 'file_storage',
    icon: 'FolderOpen',
    features: [
      'Automatic document sync',
      'Two-way sync support',
      'Folder selection',
      'Version history',
    ],
    isPopular: true,
  },
  {
    provider: 'onedrive',
    name: 'OneDrive',
    description: 'Connect Microsoft OneDrive for document management',
    category: 'file_storage',
    icon: 'Cloud',
    features: [
      'SharePoint integration',
      'Office document support',
      'Team folders',
    ],
    isPopular: true,
  },
  {
    provider: 'dropbox',
    name: 'Dropbox',
    description: 'Sync files from your Dropbox account',
    category: 'file_storage',
    icon: 'Box',
    features: [
      'Smart sync',
      'Shared folders',
      'Paper documents',
    ],
  },
  {
    provider: 'icloud_drive',
    name: 'iCloud Drive',
    description: 'Connect Apple iCloud Drive for file access',
    category: 'file_storage',
    icon: 'CloudRain',
    features: [
      'Apple ecosystem integration',
      'Desktop sync',
      'Document access',
    ],
  },
  // Email
  {
    provider: 'gmail',
    name: 'Gmail',
    description: 'Sync emails and attachments from Gmail',
    category: 'email',
    icon: 'Mail',
    features: [
      'Email thread tracking',
      'Attachment extraction',
      'Label-based filtering',
      'Real-time sync',
    ],
    isPopular: true,
  },
  {
    provider: 'outlook',
    name: 'Outlook / Exchange',
    description: 'Connect Microsoft Outlook or Exchange email',
    category: 'email',
    icon: 'Mail',
    features: [
      'Exchange support',
      'Calendar integration',
      'Contact sync',
    ],
    isPopular: true,
  },
  // Calendar
  {
    provider: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync meetings and appointments from Google Calendar',
    category: 'calendar',
    icon: 'Calendar',
    features: [
      'Meeting sync',
      'Attendee tracking',
      'Event reminders',
      'Multiple calendars',
    ],
    isPopular: true,
  },
  {
    provider: 'outlook_calendar',
    name: 'Outlook Calendar',
    description: 'Connect your Outlook calendar for scheduling',
    category: 'calendar',
    icon: 'Calendar',
    features: [
      'Meeting rooms',
      'Teams integration',
      'Recurring events',
    ],
  },
  {
    provider: 'icloud_calendar',
    name: 'iCloud Calendar',
    description: 'Sync your Apple iCloud calendar',
    category: 'calendar',
    icon: 'Calendar',
    features: [
      'Apple device sync',
      'Shared calendars',
      'Location-based alerts',
    ],
  },
];

// Sync log history
export const mockSyncLogs: SyncLogEntry[] = [
  {
    id: 'log-001',
    integrationId: 'int-001',
    timestamp: '2024-12-15T08:30:00Z',
    status: 'success',
    recordsProcessed: 45,
    recordsCreated: 3,
    recordsUpdated: 12,
    recordsSkipped: 30,
    duration: 12500,
  },
  {
    id: 'log-002',
    integrationId: 'int-002',
    timestamp: '2024-12-15T08:45:00Z',
    status: 'success',
    recordsProcessed: 127,
    recordsCreated: 15,
    recordsUpdated: 8,
    recordsSkipped: 104,
    duration: 8300,
  },
  {
    id: 'log-003',
    integrationId: 'int-003',
    timestamp: '2024-12-15T08:40:00Z',
    status: 'success',
    recordsProcessed: 12,
    recordsCreated: 2,
    recordsUpdated: 1,
    recordsSkipped: 9,
    duration: 2100,
  },
  {
    id: 'log-004',
    integrationId: 'int-004',
    timestamp: '2024-12-15T06:00:00Z',
    status: 'partial',
    recordsProcessed: 100,
    recordsCreated: 5,
    recordsUpdated: 10,
    recordsSkipped: 85,
    duration: 45000,
    errors: [
      {
        code: 'RATE_LIMITED',
        message: 'API rate limit reached, will retry later',
        recoverable: true,
      },
    ],
  },
  {
    id: 'log-005',
    integrationId: 'int-005',
    timestamp: '2024-12-14T16:00:00Z',
    status: 'failed',
    recordsProcessed: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    duration: 1500,
    errors: [
      {
        code: 'AUTH_EXPIRED',
        message: 'OAuth token has expired',
        recoverable: true,
      },
    ],
  },
  {
    id: 'log-006',
    integrationId: 'int-006',
    timestamp: '2024-12-15T08:00:00Z',
    status: 'success',
    recordsProcessed: 28,
    recordsCreated: 8,
    recordsUpdated: 5,
    recordsSkipped: 15,
    duration: 18200,
  },
];

// Helper to check if a provider is already connected
export function isProviderConnected(provider: IntegrationProvider): boolean {
  return mockIntegrations.some(
    (int) => int.provider === provider && int.status !== 'disconnected'
  );
}

// Helper to get integrations by category
export function getIntegrationsByCategory(category: string): Integration[] {
  return mockIntegrations.filter((int) => int.category === category);
}

// Helper to get available integrations not yet connected
export function getUnconnectedIntegrations(): AvailableIntegration[] {
  return availableIntegrations.filter(
    (available) => !isProviderConnected(available.provider)
  );
}
