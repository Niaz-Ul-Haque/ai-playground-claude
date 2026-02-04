'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield,
  DollarSign,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  LayoutList,
  Clock,
  CheckSquare,
  X,
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
import type { PolicyListCardData } from '@/types/chat';
import type { PolicySummary } from '@/types/policy';
import { formatCurrency, formatDueDate } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface PolicyListCardProps {
  data: PolicyListCardData;
}

type ViewMode = 'list' | 'timeline';

export function PolicyListCard({ data }: PolicyListCardProps) {
  const { handleExecuteAction } = useChatContext();
  const { title, policies, client_name } = data;

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());

  // Unique types and statuses
  const uniqueTypes = [...new Set(policies.map(p => p.policy_type).filter(Boolean))];
  const uniqueStatuses = [...new Set(policies.map(p => p.policy_status).filter(Boolean))];

  // Filtering
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          policy.policy_number.toLowerCase().includes(query) ||
          policy.product_name?.toLowerCase().includes(query) ||
          policy.policy_type?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (typeFilter.length > 0 && policy.policy_type && !typeFilter.includes(policy.policy_type)) {
        return false;
      }

      if (statusFilter.length > 0 && policy.policy_status && !statusFilter.includes(policy.policy_status)) {
        return false;
      }

      return true;
    });
  }, [policies, searchQuery, typeFilter, statusFilter]);

  // Timeline sorted policies
  const timelinePolicies = useMemo(() => {
    return [...filteredPolicies]
      .filter(p => p.renewal_date)
      .sort((a, b) => {
        const dateA = new Date(a.renewal_date!).getTime();
        const dateB = new Date(b.renewal_date!).getTime();
        return dateA - dateB;
      });
  }, [filteredPolicies]);

  // Premium totals
  const premiumTotals = useMemo(() => {
    const monthly = filteredPolicies.reduce((sum, p) => {
      if (!p.premium_amount) return sum;
      const freq = p.premium_frequency?.toLowerCase() || 'monthly';
      if (freq === 'monthly') return sum + p.premium_amount;
      if (freq === 'quarterly') return sum + (p.premium_amount / 3);
      if (freq === 'annually' || freq === 'annual') return sum + (p.premium_amount / 12);
      return sum + p.premium_amount;
    }, 0);

    return {
      monthly,
      annual: monthly * 12,
      total_coverage: filteredPolicies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0),
    };
  }, [filteredPolicies]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedPolicies.size === filteredPolicies.length) {
      setSelectedPolicies(new Set());
    } else {
      setSelectedPolicies(new Set(filteredPolicies.map(p => p.policy_id)));
    }
  };

  const handleSelectPolicy = (policyId: string) => {
    const newSelected = new Set(selectedPolicies);
    if (newSelected.has(policyId)) {
      newSelected.delete(policyId);
    } else {
      newSelected.add(policyId);
    }
    setSelectedPolicies(newSelected);
  };

  const handleBulkRenewal = async () => {
    await handleExecuteAction('bulk_renewal', 'policies', 'bulk', {
      policy_ids: Array.from(selectedPolicies),
    });
    setSelectedPolicies(new Set());
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Lapsed':
      case 'Cancelled':
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Matured':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRenewalUrgency = (renewalDate: string) => {
    const date = new Date(renewalDate);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { label: 'Overdue', color: 'bg-red-500' };
    if (diff <= 7) return { label: 'This Week', color: 'bg-orange-500' };
    if (diff <= 30) return { label: 'This Month', color: 'bg-yellow-500' };
    if (diff <= 90) return { label: '3 Months', color: 'bg-blue-500' };
    return { label: '3+ Months', color: 'bg-green-500' };
  };

  const renderPolicyItem = (policy: PolicySummary) => {
    const isSelected = selectedPolicies.has(policy.policy_id);

    return (
      <div
        key={policy.policy_id}
        className={`flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
          isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleSelectPolicy(policy.policy_id)}
          className="h-4 w-4 mt-1 rounded border-gray-300"
        />
        <Shield className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-medium text-sm">{policy.policy_number}</p>
            <Badge variant="outline" className={getStatusColor(policy.policy_status)}>
              {policy.policy_status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>{policy.policy_type}</span>
            {policy.product_name && (
              <>
                <span>•</span>
                <span>{policy.product_name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            {policy.coverage_amount && (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span>{formatCurrency(policy.coverage_amount)}</span>
              </div>
            )}
            {policy.premium_amount && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span>
                  {formatCurrency(policy.premium_amount)}
                  {policy.premium_frequency && `/${policy.premium_frequency.toLowerCase().slice(0, 3)}`}
                </span>
              </div>
            )}
            {policy.renewal_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>Renews {formatDueDate(policy.renewal_date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineView = () => (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {timelinePolicies.map((policy) => {
          const urgency = getRenewalUrgency(policy.renewal_date!);
          const isSelected = selectedPolicies.has(policy.policy_id);

          return (
            <div key={policy.policy_id} className="relative flex items-start gap-4 pl-10">
              {/* Timeline dot */}
              <div className={`absolute left-2.5 w-3 h-3 rounded-full ${urgency.color}`} />

              <div
                className={`flex-1 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                  isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectPolicy(policy.policy_id)}
                    className="h-4 w-4 mt-1 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{policy.policy_number}</p>
                        <Badge variant="secondary" className="text-xs">{urgency.label}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDueDate(policy.renewal_date!)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{policy.policy_type}</span>
                      {policy.product_name && (
                        <>
                          <span>•</span>
                          <span>{policy.product_name}</span>
                        </>
                      )}
                      {policy.premium_amount && (
                        <>
                          <span>•</span>
                          <span>{formatCurrency(policy.premium_amount)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {timelinePolicies.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No policies with renewal dates
        </p>
      )}
    </div>
  );

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title || 'Policies'}</CardTitle>
            {client_name && (
              <p className="text-sm text-muted-foreground">For {client_name}</p>
            )}
          </div>
          <Badge variant="outline">{filteredPolicies.length} polic{filteredPolicies.length !== 1 ? 'ies' : 'y'}</Badge>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-wrap gap-4 mt-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Monthly Premium</p>
              <p className="font-medium text-sm">{formatCurrency(premiumTotals.monthly)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Annual Premium</p>
              <p className="font-medium text-sm">{formatCurrency(premiumTotals.annual)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Coverage</p>
              <p className="font-medium text-sm">{formatCurrency(premiumTotals.total_coverage)}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-l-none border-l"
              onClick={() => setViewMode('timeline')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Timeline
            </Button>
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(typeFilter.length > 0 || statusFilter.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1">
                    {typeFilter.length + statusFilter.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              {uniqueTypes.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilter.includes(type!)}
                  onCheckedChange={() => {
                    setTypeFilter(prev =>
                      prev.includes(type!)
                        ? prev.filter(t => t !== type)
                        : [...prev, type!]
                    );
                  }}
                >
                  {type}
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
              {(typeFilter.length > 0 || statusFilter.length > 0) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setTypeFilter([]); setStatusFilter([]); }}>
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bulk Actions */}
        {selectedPolicies.size > 0 && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-primary/5 rounded-lg">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedPolicies.size} selected</span>
            <Button variant="outline" size="sm" className="ml-auto h-7" onClick={handleBulkRenewal}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Initiate Renewal
            </Button>
            <Button variant="ghost" size="sm" className="h-7" onClick={() => setSelectedPolicies(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Select All */}
        {filteredPolicies.length > 0 && viewMode === 'list' && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <input
              type="checkbox"
              checked={selectedPolicies.size === filteredPolicies.length && filteredPolicies.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-xs text-muted-foreground">Select all</span>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredPolicies.map(renderPolicyItem)}
          </div>
        ) : (
          renderTimelineView()
        )}

        {filteredPolicies.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery || typeFilter.length > 0 || statusFilter.length > 0
              ? 'No policies match your filters'
              : 'No policies'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
