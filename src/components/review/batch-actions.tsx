'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { BatchOperation } from '@/types/review-queue';
import { Check, X, Merge, Square, CheckSquare } from 'lucide-react';

interface BatchActionsProps {
  selectedCount: number;
  totalCount: number;
  highConfidenceCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchOperation: (operation: BatchOperation) => void;
  disabled?: boolean;
}

export function BatchActions({
  selectedCount,
  totalCount,
  highConfidenceCount,
  onSelectAll,
  onDeselectAll,
  onBatchOperation,
  disabled,
}: BatchActionsProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Selection controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll();
                  } else {
                    onDeselectAll();
                  }
                }}
                disabled={disabled || totalCount === 0}
              />
              <span className="text-sm text-muted-foreground">
                {selectedCount > 0 ? (
                  <>
                    <span className="font-medium">{selectedCount}</span> of {totalCount} selected
                  </>
                ) : (
                  `${totalCount} items`
                )}
              </span>
            </div>

            {selectedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                className="h-7 text-xs"
              >
                Clear selection
              </Button>
            )}
          </div>

          {/* Batch actions */}
          <div className="flex items-center gap-2">
            {/* Quick select high confidence */}
            {highConfidenceCount > 0 && selectedCount === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // This would be implemented to select only high confidence items
                  onSelectAll();
                }}
                className="h-8 text-xs"
                disabled={disabled}
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                Select high confidence ({highConfidenceCount})
              </Button>
            )}

            {/* Batch approve */}
            <Button
              variant="default"
              size="sm"
              onClick={() => onBatchOperation('approve')}
              disabled={disabled || selectedCount === 0}
              className="h-8"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve{selectedCount > 0 && ` (${selectedCount})`}
            </Button>

            {/* Batch reject */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBatchOperation('reject')}
              disabled={disabled || selectedCount === 0}
              className="h-8 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BatchResultsProps {
  results: {
    success: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  };
  operation: BatchOperation;
  onDismiss: () => void;
}

export function BatchResults({ results, operation, onDismiss }: BatchResultsProps) {
  const operationLabels: Record<BatchOperation, string> = {
    approve: 'approved',
    reject: 'rejected',
    merge: 'merged',
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Batch operation complete
              </p>
              <p className="text-xs text-muted-foreground">
                {results.success} item{results.success !== 1 ? 's' : ''} {operationLabels[operation]}
                {results.failed > 0 && (
                  <span className="text-red-600">
                    , {results.failed} failed
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>

        {results.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-xs font-medium text-red-700 mb-1">Errors:</p>
            {results.errors.slice(0, 3).map((err, idx) => (
              <p key={idx} className="text-xs text-red-600">
                {err.error}
              </p>
            ))}
            {results.errors.length > 3 && (
              <p className="text-xs text-red-500 mt-1">
                +{results.errors.length - 3} more errors
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
