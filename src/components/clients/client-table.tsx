'use client';

import React from 'react';
import Link from 'next/link';
import type { Client } from '@/types/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientTableProps {
  clients: Client[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getRiskBadgeVariant = (risk: string) => {
  switch (risk) {
    case 'conservative':
      return 'secondary';
    case 'moderate':
      return 'default';
    case 'aggressive':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface SortButtonProps {
  field: string;
  currentSortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  children: React.ReactNode;
}

function SortButton({ field, currentSortField, sortDirection, onSort, children }: SortButtonProps) {
  const isActive = field === currentSortField;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2 font-medium justify-start"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown
        className={cn(
          'ml-1 h-3 w-3 transition-transform',
          isActive ? 'opacity-100' : 'opacity-40',
          isActive && sortDirection === 'desc' && 'rotate-180'
        )}
      />
    </Button>
  );
}

export function ClientTable({
  clients,
  sortField,
  sortDirection,
  onSort,
}: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No clients found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-4 py-3 bg-muted/50 border-b text-sm font-medium">
        <SortButton field="name" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>Client</SortButton>
        <SortButton field="portfolioValue" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>Portfolio Value</SortButton>
        <SortButton field="riskProfile" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>Risk Profile</SortButton>
        <SortButton field="lastContact" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>Last Contact</SortButton>
        <SortButton field="nextMeeting" currentSortField={sortField} sortDirection={sortDirection} onSort={onSort}>Next Meeting</SortButton>
        <div />
      </div>

      {/* Rows */}
      <div className="divide-y">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="block hover:bg-muted/50 transition-colors"
          >
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-4 py-4 items-center">
              {/* Client Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{client.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfolio Value */}
              <div className="hidden md:block">
                <p className="font-medium">{formatCurrency(client.portfolioValue)}</p>
                <p className="text-xs text-muted-foreground">{client.accountType}</p>
              </div>

              {/* Risk Profile */}
              <div className="hidden md:block">
                <Badge variant={getRiskBadgeVariant(client.riskProfile)}>
                  {client.riskProfile}
                </Badge>
              </div>

              {/* Last Contact */}
              <div className="hidden md:block text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}
              </div>

              {/* Next Meeting */}
              <div className="hidden md:block">
                {client.nextMeeting ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(client.nextMeeting).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-end">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Mobile: Additional info */}
              <div className="md:hidden flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(client.portfolioValue)}</span>
                  <Badge variant={getRiskBadgeVariant(client.riskProfile)} className="text-xs">
                    {client.riskProfile}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
