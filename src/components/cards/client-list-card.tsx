'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Mail,
  TrendingUp,
  LayoutGrid,
  Table,
  List,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Search,
  GitCompare,
  X,
  Phone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { ClientListCardData } from '@/types/chat';
import type { Client } from '@/types/client';
import { getClientFullName } from '@/types/client';
import { formatCurrency, getInitials } from '@/lib/utils/format';

interface ClientListCardProps {
  data: ClientListCardData;
}

type ViewMode = 'cards' | 'table' | 'compact';
type SortOption = 'name' | 'portfolio_value' | 'segment' | 'status';

export function ClientListCard({ data }: ClientListCardProps) {
  const { title, clients } = data;

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [segmentFilter, setSegmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [compareClients, setCompareClients] = useState<Set<string>>(new Set());

  // Get unique segments and statuses
  const uniqueSegments = [...new Set(clients.map(c => c.client_segment).filter(Boolean))];
  const uniqueStatuses = [...new Set(clients.map(c => c.client_status).filter(Boolean))];

  // Filtering
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const fullName = getClientFullName(client);
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          fullName.toLowerCase().includes(query) ||
          client.primary_email?.toLowerCase().includes(query) ||
          client.client_segment?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (segmentFilter.length > 0 && client.client_segment && !segmentFilter.includes(client.client_segment)) {
        return false;
      }

      if (statusFilter.length > 0 && client.client_status && !statusFilter.includes(client.client_status)) {
        return false;
      }

      return true;
    });
  }, [clients, searchQuery, segmentFilter, statusFilter]);

  // Sorting
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = getClientFullName(a).localeCompare(getClientFullName(b));
          break;
        case 'portfolio_value':
          comparison = (a.portfolio_value || 0) - (b.portfolio_value || 0);
          break;
        case 'segment':
          comparison = (a.client_segment || '').localeCompare(b.client_segment || '');
          break;
        case 'status':
          comparison = (a.client_status || '').localeCompare(b.client_status || '');
          break;
      }

      return sortAsc ? comparison : -comparison;
    });
  }, [filteredClients, sortBy, sortAsc]);

  // Totals
  const totalPortfolio = useMemo(() => {
    return filteredClients.reduce((sum, c) => sum + (c.portfolio_value || 0), 0);
  }, [filteredClients]);

  const toggleCompare = (clientId: string) => {
    const newCompare = new Set(compareClients);
    if (newCompare.has(clientId)) {
      newCompare.delete(clientId);
    } else if (newCompare.size < 3) {
      newCompare.add(clientId);
    }
    setCompareClients(newCompare);
  };

  const comparedClients = useMemo(() => {
    return clients.filter(c => compareClients.has(c.client_id));
  }, [clients, compareClients]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Prospect':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dormant':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderClientCard = (client: Client) => {
    const fullName = getClientFullName(client);
    const isComparing = compareClients.has(client.client_id);

    return (
      <div
        key={client.client_id}
        className={`flex items-start justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
          isComparing ? 'ring-2 ring-primary/50 bg-primary/5' : ''
        }`}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-medium text-sm">{fullName}</p>
              {client.client_status && (
                <Badge variant="outline" className={getStatusColor(client.client_status)}>
                  {client.client_status}
                </Badge>
              )}
              {client.client_segment && (
                <Badge variant="secondary" className="text-xs">
                  {client.client_segment}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {client.primary_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{client.primary_email}</span>
                </div>
              )}
              {client.portfolio_value && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{formatCurrency(client.portfolio_value)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button
          variant={isComparing ? 'default' : 'ghost'}
          size="sm"
          className="h-8"
          onClick={() => toggleCompare(client.client_id)}
          disabled={compareClients.size >= 3 && !isComparing}
        >
          <GitCompare className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 font-medium">Client</th>
            <th className="text-left py-2 px-2 font-medium">Status</th>
            <th className="text-left py-2 px-2 font-medium">Segment</th>
            <th className="text-left py-2 px-2 font-medium">Email</th>
            <th className="text-right py-2 px-2 font-medium">Portfolio</th>
            <th className="py-2 px-2"></th>
          </tr>
        </thead>
        <tbody>
          {sortedClients.map(client => {
            const fullName = getClientFullName(client);
            const isComparing = compareClients.has(client.client_id);
            return (
              <tr key={client.client_id} className={`border-b hover:bg-accent/50 ${isComparing ? 'bg-primary/5' : ''}`}>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fullName}</span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  {client.client_status && (
                    <Badge variant="outline" className={`text-xs ${getStatusColor(client.client_status)}`}>
                      {client.client_status}
                    </Badge>
                  )}
                </td>
                <td className="py-2 px-2 text-muted-foreground">{client.client_segment || '-'}</td>
                <td className="py-2 px-2 text-muted-foreground">{client.primary_email || '-'}</td>
                <td className="py-2 px-2 text-right font-medium">
                  {client.portfolio_value ? formatCurrency(client.portfolio_value) : '-'}
                </td>
                <td className="py-2 px-2">
                  <Button
                    variant={isComparing ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleCompare(client.client_id)}
                    disabled={compareClients.size >= 3 && !isComparing}
                  >
                    <GitCompare className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50">
            <td colSpan={4} className="py-2 px-2 font-medium">Total ({filteredClients.length} clients)</td>
            <td className="py-2 px-2 text-right font-bold">{formatCurrency(totalPortfolio)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderCompactView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {sortedClients.map(client => {
        const fullName = getClientFullName(client);
        const isComparing = compareClients.has(client.client_id);
        return (
          <div
            key={client.client_id}
            className={`p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
              isComparing ? 'ring-2 ring-primary/50 bg-primary/5' : ''
            }`}
            onClick={() => toggleCompare(client.client_id)}
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">{fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {client.portfolio_value ? formatCurrency(client.portfolio_value) : '-'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderComparisonPanel = () => (
    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <GitCompare className="h-4 w-4" />
          Comparison ({comparedClients.length}/3)
        </h4>
        <Button variant="ghost" size="sm" className="h-7" onClick={() => setCompareClients(new Set())}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparedClients.map(client => {
          const fullName = getClientFullName(client);
          return (
            <div key={client.client_id} className="p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{fullName}</p>
                  {client.client_segment && (
                    <Badge variant="secondary" className="text-xs mt-0.5">{client.client_segment}</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{client.client_status || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Portfolio</span>
                  <span className="font-medium">{client.portfolio_value ? formatCurrency(client.portfolio_value) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policies</span>
                  <span className="font-medium">{client.policy_count || 0}</span>
                </div>
                {client.primary_email && (
                  <div className="flex items-center gap-1 pt-2 border-t">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{client.primary_email}</span>
                  </div>
                )}
                {client.primary_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{client.primary_phone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title || 'Clients'}</CardTitle>
          <Badge variant="outline">{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}</Badge>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-r-none"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-none border-x"
              onClick={() => setViewMode('table')}
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-l-none"
              onClick={() => setViewMode('compact')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(segmentFilter.length > 0 || statusFilter.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1">
                    {segmentFilter.length + statusFilter.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Segment</DropdownMenuLabel>
              {uniqueSegments.map(segment => (
                <DropdownMenuCheckboxItem
                  key={segment}
                  checked={segmentFilter.includes(segment!)}
                  onCheckedChange={() => {
                    setSegmentFilter(prev =>
                      prev.includes(segment!)
                        ? prev.filter(s => s !== segment)
                        : [...prev, segment!]
                    );
                  }}
                >
                  {segment}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {uniqueStatuses.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status!)}
                  onCheckedChange={() => {
                    setStatusFilter(prev =>
                      prev.includes(status!)
                        ? prev.filter(s => s !== status)
                        : [...prev, status!]
                    );
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              {(segmentFilter.length > 0 || statusFilter.length > 0) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSegmentFilter([]); setStatusFilter([]); }}>
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSortBy('name'); setSortAsc(true); }}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('name'); setSortAsc(false); }}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy('portfolio_value'); setSortAsc(false); }}>
                Portfolio (Highest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('portfolio_value'); setSortAsc(true); }}>
                Portfolio (Lowest)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy('segment'); setSortAsc(true); }}>
                Segment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('status'); setSortAsc(true); }}>
                Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'cards' && (
          <div className="space-y-3">
            {sortedClients.map(renderClientCard)}
          </div>
        )}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'compact' && renderCompactView()}

        {filteredClients.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery || segmentFilter.length > 0 || statusFilter.length > 0
              ? 'No clients match your filters'
              : 'No clients'}
          </p>
        )}

        {/* Comparison Panel */}
        {compareClients.size > 0 && renderComparisonPanel()}
      </CardContent>
    </Card>
  );
}
