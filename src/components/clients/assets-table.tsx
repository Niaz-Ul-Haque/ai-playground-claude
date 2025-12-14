'use client';

import React, { useState } from 'react';
import type { ClientAsset } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Shield,
  TrendingUp,
  Landmark,
  PiggyBank,
  Wallet,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface AssetsTableProps {
  assets: ClientAsset[];
}

const getAssetIcon = (type: ClientAsset['type']) => {
  switch (type) {
    case 'insurance_life':
    case 'insurance_disability':
    case 'insurance_critical':
      return Shield;
    case 'rrsp':
    case 'tfsa':
    case 'resp':
    case 'rrif':
      return PiggyBank;
    case 'non_registered':
      return TrendingUp;
    case 'pension':
      return Landmark;
    case 'gic':
      return Wallet;
    case 'property':
      return Home;
    default:
      return Wallet;
  }
};

const getStatusBadge = (status: ClientAsset['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>;
    case 'matured':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Matured</Badge>;
    case 'closed':
      return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">Closed</Badge>;
    case 'lapsed':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Lapsed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatAssetType = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Group assets by category
const categorizeAssets = (assets: ClientAsset[]) => {
  const categories: Record<string, ClientAsset[]> = {
    Insurance: [],
    'Registered Accounts': [],
    'Non-Registered': [],
    'Fixed Income': [],
    Property: [],
  };

  assets.forEach((asset) => {
    if (['insurance_life', 'insurance_disability', 'insurance_critical'].includes(asset.type)) {
      categories['Insurance'].push(asset);
    } else if (['rrsp', 'tfsa', 'resp', 'rrif', 'pension'].includes(asset.type)) {
      categories['Registered Accounts'].push(asset);
    } else if (asset.type === 'non_registered') {
      categories['Non-Registered'].push(asset);
    } else if (asset.type === 'gic') {
      categories['Fixed Income'].push(asset);
    } else if (asset.type === 'property') {
      categories['Property'].push(asset);
    }
  });

  return Object.entries(categories).filter(([, items]) => items.length > 0);
};

function AssetCategory({
  category,
  assets,
}: {
  category: string;
  assets: ClientAsset[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-semibold">{category}</span>
            <Badge variant="secondary">{assets.length}</Badge>
          </div>
          <span className="font-semibold">{formatCurrency(totalValue)}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Key Date</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const Icon = getAssetIcon(asset.type);
              const keyDate = asset.renewalDate || asset.maturityDate;
              const daysUntil = keyDate ? differenceInDays(new Date(keyDate), new Date()) : null;
              const isUrgent = daysUntil !== null && daysUntil <= 30 && daysUntil >= 0;

              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatAssetType(asset.type)}
                          {asset.accountNumber && ` · ${asset.accountNumber}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{asset.institution || '-'}</TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>
                    {keyDate ? (
                      <div className="flex items-center gap-1">
                        {isUrgent && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                        <span className={isUrgent ? 'text-yellow-600 font-medium' : ''}>
                          {format(new Date(keyDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(asset.value)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AssetsTable({ assets }: AssetsTableProps) {
  const categorizedAssets = categorizeAssets(assets);
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assets & Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No assets or policies recorded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Assets & Policies</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {categorizedAssets.map(([category, categoryAssets]) => (
            <AssetCategory key={category} category={category} assets={categoryAssets} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
