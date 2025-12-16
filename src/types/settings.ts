/**
 * Settings Types
 * Type definitions for Settings & Preferences
 */

// ============================================================================
// Profile Settings Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  bio?: string;
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Security Settings Types
// ============================================================================

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  passwordLastChanged?: string;
  activeSessions: ActiveSession[];
  loginHistory: LoginHistoryEntry[];
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location?: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  location?: string;
  ipAddress: string;
  status: 'success' | 'failed';
  failReason?: string;
}

// ============================================================================
// Notification Settings Types
// ============================================================================

export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms';

export interface NotificationPreference {
  id: string;
  category: NotificationCategory;
  label: string;
  description: string;
  channels: NotificationChannelSettings;
  enabled: boolean;
}

export interface NotificationChannelSettings {
  email: boolean;
  push: boolean;
  in_app: boolean;
  sms: boolean;
}

export type NotificationCategory =
  | 'tasks'
  | 'opportunities'
  | 'clients'
  | 'automations'
  | 'integrations'
  | 'reports'
  | 'system';

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  tasks: 'Tasks',
  opportunities: 'Opportunities',
  clients: 'Clients',
  automations: 'Automations',
  integrations: 'Integrations',
  reports: 'Reports',
  system: 'System',
};

export interface NotificationSettings {
  preferences: NotificationPreference[];
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursDays?: string[];
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  digestTime?: string;
}

// ============================================================================
// Preference Settings Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'AUD';

export interface PreferenceSettings {
  theme: Theme;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  currency: Currency;
  language: string;
  startOfWeek: 'sunday' | 'monday';
  defaultView: 'chat' | 'dashboard' | 'tasks';
  sidebarCollapsed: boolean;
  showCompletedTasks: boolean;
  taskSortOrder: 'due_date' | 'priority' | 'created';
  clientSortOrder: 'name' | 'value' | 'last_contact';
  enableAnimations: boolean;
  compactMode: boolean;
  // Navigation visibility
  visibleNavItems: {
    chat: boolean;
    clients: boolean;
    opportunities: boolean;
    tasks: boolean;
    sources: boolean;
    automations: boolean;
  };
}

export const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export const DATE_FORMAT_LABELS: Record<DateFormat, string> = {
  'MM/DD/YYYY': 'MM/DD/YYYY (US)',
  'DD/MM/YYYY': 'DD/MM/YYYY (UK)',
  'YYYY-MM-DD': 'YYYY-MM-DD (ISO)',
};

export const TIME_FORMAT_LABELS: Record<TimeFormat, string> = {
  '12h': '12-hour (AM/PM)',
  '24h': '24-hour',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'USD ($)',
  CAD: 'CAD ($)',
  EUR: 'EUR (\u20AC)',
  GBP: 'GBP (\u00A3)',
  AUD: 'AUD ($)',
};

// ============================================================================
// Products & Markets Types (for market-based opportunities)
// ============================================================================

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  targetSegments: string[];
  minInvestment?: number;
  maxInvestment?: number;
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'investments'
  | 'insurance'
  | 'banking'
  | 'lending'
  | 'retirement'
  | 'estate_planning';

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  investments: 'Investments',
  insurance: 'Insurance',
  banking: 'Banking',
  lending: 'Lending',
  retirement: 'Retirement',
  estate_planning: 'Estate Planning',
};

export interface MarketCondition {
  id: string;
  name: string;
  description: string;
  triggerType: 'manual' | 'automatic';
  criteria?: MarketCriteria[];
  relatedProducts: string[];
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
}

export interface MarketCriteria {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains';
  value: string | number;
}

export interface ProductSettings {
  products: Product[];
  marketConditions: MarketCondition[];
  autoDetectMarketChanges: boolean;
  notifyOnNewOpportunities: boolean;
}

// ============================================================================
// Team Settings Types
// ============================================================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: TeamRole;
  status: 'active' | 'invited' | 'suspended';
  joinedAt?: string;
  invitedAt: string;
  lastActive?: string;
}

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

export interface TeamSettings {
  teamName: string;
  teamId: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  defaultRole: TeamRole;
  allowMemberInvites: boolean;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

// ============================================================================
// Billing Settings Types
// ============================================================================

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface BillingSettings {
  plan: PlanTier;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  billingHistory: BillingHistoryEntry[];
  usage: UsageMetrics;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'invoice';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BillingHistoryEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

export interface UsageMetrics {
  clients: { used: number; limit: number };
  integrations: { used: number; limit: number };
  automations: { used: number; limit: number };
  storage: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
}

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

// ============================================================================
// Combined Settings State
// ============================================================================

export interface AllSettings {
  profile: UserProfile;
  security: SecuritySettings;
  notifications: NotificationSettings;
  preferences: PreferenceSettings;
  products: ProductSettings;
  team: TeamSettings;
  billing: BillingSettings;
}

export type SettingsSection =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'preferences'
  | 'products'
  | 'team'
  | 'billing';

export const SETTINGS_SECTION_LABELS: Record<SettingsSection, string> = {
  profile: 'Profile',
  security: 'Security',
  notifications: 'Notifications',
  preferences: 'Preferences',
  products: 'Products & Markets',
  team: 'Team',
  billing: 'Billing',
};
