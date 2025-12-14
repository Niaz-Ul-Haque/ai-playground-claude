'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { PrefilledMaterial, ChecklistItem } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileText,
  FileCheck,
  ClipboardList,
  FilePlus,
  FileSpreadsheet,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PrefilledMaterialsProps {
  materials: PrefilledMaterial[];
  onViewMaterial?: (materialId: string) => void;
  onDownloadMaterial?: (materialId: string) => void;
}

const getTypeIcon = (type: PrefilledMaterial['type']) => {
  switch (type) {
    case 'form':
      return FileCheck;
    case 'document':
      return FileText;
    case 'checklist':
      return ClipboardList;
    case 'template':
      return FilePlus;
    case 'report':
      return FileSpreadsheet;
    default:
      return FileText;
  }
};

const getStatusColor = (status: PrefilledMaterial['status']) => {
  switch (status) {
    case 'ready':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'draft':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'sent':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'completed':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

function ChecklistView({
  items,
  onToggle,
}: {
  items: ChecklistItem[];
  onToggle?: (itemId: string, completed: boolean) => void;
}) {
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="space-y-2 mt-3 pt-3 border-t">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Checklist Progress</span>
        <span className="font-medium">
          {completedCount}/{items.length} completed
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg transition-colors',
              item.completed ? 'bg-muted/50' : 'hover:bg-muted/30'
            )}
          >
            <Checkbox
              id={item.id}
              checked={item.completed}
              onCheckedChange={(checked: boolean | 'indeterminate') => onToggle?.(item.id, checked === true)}
            />
            <label
              htmlFor={item.id}
              className={cn(
                'text-sm flex-1 cursor-pointer',
                item.completed && 'line-through text-muted-foreground'
              )}
            >
              {item.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialCard({
  material,
  onView,
  onDownload,
}: {
  material: PrefilledMaterial;
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = getTypeIcon(material.type);
  const isChecklist = material.type === 'checklist' && material.items;
  const fillPercentage = Math.round(
    (material.prefilledFields / material.totalFields) * 100
  );

  return (
    <div className="p-4 rounded-lg border space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium truncate">{material.name}</h4>
            <Badge variant="outline" className={getStatusColor(material.status)}>
              {material.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {material.description}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {material.clientId && material.clientName && (
          <Link
            href={`/clients/${material.clientId}`}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            <span>{material.clientName}</span>
          </Link>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Check className="h-3.5 w-3.5" />
          <span>
            {material.prefilledFields}/{material.totalFields} fields ({fillPercentage}%)
          </span>
        </div>
        <span className="text-muted-foreground">
          Updated {formatDistanceToNow(new Date(material.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Checklist (expandable) */}
      {isChecklist && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground"
            >
              <span>View checklist items</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ChecklistView items={material.items!} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        {onView && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1"
            onClick={() => onView(material.id)}
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
        )}
        {onDownload && material.type !== 'checklist' && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1"
            onClick={() => onDownload(material.id)}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

export function PrefilledMaterials({
  materials,
  onViewMaterial,
  onDownloadMaterial,
}: PrefilledMaterialsProps) {
  const readyMaterials = materials.filter((m) => m.status === 'ready');
  const draftMaterials = materials.filter((m) => m.status === 'draft');

  if (materials.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prefilled Materials
          {readyMaterials.length > 0 && (
            <Badge variant="default" className="bg-green-500">
              {readyMaterials.length} ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {readyMaterials.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Ready to Use</h4>
            {readyMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onView={onViewMaterial}
                onDownload={onDownloadMaterial}
              />
            ))}
          </div>
        )}

        {draftMaterials.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">In Progress</h4>
            {draftMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onView={onViewMaterial}
                onDownload={onDownloadMaterial}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
