'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Lightbulb,
  Check,
  X,
  ChevronDown,
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';
import type { AutomationSuggestion } from '@/types/automation';
import {
  AUTOMATION_CATEGORY_LABELS,
  AUTOMATION_TRIGGER_LABELS,
  AUTOMATION_ACTION_LABELS,
} from '@/types/automation';

interface SuggestionCardProps {
  suggestion: AutomationSuggestion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionCard({ suggestion, onApprove, onReject }: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const confidenceColor =
    suggestion.confidenceScore >= 85
      ? 'text-green-600 bg-green-50 border-green-200'
      : suggestion.confidenceScore >= 70
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <Card className="border-l-4 border-l-amber-400">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {suggestion.automationDescription}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {AUTOMATION_CATEGORY_LABELS[suggestion.category]}
                </Badge>
                <Badge variant="outline" className={`text-xs ${confidenceColor}`}>
                  {suggestion.confidenceScore}% confident
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onReject(suggestion.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(suggestion.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pattern Description */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Pattern detected: </span>
            {suggestion.patternDescription}
          </p>
        </div>

        {/* Expected Benefit */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{suggestion.expectedBenefit}</span>
          </div>
          {suggestion.estimatedTimeSaved && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>~{suggestion.estimatedTimeSaved} min/week saved</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 text-sm pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Occurrences</p>
            <p className="font-medium">{suggestion.occurrenceCount}x detected</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Trigger</p>
            <p className="font-medium">{AUTOMATION_TRIGGER_LABELS[suggestion.triggerType]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Action</p>
            <p className="font-medium">{AUTOMATION_ACTION_LABELS[suggestion.actionType]}</p>
          </div>
        </div>

        {/* Expandable Example */}
        {suggestion.example && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-muted-foreground">How it works</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="flex-shrink-0 mt-0.5">
                    When
                  </Badge>
                  <p className="text-sm">{suggestion.example.trigger}</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="flex-shrink-0 mt-0.5 bg-green-50 text-green-700">
                    Then
                  </Badge>
                  <p className="text-sm">{suggestion.example.action}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

interface SuggestionListProps {
  suggestions: AutomationSuggestion[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionList({ suggestions, onApprove, onReject }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
        <p className="text-muted-foreground text-sm">
          As you work, Ciri will detect patterns and suggest automations to save you time.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
