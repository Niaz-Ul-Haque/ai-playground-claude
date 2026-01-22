/**
 * Policies Service - Handles policy API interactions
 */

import { apiGet, buildQueryString } from '@/lib/api-client';
import type { Policy, PolicySummary, PolicyFilters } from '@/types/policy';

/**
 * List all policies with optional filters
 */
export async function listPolicies(filters?: PolicyFilters): Promise<PolicySummary[]> {
  const query = filters ? buildQueryString({
    client_id: filters.client_id,
    status: filters.policy_status,
    type: filters.policy_type,
    payment_status: filters.payment_status,
  }) : '';

  const response = await apiGet<{ policies: PolicySummary[] }>(`/api/policies${query}`);
  return response.data?.policies || [];
}

/**
 * Get a single policy by ID
 */
export async function getPolicy(policyId: string): Promise<Policy | null> {
  const response = await apiGet<{ policy: Policy }>(`/api/policies/${policyId}`);
  return response.data?.policy || null;
}

/**
 * Get policies for a specific client
 */
export async function getPoliciesForClient(clientId: string): Promise<PolicySummary[]> {
  return listPolicies({ client_id: clientId });
}
