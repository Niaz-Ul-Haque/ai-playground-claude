'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ReviewQueueItem, AlternativeMatch } from '@/types/review-queue';
import {
  REVIEW_SOURCE_LABELS,
  REVIEW_ITEM_TYPE_LABELS,
  CONFIDENCE_LEVEL_LABELS,
  REVIEW_STATUS_LABELS,
} from '@/types/review-queue';
import {
  Check,
  X,
  Edit,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  Calendar,
  Upload,
  Link2,
  Clock,
  AlertCircle,
  Merge,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  item: ReviewQueueItem;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReassign?: (id: string, clientId: string) => void;
  onViewComparison?: (id: string) => void;
}

const sourceIcons = {
  file: Upload,
  email: Mail,
  calendar: Calendar,
  manual: FileText,
  integration: Link2,
};

function getConfidenceBadgeColor(level: ReviewQueueItem['confidenceLevel']) {
  switch (level) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusBadgeColor(status: ReviewQueueItem['status']) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'edited':
      return 'bg-blue-100 text-blue-800';
    case 'merged':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function ReviewCard({
  item,
  isSelected,
  onSelectChange,
  onApprove,
  onReject,
  onEdit,
  onReassign,
  onViewComparison,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const SourceIcon = sourceIcons[item.sourceType] || FileText;
  const isPending = item.status === 'pending';

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Selection checkbox */}
          {isPending && onSelectChange && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelectChange}
              className="mt-1"
            />
          )}

          {/* Source icon */}
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <SourceIcon className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-sm truncate">{item.sourceName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {REVIEW_SOURCE_LABELS[item.sourceType]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {REVIEW_ITEM_TYPE_LABELS[item.type]}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className={`${getConfidenceBadgeColor(item.confidenceLevel)} text-xs`}
                >
                  {item.confidenceScore}% Confidence
                </Badge>
                {!isPending && (
                  <Badge className={`${getStatusBadgeColor(item.status)} text-xs`}>
                    {REVIEW_STATUS_LABELS[item.status]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Suggested client match */}
            {item.suggestedClientId && item.suggestedClientName && (
              <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Suggested match:</span>
                    <Link
                      href={`/clients/${item.suggestedClientId}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {item.suggestedClientName}
                    </Link>
                  </div>
                  {isPending && onViewComparison && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewComparison(item.id)}
                      className="h-7 text-xs"
                    >
                      Compare
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
                {item.matchReason && (
                  <p className="text-xs text-muted-foreground mt-1">{item.matchReason}</p>
                )}
              </div>
            )}

            {/* No match warning */}
            {!item.suggestedClientId && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    No client match found - manual assignment required
                  </span>
                </div>
              </div>
            )}

            {/* Extracted data preview */}
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">
                Extracted {item.extractedData.length} fields:
              </div>
              <div className="flex flex-wrap gap-1">
                {item.extractedData.slice(0, 3).map((field, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-normal">
                    {field.fieldName}: {String(field.value).substring(0, 20)}
                    {String(field.value).length > 20 ? '...' : ''}
                  </Badge>
                ))}
                {item.extractedData.length > 3 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    +{item.extractedData.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Extracted {formatDistanceToNow(new Date(item.extractedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Expandable details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8">
              <span className="text-xs">
                {isExpanded ? 'Hide details' : 'Show all extracted data'}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-2">
            {/* All extracted fields */}
            <div className="border rounded-lg divide-y">
              {item.extractedData.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-2">
                  <div>
                    <span className="text-sm font-medium">{field.fieldName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {String(field.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{field.source}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        field.confidence >= 80
                          ? 'bg-green-50 text-green-700'
                          : field.confidence >= 60
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {field.confidence}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Alternative matches */}
            {item.alternativeMatches && item.alternativeMatches.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-2">
                  Alternative matches:
                </div>
                <div className="space-y-1">
                  {item.alternativeMatches.map((match) => (
                    <div
                      key={match.clientId}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/${match.clientId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {match.clientName}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          ({match.matchReason})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {match.matchScore}% match
                        </Badge>
                        {isPending && onReassign && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReassign(item.id, match.clientId)}
                            className="h-6 text-xs"
                          >
                            Use this
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review notes for processed items */}
            {item.reviewNotes && (
              <div className="mt-3 p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground mb-1">Review notes:</div>
                <p className="text-sm">{item.reviewNotes}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        {isPending && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove?.(item.id)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(item.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject?.(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
            {item.alternativeMatches && item.alternativeMatches.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReassign?.(item.id, item.alternativeMatches![0].clientId)}
                className="hidden sm:flex"
              >
                <Merge className="h-4 w-4 mr-1" />
                Merge
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ReviewListProps {
  items: ReviewQueueItem[];
  selectedIds: Set<string>;
  onSelectChange: (id: string, selected: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onReassign: (id: string, clientId: string) => void;
  onViewComparison: (id: string) => void;
}

export function ReviewList({
  items,
  selectedIds,
  onSelectChange,
  onApprove,
  onReject,
  onEdit,
  onReassign,
  onViewComparison,
}: ReviewListProps) {
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-1">No items to review</h3>
        <p className="text-sm text-muted-foreground">
          All extractions have been processed or no items match your filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ReviewCard
          key={item.id}
          item={item}
          isSelected={selectedIds.has(item.id)}
          onSelectChange={(selected) => onSelectChange(item.id, selected)}
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
          onReassign={onReassign}
          onViewComparison={onViewComparison}
        />
      ))}
    </div>
  );
}
