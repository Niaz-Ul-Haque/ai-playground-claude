'use client';

import React, { useState, useMemo } from 'react';
import { ClientTable, ClientFiltersComponent, ClientStats } from '@/components/clients';
import { searchClients, getClientStats, type ClientFilters } from '@/lib/mock-data';

type SortField = 'name' | 'portfolioValue' | 'riskProfile' | 'lastContact' | 'nextMeeting';
type SortDirection = 'asc' | 'desc';

export default function ClientsPage() {
  const [filters, setFilters] = useState<ClientFilters>({});
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const stats = useMemo(() => getClientStats(), []);

  const clients = useMemo(() => {
    const filtered = searchClients(filters);

    // Sort clients
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'portfolioValue':
          comparison = a.portfolioValue - b.portfolioValue;
          break;
        case 'riskProfile': {
          const riskOrder = { conservative: 0, moderate: 1, aggressive: 2 };
          comparison = riskOrder[a.riskProfile] - riskOrder[b.riskProfile];
          break;
        }
        case 'lastContact':
          comparison = new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
          break;
        case 'nextMeeting':
          if (!a.nextMeeting && !b.nextMeeting) comparison = 0;
          else if (!a.nextMeeting) comparison = 1;
          else if (!b.nextMeeting) comparison = -1;
          else comparison = new Date(a.nextMeeting).getTime() - new Date(b.nextMeeting).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filters, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as SortField);
      setSortDirection('asc');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/50 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Clients</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view all your client relationships
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <ClientStats stats={stats} />

        {/* Filters */}
        <ClientFiltersComponent filters={filters} onFiltersChange={setFilters} />

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {clients.length} client{clients.length !== 1 ? 's' : ''}
        </div>

        {/* Table */}
        <ClientTable
          clients={clients}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
