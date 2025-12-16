'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Play,
  Pause,
  MoreVertical,
  Settings,
  History,
  Trash2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Bot,
} from 'lucide-react';
import type { ActiveAutomation } from '@/types/automation';
import {
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  AUTOMATION_ACTION_LABELS,
} from '@/types/automation';

interface ActiveAutomationCardProps {
  automation: ActiveAutomation;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onEditBounds: (id: string) => void;
  onViewHistory: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ActiveAutomationCard({
  automation,
  onPause,
  onResume,
  onEditBounds,
  onViewHistory,
  onDelete,
}: ActiveAutomationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isRunning = automation.status === 'running';
  const statusColor = isRunning
    ? 'text-green-600 bg-green-50 border-green-200'
    : 'text-gray-600 bg-gray-50 border-gray-200';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const totalRuns = automation.successCount + automation.failureCount;
  const successRate = totalRuns > 0
    ? Math.round((automation.successCount / totalRuns) * 100)
    : 100;

  return (
    <Card className={`border-l-4 ${isRunning ? 'border-l-green-500' : 'border-l-gray-300'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRunning ? 'bg-green-50' : 'bg-gray-50'}`}>
              <Zap className={`h-5 w-5 ${isRunning ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {automation.name}
                {automation.isSystemGenerated && (
                  <Badge variant="outline" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    Ciri Generated
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {AUTOMATION_CATEGORY_LABELS[automation.category]}
                </Badge>
                <Badge variant="outline" className={`text-xs ${statusColor}`}>
                  {isRunning ? (
                    <><Play className="h-3 w-3 mr-1" /> Running</>
                  ) : (
                    <><Pause className="h-3 w-3 mr-1" /> Paused</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isRunning}
              onCheckedChange={(checked) => {
                if (checked) {
                  onResume(automation.id);
                } else {
                  onPause(automation.id);
                }
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditBounds(automation.id)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Safety Bounds
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewHistory(automation.id)}>
                  <History className="mr-2 h-4 w-4" />
                  View History
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(automation.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{automation.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Last Run</p>
            <p className="font-medium">{formatDate(automation.lastRunAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className={`font-medium ${successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
              {successRate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Runs</p>
            <p className="font-medium">{automation.successCount + automation.failureCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Exceptions</p>
            <p className={`font-medium ${automation.exceptionCount > 0 ? 'text-amber-600' : ''}`}>
              {automation.exceptionCount}
            </p>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-muted-foreground">Details & Configuration</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              {/* Trigger & Action */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Trigger Type</p>
                  <p className="font-medium">{AUTOMATION_TRIGGER_LABELS[automation.triggerType]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Action Type</p>
                  <p className="font-medium">{AUTOMATION_ACTION_LABELS[automation.actionType]}</p>
                </div>
              </div>

              {/* Safety Bounds Summary */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Safety Bounds</p>
                <div className="flex flex-wrap gap-2">
                  {automation.safetyBounds.maxPerDay && (
                    <Badge variant="outline" className="text-xs">
                      Max {automation.safetyBounds.maxPerDay}/day
                    </Badge>
                  )}
                  {automation.safetyBounds.maxPerWeek && (
                    <Badge variant="outline" className="text-xs">
                      Max {automation.safetyBounds.maxPerWeek}/week
                    </Badge>
                  )}
                  {automation.safetyBounds.allowedHours && (
                    <Badge variant="outline" className="text-xs">
                      {automation.safetyBounds.allowedHours.start}:00 - {automation.safetyBounds.allowedHours.end}:00
                    </Badge>
                  )}
                  {automation.safetyBounds.allowedDays && (
                    <Badge variant="outline" className="text-xs">
                      {automation.safetyBounds.allowedDays.length} days/week
                    </Badge>
                  )}
                </div>
              </div>

              {/* Source Pattern */}
              {automation.sourcePattern && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Source Pattern</p>
                  <p className="text-sm">{automation.sourcePattern}</p>
                </div>
              )}

              {/* Created Info */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Created on {new Date(automation.createdAt).toLocaleDateString()} by {automation.createdBy}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

interface ActiveAutomationListProps {
  automations: ActiveAutomation[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onEditBounds: (id: string) => void;
  onViewHistory: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ActiveAutomationList({
  automations,
  onPause,
  onResume,
  onEditBounds,
  onViewHistory,
  onDelete,
}: ActiveAutomationListProps) {
  if (automations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Active Automations</h3>
        <p className="text-muted-foreground text-sm">
          Approve suggestions to create automations, or they'll be created as you work.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map((automation) => (
        <ActiveAutomationCard
          key={automation.id}
          automation={automation}
          onPause={onPause}
          onResume={onResume}
          onEditBounds={onEditBounds}
          onViewHistory={onViewHistory}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
