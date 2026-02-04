'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checklist, type ChecklistItem } from '@/components/ui/checklist';
import { Collapsible } from '@/components/ui/collapsible';
import { ShieldCheck, FileText, AlertTriangle, Calendar } from 'lucide-react';
import type { ComplianceCheckCardData } from '@/types/chat';
import { useChatContext } from '@/context/chat-context';

interface ComplianceCheckCardProps {
  data: ComplianceCheckCardData;
}

export function ComplianceCheckCard({ data }: ComplianceCheckCardProps) {
  const { handleExecuteAction, isLoading } = useChatContext();
  const {
    title,
    client_id,
    client_name,
    check_date,
    overall_score,
    items,
    summary,
    available_actions,
  } = data;

  const failedItems = items.filter(i => i.status === 'fail');
  const warningItems = items.filter(i => i.status === 'warning');
  const passedItems = items.filter(i => i.status === 'pass');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200 bg-green-50/50';
    if (score >= 50) return 'border-amber-200 bg-amber-50/50';
    return 'border-red-200 bg-red-50/50';
  };

  // Convert items to checklist format
  const checklistItems: ChecklistItem[] = items.map(item => ({
    id: item.id,
    label: item.label,
    status: item.status,
    description: item.description,
    details: item.details,
  }));

  const handleResolve = async (issueId: string) => {
    if (!client_id) return;
    const resolution = prompt('Enter resolution notes:');
    if (resolution) {
      await handleExecuteAction('resolve_compliance', 'client', client_id, {
        issue_id: issueId,
        resolution,
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!client_id) return;
    await handleExecuteAction('generate_report', 'client', client_id, {
      report_type: 'compliance',
      check_date,
    });
  };

  const handleScheduleReview = async () => {
    if (!client_id) return;
    await handleExecuteAction('schedule_review', 'client', client_id, {
      review_type: 'compliance',
    });
  };

  return (
    <Card className={`my-4 ${getScoreBorderColor(overall_score)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {client_name && (
              <p className="text-sm text-muted-foreground">Client: {client_name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Checked: {new Date(check_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`text-lg px-3 py-1 ${getScoreColor(overall_score)}`}>
              {overall_score}%
            </Badge>
            <span className="text-xs text-muted-foreground">Compliance Score</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {summary && (
          <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg border">
            {summary}
          </p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">{passedItems.length}</div>
            <div className="text-xs text-green-700">Passed</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-lg font-bold text-amber-600">{warningItems.length}</div>
            <div className="text-xs text-amber-700">Warnings</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-600">{failedItems.length}</div>
            <div className="text-xs text-red-700">Failed</div>
          </div>
        </div>

        {/* Failed Items (expanded by default) */}
        {failedItems.length > 0 && (
          <Collapsible title={<span className="text-red-600 font-medium">Failed Items ({failedItems.length})</span>} defaultOpen>
            <div className="space-y-2">
              {failedItems.map(item => (
                <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-red-800">{item.label}</p>
                      {item.description && (
                        <p className="text-sm text-red-700 mt-1">{item.description}</p>
                      )}
                      {item.remediation && (
                        <p className="text-xs text-red-600 mt-2 italic">
                          Suggested: {item.remediation}
                        </p>
                      )}
                    </div>
                    {available_actions?.includes('resolve') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => handleResolve(item.id)}
                        disabled={isLoading}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Warning Items */}
        {warningItems.length > 0 && (
          <Collapsible title={<span className="text-amber-600 font-medium">Warnings ({warningItems.length})</span>}>
            <Checklist
              items={warningItems.map(i => ({
                id: i.id,
                label: i.label,
                status: i.status,
                description: i.description,
              }))}
              showScore={false}
            />
          </Collapsible>
        )}

        {/* All Items */}
        <Collapsible title={<span className="font-medium">All Checks ({items.length})</span>}>
          <Checklist items={checklistItems} showScore={false} />
        </Collapsible>

        {/* Action Buttons */}
        {available_actions && available_actions.length > 0 && (
          <div className="flex gap-2 pt-2 flex-wrap">
            {available_actions.includes('generate_report') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReport}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-1" />
                Generate Report
              </Button>
            )}
            {available_actions.includes('schedule_review') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleScheduleReview}
                disabled={isLoading}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Review
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
