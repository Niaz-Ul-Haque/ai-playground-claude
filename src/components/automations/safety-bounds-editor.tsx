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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Clock,
  Calendar,
  Hash,
  DollarSign,
  AlertTriangle,
  Users,
} from 'lucide-react';
import type { SafetyBounds, ActiveAutomation } from '@/types/automation';
import { DAY_LABELS, DAYS_OF_WEEK } from '@/types/automation';

interface SafetyBoundsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: ActiveAutomation | null;
  onSave: (id: string, bounds: SafetyBounds) => void;
}

export function SafetyBoundsEditor({
  open,
  onOpenChange,
  automation,
  onSave,
}: SafetyBoundsEditorProps) {
  const [bounds, setBounds] = useState<SafetyBounds>({});

  // Reset form when automation changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && automation) {
      setBounds({ ...automation.safetyBounds });
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    if (automation) {
      onSave(automation.id, bounds);
      onOpenChange(false);
    }
  };

  const toggleDay = (day: string) => {
    const currentDays = bounds.allowedDays || [...DAYS_OF_WEEK];
    if (currentDays.includes(day)) {
      setBounds({
        ...bounds,
        allowedDays: currentDays.filter((d) => d !== day),
      });
    } else {
      setBounds({
        ...bounds,
        allowedDays: [...currentDays, day],
      });
    }
  };

  if (!automation) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Safety Bounds Configuration
          </DialogTitle>
          <DialogDescription>
            Set limits and conditions for &quot;{automation.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rate Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Rate Limits
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPerDay">Max per Day</Label>
                <Input
                  id="maxPerDay"
                  type="number"
                  min={0}
                  value={bounds.maxPerDay || ''}
                  onChange={(e) =>
                    setBounds({
                      ...bounds,
                      maxPerDay: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPerWeek">Max per Week</Label>
                <Input
                  id="maxPerWeek"
                  type="number"
                  min={0}
                  value={bounds.maxPerWeek || ''}
                  onChange={(e) =>
                    setBounds({
                      ...bounds,
                      maxPerWeek: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          {/* Value Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Value Limits
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxValue">Max Value ($)</Label>
                <Input
                  id="maxValue"
                  type="number"
                  min={0}
                  value={bounds.maxValue || ''}
                  onChange={(e) =>
                    setBounds({
                      ...bounds,
                      maxValue: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="No limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmAbove">Confirm Above ($)</Label>
                <Input
                  id="confirmAbove"
                  type="number"
                  min={0}
                  value={bounds.requireConfirmationAbove || ''}
                  onChange={(e) =>
                    setBounds({
                      ...bounds,
                      requireConfirmationAbove: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="No confirmation"
                />
                <p className="text-xs text-muted-foreground">
                  Require manual approval above this value
                </p>
              </div>
            </div>
          </div>

          {/* Time Window */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Allowed Hours
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startHour">Start Hour</Label>
                <Input
                  id="startHour"
                  type="number"
                  min={0}
                  max={23}
                  value={bounds.allowedHours?.start ?? ''}
                  onChange={(e) =>
                    setBounds({
                      ...bounds,
                      allowedHours: {
                        start: e.target.value ? parseInt(e.target.value) : 0,
                        end: bounds.allowedHours?.end ?? 23,
                      },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endHour">End Hour</Label>
                <Input
                  id="endHour"
                  type="number"
                  min={0}
                  max={23}
                  value={bounds.allowedHours?.end ?? ''}
                  onChange={(e) =>
                    setBounds({
                      ...bounds,
                      allowedHours: {
                        start: bounds.allowedHours?.start ?? 0,
                        end: e.target.value ? parseInt(e.target.value) : 23,
                      },
                    })
                  }
                  placeholder="23"
                />
              </div>
            </div>
          </div>

          {/* Allowed Days */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Allowed Days
            </h4>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = bounds.allowedDays
                  ? bounds.allowedDays.includes(day)
                  : true;
                return (
                  <Badge
                    key={day}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDay(day)}
                  >
                    {DAY_LABELS[day].slice(0, 3)}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Click to toggle days. Empty = all days allowed.
            </p>
          </div>

          {/* Cooldown */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Cooldown Period
            </h4>
            <div className="space-y-2">
              <Label htmlFor="cooldown">Hours between runs (per client)</Label>
              <Input
                id="cooldown"
                type="number"
                min={0}
                value={bounds.cooldownPeriod || ''}
                onChange={(e) =>
                  setBounds({
                    ...bounds,
                    cooldownPeriod: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No cooldown"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
