/**
 * Client Types - Matches backend schema
 */

export type ClientStatus = 'Active' | 'Inactive' | 'Prospect' | 'Dormant';
export type ClientSegment = 'High Net Worth' | 'Mass Affluent' | 'Retail';
export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive' | 'conservative' | 'moderate' | 'aggressive';

export interface Client {
  // Identification
  client_id: string;
  client_type?: string;
  client_status?: ClientStatus;
  external_client_reference?: string;

  // Personal Information
  first_name: string;
  middle_name?: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth?: string;
  gender?: string;
  sin_last4?: string;
  marital_status?: string;
  occupation?: string;
  employer_name?: string;

  // Contact Information
  primary_email?: string;
  secondary_email?: string;
  primary_phone?: string;
  secondary_phone?: string;
  preferred_contact_method?: string;
  preferred_contact_time?: string;
  language_preference?: string;

  // Address
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  address_type?: string;
  is_primary_address?: boolean;

  // Relationship Metadata
  account_manager_id?: string;
  client_segment?: ClientSegment;
  onboarding_date?: string;
  offboarding_date?: string;
  referral_source?: string;
  relationship_start_date?: string;
  relationship_end_date?: string;

  // Financial (computed/additional)
  portfolio_value?: number;
  total_assets?: number;
  risk_profile?: RiskProfile;

  // Compliance
  kyc_status?: string;
  kyc_completed_date?: string;
  consent_marketing?: boolean;
  consent_data_processing?: boolean;
  consent_timestamp?: string;
  privacy_policy_version_accepted?: string;

  // Notes
  internal_notes?: string;
  client_tags?: string[];
  last_interaction_summary?: string;

  // Scheduling
  next_meeting?: string;
  last_contact?: string;

  // Audit
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string;
  record_version?: number;
}

export interface ClientSummary {
  client_id: string;
  first_name: string;
  last_name: string;
  primary_email?: string;
  primary_phone?: string;
  client_status?: ClientStatus;
  client_segment?: ClientSegment;
  portfolio_value?: number;
  policy_count?: number;
  risk_profile?: RiskProfile;
  next_meeting?: string;
  account_manager_id?: string;
}

export interface ClientFilters {
  name?: string;
  client_status?: ClientStatus;
  client_segment?: ClientSegment;
  client_type?: string;
  risk_profile?: RiskProfile;
  account_manager_id?: string;
}

/**
 * Helper to get full name from client
 */
export function getClientFullName(client: Client | ClientSummary): string {
  return `${client.first_name} ${client.last_name}`.trim();
}
