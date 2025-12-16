/**
 * Mock Settings Data
 * Sample data for Settings & Preferences
 */

import type {
  UserProfile,
  SecuritySettings,
  NotificationSettings,
  PreferenceSettings,
  ProductSettings,
  TeamSettings,
  BillingSettings,
  AllSettings,
} from '@/types/settings';

// ============================================================================
// User Profile
// ============================================================================

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  email: 'advisor@example.com',
  firstName: 'Sarah',
  lastName: 'Mitchell',
  displayName: 'Sarah Mitchell',
  avatarUrl: undefined,
  phone: '+1 (416) 555-0123',
  jobTitle: 'Senior Financial Advisor',
  company: 'Mitchell Financial Services',
  bio: 'Helping clients achieve their financial goals for over 15 years. Specializing in retirement planning and wealth management.',
  timezone: 'America/Toronto',
  locale: 'en-CA',
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};

// ============================================================================
// Security Settings
// ============================================================================

export const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  twoFactorMethod: 'app',
  passwordLastChanged: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
  activeSessions: [
    {
      id: 'session-1',
      device: 'Windows PC',
      browser: 'Chrome 120',
      location: 'Toronto, ON',
      ipAddress: '192.168.1.100',
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: 'session-2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'Toronto, ON',
      ipAddress: '192.168.1.101',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      isCurrent: false,
    },
    {
      id: 'session-3',
      device: 'MacBook Pro',
      browser: 'Safari 17',
      location: 'Mississauga, ON',
      ipAddress: '192.168.2.50',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      isCurrent: false,
    },
  ],
  loginHistory: [
    {
      id: 'login-1',
      timestamp: new Date().toISOString(),
      device: 'Windows PC',
      browser: 'Chrome 120',
      location: 'Toronto, ON',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: 'login-2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'Toronto, ON',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: 'login-3',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      device: 'Unknown',
      browser: 'Unknown',
      location: 'Montreal, QC',
      ipAddress: '203.0.113.50',
      status: 'failed',
      failReason: 'Invalid password',
    },
    {
      id: 'login-4',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      device: 'MacBook Pro',
      browser: 'Safari 17',
      location: 'Mississauga, ON',
      ipAddress: '192.168.2.50',
      status: 'success',
    },
    {
      id: 'login-5',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      device: 'Windows PC',
      browser: 'Chrome 119',
      location: 'Toronto, ON',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
  ],
};

// ============================================================================
// Notification Settings
// ============================================================================

export const mockNotificationSettings: NotificationSettings = {
  preferences: [
    {
      id: 'notif-1',
      category: 'tasks',
      label: 'Task Reminders',
      description: 'Get notified about upcoming and overdue tasks',
      channels: { email: true, push: true, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-2',
      category: 'tasks',
      label: 'Task Assignments',
      description: 'Get notified when tasks are assigned to you',
      channels: { email: true, push: true, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-3',
      category: 'opportunities',
      label: 'New Opportunities',
      description: 'Get notified when new opportunities are surfaced',
      channels: { email: true, push: true, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-4',
      category: 'opportunities',
      label: 'Expiring Opportunities',
      description: 'Get notified about opportunities nearing expiry',
      channels: { email: true, push: false, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-5',
      category: 'clients',
      label: 'Client Milestones',
      description: 'Get notified about client birthdays and anniversaries',
      channels: { email: false, push: false, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-6',
      category: 'automations',
      label: 'Automation Alerts',
      description: 'Get notified about automation exceptions and issues',
      channels: { email: true, push: true, in_app: true, sms: true },
      enabled: true,
    },
    {
      id: 'notif-7',
      category: 'automations',
      label: 'Automation Suggestions',
      description: 'Get notified when new automations are suggested',
      channels: { email: false, push: false, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-8',
      category: 'integrations',
      label: 'Integration Status',
      description: 'Get notified about integration sync issues',
      channels: { email: true, push: true, in_app: true, sms: false },
      enabled: true,
    },
    {
      id: 'notif-9',
      category: 'reports',
      label: 'Weekly Summary',
      description: 'Receive a weekly summary of your activity',
      channels: { email: true, push: false, in_app: false, sms: false },
      enabled: true,
    },
    {
      id: 'notif-10',
      category: 'system',
      label: 'Security Alerts',
      description: 'Get notified about security-related events',
      channels: { email: true, push: true, in_app: true, sms: true },
      enabled: true,
    },
  ],
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  quietHoursDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  digestEnabled: true,
  digestFrequency: 'daily',
  digestTime: '08:00',
};

// ============================================================================
// Preference Settings
// ============================================================================

export const mockPreferenceSettings: PreferenceSettings = {
  theme: 'system',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'CAD',
  language: 'en',
  startOfWeek: 'monday',
  defaultView: 'chat',
  sidebarCollapsed: false,
  showCompletedTasks: false,
  taskSortOrder: 'due_date',
  clientSortOrder: 'name',
  enableAnimations: true,
  compactMode: false,
  visibleNavItems: {
    chat: true,
    clients: false,
    opportunities: false,
    tasks: false,
    sources: false,
    automations: false,
    dashboard: false,
    import: false,
    activity: false,
    settings: true,
  },
};

// ============================================================================
// Products & Markets Settings
// ============================================================================

export const mockProductSettings: ProductSettings = {
  products: [
    {
      id: 'prod-1',
      name: 'Managed Portfolio - Conservative',
      category: 'investments',
      description: 'Low-risk diversified portfolio for capital preservation',
      targetSegments: ['retirees', 'risk-averse'],
      minInvestment: 25000,
      riskLevel: 'low',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-06-15T00:00:00Z',
    },
    {
      id: 'prod-2',
      name: 'Managed Portfolio - Growth',
      category: 'investments',
      description: 'Balanced portfolio for long-term capital appreciation',
      targetSegments: ['professionals', 'accumulators'],
      minInvestment: 50000,
      riskLevel: 'medium',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-06-15T00:00:00Z',
    },
    {
      id: 'prod-3',
      name: 'Managed Portfolio - Aggressive',
      category: 'investments',
      description: 'High-growth portfolio for aggressive investors',
      targetSegments: ['high-net-worth', 'young-professionals'],
      minInvestment: 100000,
      riskLevel: 'high',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-06-15T00:00:00Z',
    },
    {
      id: 'prod-4',
      name: 'Term Life Insurance',
      category: 'insurance',
      description: 'Affordable coverage for specific term periods',
      targetSegments: ['families', 'professionals'],
      riskLevel: 'low',
      isActive: true,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'prod-5',
      name: 'Whole Life Insurance',
      category: 'insurance',
      description: 'Permanent coverage with cash value accumulation',
      targetSegments: ['high-net-worth', 'estate-planning'],
      riskLevel: 'low',
      isActive: true,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'prod-6',
      name: 'RRSP Solutions',
      category: 'retirement',
      description: 'Tax-advantaged retirement savings plans',
      targetSegments: ['all'],
      riskLevel: 'medium',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-02-28T00:00:00Z',
    },
    {
      id: 'prod-7',
      name: 'TFSA Solutions',
      category: 'retirement',
      description: 'Tax-free savings accounts',
      targetSegments: ['all'],
      riskLevel: 'medium',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-02-28T00:00:00Z',
    },
    {
      id: 'prod-8',
      name: 'Estate Planning Services',
      category: 'estate_planning',
      description: 'Comprehensive estate and succession planning',
      targetSegments: ['high-net-worth', 'retirees'],
      riskLevel: 'low',
      isActive: true,
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
  ],
  marketConditions: [
    {
      id: 'market-1',
      name: 'RRSP Deadline',
      description: 'Annual RRSP contribution deadline approaching',
      triggerType: 'automatic',
      criteria: [
        { field: 'currentDate', operator: 'gte', value: '2025-01-15' },
        { field: 'currentDate', operator: 'lte', value: '2025-03-01' },
      ],
      relatedProducts: ['prod-6'],
      isActive: true,
      lastTriggered: '2024-01-15T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'market-2',
      name: 'Market Correction',
      description: 'Significant market decline detected',
      triggerType: 'manual',
      relatedProducts: ['prod-1', 'prod-2', 'prod-3'],
      isActive: true,
      createdAt: '2023-06-01T00:00:00Z',
    },
    {
      id: 'market-3',
      name: 'Interest Rate Change',
      description: 'Bank of Canada rate decision impact',
      triggerType: 'manual',
      relatedProducts: ['prod-1', 'prod-6', 'prod-7'],
      isActive: true,
      lastTriggered: '2024-10-23T00:00:00Z',
      createdAt: '2023-06-01T00:00:00Z',
    },
    {
      id: 'market-4',
      name: 'TFSA Limit Increase',
      description: 'Annual TFSA contribution room increase',
      triggerType: 'automatic',
      criteria: [
        { field: 'currentDate', operator: 'gte', value: '2025-01-01' },
        { field: 'currentDate', operator: 'lte', value: '2025-01-31' },
      ],
      relatedProducts: ['prod-7'],
      isActive: true,
      lastTriggered: '2024-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
    },
  ],
  autoDetectMarketChanges: true,
  notifyOnNewOpportunities: true,
};

// ============================================================================
// Team Settings
// ============================================================================

export const mockTeamSettings: TeamSettings = {
  teamName: 'Mitchell Financial Services',
  teamId: 'team-1',
  members: [
    {
      id: 'member-1',
      userId: 'user-1',
      email: 'advisor@example.com',
      name: 'Sarah Mitchell',
      role: 'owner',
      status: 'active',
      joinedAt: '2023-01-15T10:00:00Z',
      invitedAt: '2023-01-15T10:00:00Z',
      lastActive: new Date().toISOString(),
    },
    {
      id: 'member-2',
      userId: 'user-2',
      email: 'assistant@example.com',
      name: 'Michael Chen',
      role: 'admin',
      status: 'active',
      joinedAt: '2023-03-20T14:00:00Z',
      invitedAt: '2023-03-18T10:00:00Z',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'member-3',
      userId: 'user-3',
      email: 'intern@example.com',
      name: 'Emily Wong',
      role: 'member',
      status: 'active',
      joinedAt: '2024-09-05T09:00:00Z',
      invitedAt: '2024-09-01T10:00:00Z',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  invitations: [
    {
      id: 'invite-1',
      email: 'newadvisor@example.com',
      role: 'member',
      invitedBy: 'Sarah Mitchell',
      invitedAt: new Date(Date.now() - 172800000).toISOString(),
      expiresAt: new Date(Date.now() + 432000000).toISOString(),
      status: 'pending',
    },
  ],
  defaultRole: 'member',
  allowMemberInvites: false,
};

// ============================================================================
// Billing Settings
// ============================================================================

export const mockBillingSettings: BillingSettings = {
  plan: 'professional',
  planName: 'Professional',
  billingCycle: 'yearly',
  nextBillingDate: new Date(Date.now() + 7776000000).toISOString(), // 90 days
  amount: 588,
  paymentMethod: {
    id: 'pm-1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
  billingHistory: [
    {
      id: 'bill-1',
      date: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
      description: 'Professional Plan - Annual',
      amount: 588,
      status: 'paid',
      invoiceUrl: '#',
    },
    {
      id: 'bill-2',
      date: new Date(Date.now() - 38880000000).toISOString(), // 450 days ago
      description: 'Professional Plan - Annual',
      amount: 540,
      status: 'paid',
      invoiceUrl: '#',
    },
    {
      id: 'bill-3',
      date: new Date(Date.now() - 70080000000).toISOString(), // 811 days ago
      description: 'Starter Plan - Monthly',
      amount: 29,
      status: 'paid',
      invoiceUrl: '#',
    },
  ],
  usage: {
    clients: { used: 247, limit: 500 },
    integrations: { used: 6, limit: 10 },
    automations: { used: 5, limit: 20 },
    storage: { used: 2.4, limit: 10 }, // GB
    apiCalls: { used: 8500, limit: 50000 },
  },
};

// ============================================================================
// Combined Settings
// ============================================================================

export const mockAllSettings: AllSettings = {
  profile: mockUserProfile,
  security: mockSecuritySettings,
  notifications: mockNotificationSettings,
  preferences: mockPreferenceSettings,
  products: mockProductSettings,
  team: mockTeamSettings,
  billing: mockBillingSettings,
};
