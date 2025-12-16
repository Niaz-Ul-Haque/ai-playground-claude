'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReviewQueueItem, ComparisonData } from '@/types/review-queue';
import { Check, X, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ComparisonViewProps {
  item: ReviewQueueItem;
  existingData: Record<string, unknown>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// Helper to convert unknown value to allowed comparison types
function toComparisonValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  // Convert other types to string
  return String(value);
}

// Mock function to generate comparison data
function generateComparisonData(
  item: ReviewQueueItem,
  existingData: Record<string, unknown>
): ComparisonData[] {
  return item.extractedData.map((field) => {
    const rawExistingValue = existingData[field.fieldName];
    const existingValue = toComparisonValue(rawExistingValue);
    return {
      fieldName: field.fieldName,
      displayName: field.fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
      extractedValue: field.value,
      existingValue,
      confidence: field.confidence,
      isDifferent:
        rawExistingValue !== undefined &&
        rawExistingValue !== field.value &&
        String(rawExistingValue) !== String(field.value),
      source: field.source,
    };
  });
}

export function ComparisonView({
  item,
  existingData,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: ComparisonViewProps) {
  const comparisonData = generateComparisonData(item, existingData);
  const changedFields = comparisonData.filter((d) => d.isDifferent);
  const newFields = comparisonData.filter(
    (d) => d.existingValue === null && d.extractedValue !== null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Extracted Data</DialogTitle>
          <DialogDescription>
            Compare extracted data with existing client record for{' '}
            <span className="font-medium">{item.suggestedClientName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Summary */}
          <div className="flex gap-4 mb-4">
            {newFields.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {newFields.length} new field{newFields.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {changedFields.length > 0 && (
              <Badge className="bg-amber-100 text-amber-800">
                {changedFields.length} changed field{changedFields.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Badge className="bg-gray-100 text-gray-800">
              {comparisonData.length} total field{comparisonData.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Comparison table */}
          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-xs font-medium">
              <div className="col-span-3">Field</div>
              <div className="col-span-4">Existing Value</div>
              <div className="col-span-1 text-center">
                <ArrowRight className="h-3 w-3 mx-auto" />
              </div>
              <div className="col-span-3">Extracted Value</div>
              <div className="col-span-1 text-center">Conf.</div>
            </div>

            {/* Rows */}
            <div className="divide-y">
              {comparisonData.map((field, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-2 p-3 text-sm ${
                    field.isDifferent
                      ? 'bg-amber-50'
                      : field.existingValue === null && field.extractedValue !== null
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="col-span-3 font-medium flex items-center gap-2">
                    {field.isDifferent && (
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                    {field.existingValue === null && field.extractedValue !== null && (
                      <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate">{field.displayName}</span>
                  </div>
                  <div className="col-span-4 text-muted-foreground truncate">
                    {field.existingValue !== null ? String(field.existingValue) : (
                      <span className="italic text-muted-foreground/60">No data</span>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {(field.isDifferent || field.existingValue === null) && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="col-span-3 font-medium truncate">
                    {field.extractedValue !== null ? String(field.extractedValue) : (
                      <span className="italic text-muted-foreground/60">No data</span>
                    )}
                  </div>
                  <div className="col-span-1 text-center">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        field.confidence >= 80
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : field.confidence >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {field.confidence}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source info */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Source</div>
            <div className="text-sm font-medium">{item.sourceName}</div>
            {item.matchReason && (
              <div className="text-xs text-muted-foreground mt-1">
                Match reason: {item.matchReason}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onReject(item.id);
              onOpenChange(false);
            }}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            onClick={() => {
              onApprove(item.id);
              onOpenChange(false);
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ComparisonCardProps {
  item: ReviewQueueItem;
  existingData: Record<string, unknown>;
}

export function ComparisonCard({ item, existingData }: ComparisonCardProps) {
  const comparisonData = generateComparisonData(item, existingData);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Data Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {comparisonData.slice(0, 5).map((field, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded text-sm ${
                field.isDifferent ? 'bg-amber-50' : 'bg-muted/50'
              }`}
            >
              <span className="font-medium">{field.displayName}</span>
              <div className="flex items-center gap-2">
                {field.existingValue !== null && (
                  <>
                    <span className="text-muted-foreground line-through">
                      {String(field.existingValue).substring(0, 15)}
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
                <span>{String(field.extractedValue).substring(0, 15)}</span>
              </div>
            </div>
          ))}
          {comparisonData.length > 5 && (
            <div className="text-xs text-muted-foreground text-center">
              +{comparisonData.length - 5} more fields
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
