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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SnoozeDuration, SnoozeOptions } from '@/types/opportunity';
import { SNOOZE_DURATION_LABELS } from '@/types/opportunity';
import { AlarmClock } from 'lucide-react';

interface SnoozeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityTitle: string;
  onSnooze: (options: SnoozeOptions) => void;
}

export function SnoozeDialog({
  open,
  onOpenChange,
  opportunityTitle,
  onSnooze,
}: SnoozeDialogProps) {
  const [duration, setDuration] = useState<SnoozeDuration>('1_week');
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSnooze = () => {
    onSnooze({
      duration,
      customDate: duration === 'custom' ? customDate : undefined,
      reason: reason || undefined,
    });
    // Reset form
    setDuration('1_week');
    setCustomDate('');
    setReason('');
    onOpenChange(false);
  };

  const isValid = duration !== 'custom' || (duration === 'custom' && customDate);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5" />
            Snooze Opportunity
          </DialogTitle>
          <DialogDescription>
            Snooze &quot;{opportunityTitle}&quot; to be reminded later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Duration Selection */}
          <div className="space-y-2">
            <Label htmlFor="duration">Snooze for</Label>
            <Select value={duration} onValueChange={(v) => setDuration(v as SnoozeDuration)}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SNOOZE_DURATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Input */}
          {duration === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDate">Custom date</Label>
              <Input
                id="customDate"
                type="date"
                min={getMinDate()}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
          )}

          {/* Optional Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Client on vacation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSnooze} disabled={!isValid}>
            Snooze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
