'use client';

import type { Card } from '@/types/chat';
import {
  TaskListCard,
  TaskCard,
  ClientCard,
  ClientListCard,
  PolicyCard,
  PolicyListCard,
  ReviewCard,
  ConfirmationCard,
  // Phase 1: Actionable content cards
  EmailComposerCard,
  DataTableCard,
  ChartCard,
  ComplianceCheckCard,
  // Phase 2: Business intelligence cards
  ProposalCard,
  ComparisonCard,
  DashboardCard,
  PortfolioReviewCard,
  // Phase 3: Workflow cards
  CalendarCard,
  DocumentPreviewCard,
  ProgressTrackerCard,
  MeetingNotesCard,
  ReminderCard,
  RenewalNoticeCard,
} from '@/components/cards';

interface CardRendererProps {
  card: Card;
}

export function CardRenderer({ card }: CardRendererProps) {
  switch (card.type) {
    case 'task-list':
      return <TaskListCard data={card.data} />;
    case 'task':
      return <TaskCard data={card.data} />;
    case 'client':
      return <ClientCard data={card.data} />;
    case 'client-list':
      return <ClientListCard data={card.data} />;
    case 'policy':
      return <PolicyCard data={card.data} />;
    case 'policy-list':
      return <PolicyListCard data={card.data} />;
    case 'review':
      return <ReviewCard data={card.data} />;
    case 'confirmation':
      return <ConfirmationCard data={card.data} />;
    
    // Phase 1: Actionable content cards
    case 'email-composer':
      return <EmailComposerCard data={card.data} />;
    case 'data-table':
      return <DataTableCard data={card.data} />;
    case 'chart':
      return <ChartCard data={card.data} />;
    case 'compliance-check':
      return <ComplianceCheckCard data={card.data} />;
    
    // Phase 2: Business intelligence cards
    case 'proposal':
      return <ProposalCard data={card.data} />;
    case 'comparison':
      return <ComparisonCard data={card.data} />;
    case 'dashboard':
      return <DashboardCard data={card.data} />;
    case 'portfolio-review':
      return <PortfolioReviewCard data={card.data} />;
    
    // Phase 3: Workflow cards
    case 'calendar':
      return <CalendarCard data={card.data} />;
    case 'document-preview':
      return <DocumentPreviewCard data={card.data} />;
    case 'progress-tracker':
      return <ProgressTrackerCard data={card.data} />;
    case 'meeting-notes':
      return <MeetingNotesCard data={card.data} />;
    case 'reminder':
      return <ReminderCard data={card.data} />;
    case 'renewal-notice':
      return <RenewalNoticeCard data={card.data} />;
    
    default:
      // Handle unknown card types gracefully
      return (
        <div className="my-4 p-4 border border-amber-200 rounded-lg bg-amber-50/50 text-amber-800 text-sm">
          Unknown card type: {(card as { type: string }).type}
        </div>
      );
  }
}
