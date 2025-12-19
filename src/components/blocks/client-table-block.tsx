'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, Eye, Shield, TrendingUp } from 'lucide-react';
import type { ClientTableBlockData } from '@/types/chat-blocks';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface ClientTableBlockProps {
  data: ClientTableBlockData;
}

type SortField = 'name' | 'portfolioValue' | 'riskProfile' | 'lastContact';
type SortOrder = 'asc' | 'desc';

export function ClientTableBlock({ data }: ClientTableBlockProps) {
  const { handleViewClient } = useChatContext();
  const { title, clients, showActions = true, clickable = true } = data;

  const [sortBy, setSortBy] = useState<SortField>(data.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState<SortOrder>(data.sortOrder || 'asc');

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'aggressive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'conservative':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'portfolioValue':
        comparison = a.portfolioValue - b.portfolioValue;
        break;
      case 'riskProfile':
        const riskOrder = { conservative: 1, moderate: 2, aggressive: 3 };
        comparison = riskOrder[a.riskProfile] - riskOrder[b.riskProfile];
        break;
      case 'lastContact':
        comparison = new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 -ml-3 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{clients.length} clients</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <SortButton field="name">Client</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="portfolioValue">Portfolio Value</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="riskProfile">Risk Profile</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="lastContact">Last Contact</SortButton>
                </TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => (
                <TableRow
                  key={client.id}
                  className={cn(
                    clickable && 'cursor-pointer hover:bg-muted/50 transition-colors'
                  )}
                  onClick={() => clickable && handleViewClient(client.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-sm">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatCurrency(client.portfolioValue)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRiskProfileColor(client.riskProfile)}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {client.riskProfile}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelativeDate(client.lastContact)}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClient(client.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
