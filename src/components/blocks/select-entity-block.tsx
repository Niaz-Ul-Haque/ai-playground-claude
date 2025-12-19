'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  User,
  Briefcase,
  Target,
  Zap,
  GitBranch,
  CheckCircle2,
  HelpCircle,
  Clock,
  FileText,
  Link,
} from 'lucide-react';
import type { SelectEntityBlockData } from '@/types/chat-blocks';
import type { EntityType } from '@/types/tools';
import { useChatContext } from '@/context/chat-context';
import { cn } from '@/lib/utils';

interface SelectEntityBlockProps {
  data: SelectEntityBlockData;
}

const ENTITY_ICONS: Record<EntityType, React.ElementType> = {
  task: Briefcase,
  client: User,
  opportunity: Target,
  automation: Zap,
  workflow: GitBranch,
  integration: Link,
  activity: Clock,
  material: FileText,
};

const ENTITY_LABELS: Record<EntityType, string> = {
  task: 'Task',
  client: 'Client',
  opportunity: 'Opportunity',
  automation: 'Automation',
  workflow: 'Workflow',
  integration: 'Integration',
  activity: 'Activity',
  material: 'Material',
};

export function SelectEntityBlock({ data }: SelectEntityBlockProps) {
  const { sendMessage } = useChatContext();
  const {
    prompt,
    entityType,
    options,
    multiSelect = false,
    pendingAction,
  } = data;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const EntityIcon = ENTITY_ICONS[entityType] || HelpCircle;

  const handleSingleSelect = (id: string) => {
    setSelectedIds([id]);
  };

  const handleMultiSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;

    setIsSubmitted(true);
    const selectedNames = options
      .filter((opt) => selectedIds.includes(opt.id))
      .map((opt) => opt.displayName)
      .join(', ');

    await sendMessage(`Select ${selectedNames} for ${pendingAction}`);
  };

  const handleCancel = async () => {
    setIsSubmitted(true);
    await sendMessage(`Cancel selection for ${pendingAction}`);
  };

  if (isSubmitted) {
    return (
      <Card className="my-4 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Selection Made</p>
              <p className="text-sm text-green-600">Processing your selection...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-4 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{prompt}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {multiSelect
                ? 'Select one or more options below'
                : 'Select one option below'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {multiSelect ? (
          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border bg-background transition-colors cursor-pointer',
                  selectedIds.includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent/50'
                )}
                onClick={() =>
                  handleMultiSelect(option.id, !selectedIds.includes(option.id))
                }
              >
                <Checkbox
                  id={option.id}
                  checked={selectedIds.includes(option.id)}
                  onCheckedChange={(checked) =>
                    handleMultiSelect(option.id, checked as boolean)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <EntityIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{option.displayName}</span>
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedIds[0] || ''}
            onValueChange={handleSingleSelect}
            className="space-y-3"
          >
            {options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border bg-background transition-colors cursor-pointer',
                  selectedIds.includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent/50'
                )}
                onClick={() => handleSingleSelect(option.id)}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <EntityIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{option.displayName}</span>
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm Selection
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        {/* Selected Summary */}
        {selectedIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Selected: {options
              .filter((opt) => selectedIds.includes(opt.id))
              .map((opt) => opt.displayName)
              .join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
