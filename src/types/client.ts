export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  riskProfile: RiskProfile;
  portfolioValue: number; // In CAD
  accountType: string;
  birthDate: string; // ISO string
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  nextMeeting?: string; // ISO string
  lastContact: string; // ISO string
  tags: string[];
  createdAt: string;
  // Extended fields for profile
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  status?: 'active' | 'inactive' | 'prospect';
}

export interface ClientSummary {
  id: string;
  name: string;
  email: string;
  riskProfile: RiskProfile;
  portfolioValue: number;
  nextMeeting?: string;
}

// Relationship types
export type RelationshipType =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'accountant'
  | 'lawyer'
  | 'beneficiary'
  | 'other';

export interface ClientRelationship {
  id: string;
  clientId: string;
  relatedClientId?: string; // If the related person is also a client
  relatedName: string;
  relationshipType: RelationshipType;
  isPrimary?: boolean;
  notes?: string;
}

// Timeline event types
export type TimelineEventType =
  | 'email'
  | 'call'
  | 'meeting'
  | 'note'
  | 'policy_change'
  | 'payment'
  | 'milestone'
  | 'system'
  | 'task_completed';

export interface TimelineEvent {
  id: string;
  clientId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  artifactIds?: string[];
}

// Artifact types
export type ArtifactType =
  | 'document'
  | 'form'
  | 'statement'
  | 'contract'
  | 'id'
  | 'tax_return'
  | 'correspondence'
  | 'other';

export interface ArtifactVersion {
  id: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
  fileSize: number;
}

export interface Artifact {
  id: string;
  clientId: string;
  name: string;
  type: ArtifactType;
  mimeType: string;
  size: number;
  uploadedAt: string;
  versions: ArtifactVersion[];
  tags?: string[];
  description?: string;
}

// Asset/Policy types
export type AssetType =
  | 'rrsp'
  | 'tfsa'
  | 'resp'
  | 'rrif'
  | 'non_registered'
  | 'insurance_life'
  | 'insurance_disability'
  | 'insurance_critical'
  | 'pension'
  | 'property'
  | 'gic';

export type AssetStatus = 'active' | 'pending' | 'closed' | 'lapsed' | 'matured';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertType =
  | 'expiry'
  | 'renewal'
  | 'contribution_room'
  | 'rebalance'
  | 'action_needed'
  | 'review_due'
  | 'birthday'
  | 'anniversary';

export interface AssetAlert {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  dueDate?: string;
}

export interface ClientAsset {
  id: string;
  clientId: string;
  type: AssetType;
  name: string;
  accountNumber?: string;
  institution?: string;
  value: number;
  status: AssetStatus;
  startDate: string;
  renewalDate?: string;
  expiryDate?: string;
  maturityDate?: string;
  beneficiary?: string;
  alerts?: AssetAlert[];
  notes?: string;
}

// Extended client with all related data
export interface ClientWithDetails extends Client {
  relationships: ClientRelationship[];
  timeline: TimelineEvent[];
  artifacts: Artifact[];
  assets: ClientAsset[];
  alerts: AssetAlert[];
}
