/**
 * Clients Service - Handles client API interactions
 */

import { apiGet, buildQueryString } from '@/lib/api-client';
import type { Client, ClientSummary, ClientFilters } from '@/types/client';

/**
 * List all clients with optional filters
 */
export async function listClients(filters?: ClientFilters): Promise<ClientSummary[]> {
  const query = filters ? buildQueryString({
    name: filters.name,
    status: filters.client_status,
    segment: filters.client_segment,
    type: filters.client_type,
  }) : '';

  const response = await apiGet<{ clients: ClientSummary[] }>(`/api/clients${query}`);
  return response.data?.clients || [];
}

/**
 * Get a single client by ID
 */
export async function getClient(clientId: string): Promise<Client | null> {
  const response = await apiGet<{ client: Client }>(`/api/clients/${clientId}`);
  return response.data?.client || null;
}

/**
 * Search clients by name
 */
export async function searchClients(name: string): Promise<ClientSummary[]> {
  return listClients({ name });
}
