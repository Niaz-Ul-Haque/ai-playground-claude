'use client';

import React, { useState } from 'react';
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
import type { DismissReason } from '@/types/opportunity';
import { DISMISS_REASON_LABELS } from '@/types/opportunity';
import { XCircle } from 'lucide-react';

interface DismissDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityTitle: string;
  onDismiss: (reason: DismissReason) => void;
}

export function DismissDialog({
  open,
  onOpenChange,
  opportunityTitle,
  onDismiss,
}: DismissDialogProps) {
  const [reason, setReason] = useState<DismissReason>('not_relevant');

  const handleDismiss = () => {
    onDismiss(reason);
    setReason('not_relevant');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Dismiss Opportunity
          </DialogTitle>
          <DialogDescription>
            Dismiss &quot;{opportunityTitle}&quot;. This will remove it from your active opportunities list.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="mb-3 block">Reason for dismissing</Label>
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as DismissReason)}>
            {Object.entries(DISMISS_REASON_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="font-normal cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDismiss}>
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
