/**
 * Policy Types - Matches backend schema
 */

export type PolicyStatus = 'Active' | 'Pending' | 'Lapsed' | 'Cancelled' | 'Matured' | 'Claim';
export type PremiumFrequency = 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually';
export type PaymentStatus = 'Current' | 'Overdue' | 'Paid' | 'Pending';

export interface FundAllocation {
  fund_code: string;
  fund_name: string;
  allocation_percentage: number;
  units?: number;
  unit_value?: number;
}

export interface Claim {
  claim_id: string;
  claim_date: string;
  claim_type: string;
  claim_amount: number;
  status: string;
  resolution_date?: string;
}

export interface Beneficiary {
  name: string;
  relationship: string;
  percentage: number;
  designation: 'Primary' | 'Contingent';
  is_irrevocable?: boolean;
}

export interface PolicyDocument {
  document_id: string;
  document_type: string;
  document_name: string;
  upload_date: string;
  url?: string;
}

export interface Policy {
  // Identification
  policy_id: string;
  policy_number: string;
  client_id: string;
  advisor_id?: string;

  // Product Details
  policy_type: string;
  policy_category?: string;
  policy_status: PolicyStatus;
  policy_version?: number;
  parent_policy_id?: string;
  product_name?: string;
  product_code?: string;
  carrier_name?: string;
  carrier_code?: string;

  // Coverage Details
  coverage_start_date?: string;
  coverage_end_date?: string;
  coverage_amount: number;
  coverage_description?: string;
  coverage_limits?: string;
  exclusions?: string;
  death_benefit?: number;
  cash_value?: number;
  face_amount?: number;

  // Premium & Payment
  premium_amount?: number;
  premium_frequency?: PremiumFrequency;
  billing_cycle?: string;
  payment_method?: string;
  last_payment_date?: string;
  next_payment_due_date?: string;
  payment_status?: PaymentStatus;
  auto_pay_enabled?: boolean;

  // Lifecycle Events
  issue_date?: string;
  effective_date?: string;
  renewal_date?: string;
  cancellation_date?: string;
  cancellation_reason?: string;
  lapse_date?: string;
  reinstatement_date?: string;
  maturity_date?: string;
  expiry_date?: string;

  // Claims
  claims_count?: number;
  open_claims_count?: number;
  total_claims_amount?: number;
  last_claim_date?: string;
  claims_history_reference?: string;
  claims_history?: Claim[];

  // Investment (for investment products)
  fund_allocations?: FundAllocation[];
  account_value?: number;
  book_value?: number;
  market_value?: number;

  // Beneficiaries
  beneficiaries?: Beneficiary[];
  percentage_allocation?: string;

  // Documents
  policy_documents?: PolicyDocument[];
  endorsements?: string;
  correspondences?: string;

  // Notes
  agent_notes?: string;
  internal_notes?: string;
  customer_visible_notes?: string;
  tags?: string[];
  notes?: string;

  // Audit
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string;
  record_version?: number;
}

export interface PolicySummary {
  policy_id: string;
  policy_number: string;
  client_id: string;
  policy_type: string;
  product_name?: string;
  carrier_name?: string;
  policy_status: PolicyStatus;
  coverage_amount?: number;
  premium_amount?: number;
  premium_frequency?: PremiumFrequency;
  renewal_date?: string;
  payment_status?: PaymentStatus;
}

export interface PolicyFilters {
  client_id?: string;
  policy_type?: string;
  policy_status?: PolicyStatus;
  payment_status?: PaymentStatus;
  renewal_due?: boolean;
}
