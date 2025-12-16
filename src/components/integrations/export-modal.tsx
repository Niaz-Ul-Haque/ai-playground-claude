'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  File,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { ExportFormat, ExportScope, ExportOptions } from '@/types/integration';
import {
  EXPORT_FORMAT_LABELS,
  EXPORT_SCOPE_LABELS,
} from '@/types/integration';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => Promise<void>;
  totalClients?: number;
  filteredClients?: number;
  selectedClients?: number;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <FileText className="h-4 w-4" />,
  xlsx: <FileSpreadsheet className="h-4 w-4" />,
  json: <FileJson className="h-4 w-4" />,
  pdf: <File className="h-4 w-4" />,
};

type ExportStep = 'options' | 'exporting' | 'complete';

export function ExportModal({
  open,
  onOpenChange,
  onExport,
  totalClients = 0,
  filteredClients = 0,
  selectedClients = 0,
}: ExportModalProps) {
  const [step, setStep] = useState<ExportStep>('options');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>('all_clients');

  const getScopeCount = (s: ExportScope): number => {
    switch (s) {
      case 'all_clients':
        return totalClients;
      case 'filtered':
        return filteredClients;
      case 'selected':
        return selectedClients;
      default:
        return 0;
    }
  };

  const handleExport = async () => {
    setStep('exporting');

    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await onExport({ format, scope });
      setStep('complete');
    } catch (error) {
      console.error('Export failed:', error);
      setStep('options');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setStep('options');
      setFormat('csv');
      setScope('all_clients');
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'options' && (
          <>
            <DialogHeader>
              <DialogTitle>Export Client Data</DialogTitle>
              <DialogDescription>
                Export your unified client data to a file format of your choice.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <RadioGroup
                  value={format}
                  onValueChange={(v) => setFormat(v as ExportFormat)}
                  className="grid grid-cols-2 gap-3"
                >
                  {(['csv', 'xlsx', 'json', 'pdf'] as ExportFormat[]).map((f) => (
                    <Label
                      key={f}
                      htmlFor={`format-${f}`}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                        format === f ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <RadioGroupItem value={f} id={`format-${f}`} className="sr-only" />
                      {formatIcons[f]}
                      <span className="text-sm font-medium">{EXPORT_FORMAT_LABELS[f]}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Scope Selection */}
              <div className="space-y-3">
                <Label>Export Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as ExportScope)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_clients">
                      <div className="flex items-center justify-between w-full">
                        <span>{EXPORT_SCOPE_LABELS.all_clients}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({totalClients} records)
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="filtered" disabled={filteredClients === 0}>
                      <div className="flex items-center justify-between w-full">
                        <span>{EXPORT_SCOPE_LABELS.filtered}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({filteredClients} records)
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="selected" disabled={selectedClients === 0}>
                      <div className="flex items-center justify-between w-full">
                        <span>{EXPORT_SCOPE_LABELS.selected}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({selectedClients} records)
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p>
                  Exporting <span className="font-medium">{getScopeCount(scope)}</span> records as{' '}
                  <span className="font-medium">{EXPORT_FORMAT_LABELS[format]}</span>
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={getScopeCount(scope) === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'exporting' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Generating Export</h3>
            <p className="text-sm text-muted-foreground">
              Preparing {getScopeCount(scope)} records for download...
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Export Ready!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your {EXPORT_FORMAT_LABELS[format]} file is ready to download.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => alert('Download started (mock)')}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
