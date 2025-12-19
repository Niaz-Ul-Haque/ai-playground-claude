'use client';

import type { Card } from '@/types/chat';
import type { Block } from '@/types/chat-blocks';
import {
  TaskListCard,
  TaskCard,
  ClientCard,
  ReviewCard,
  ConfirmationCard,
} from '@/components/cards';
import {
  ClientTableBlock,
  OpportunityListBlock,
  AutomationListBlock,
  ClientProfileBlock,
  OpportunityDetailBlock,
  WorkflowStatusBlock,
  TimelineBlock,
  ChartBlock,
  ConfirmActionBlock,
  SelectEntityBlock,
  ExportDownloadBlock,
} from '@/components/blocks';
import { AlertCircle } from 'lucide-react';

/**
 * Props for rendering a legacy Card
 */
interface CardRendererProps {
  card: Card;
}

/**
 * Props for rendering a new Block
 */
interface BlockRendererProps {
  block: Block;
}

/**
 * CardRenderer - Renders legacy card types
 * Used for backward compatibility with existing chat messages
 */
export function CardRenderer({ card }: CardRendererProps) {
  switch (card.type) {
    case 'task-list':
      return <TaskListCard data={card.data} />;
    case 'task':
      return <TaskCard data={card.data} />;
    case 'client':
      return <ClientCard data={card.data} />;
    case 'review':
      return <ReviewCard data={card.data} />;
    case 'confirmation':
      return <ConfirmationCard data={card.data} />;
    default:
      return null;
  }
}

/**
 * BlockRenderer - Renders new block types
 * Used for the enhanced chat system with 13+ block types
 */
export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    // Table/List Blocks
    case 'client-table':
      return <ClientTableBlock data={block.data} />;
    case 'opportunity-list':
      return <OpportunityListBlock data={block.data} />;
    case 'automation-list':
      return <AutomationListBlock data={block.data} />;

    // Detail Blocks
    case 'client-profile':
      return <ClientProfileBlock data={block.data} />;
    case 'opportunity-detail':
      return <OpportunityDetailBlock data={block.data} />;
    case 'workflow-status':
      return <WorkflowStatusBlock data={block.data} />;

    // Interactive Blocks
    case 'timeline':
      return <TimelineBlock data={block.data} />;
    case 'chart':
      return <ChartBlock data={block.data} />;
    case 'confirm-action':
      return <ConfirmActionBlock data={block.data} />;
    case 'select-entity':
      return <SelectEntityBlock data={block.data} />;

    // Export Blocks
    case 'export-download':
      return <ExportDownloadBlock data={block.data} />;

    // Utility Blocks
    case 'text':
      return (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {block.data.content}
        </div>
      );

    case 'error':
      return (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 my-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-medium text-red-800">{block.data.title}</p>
            <p className="text-sm text-red-600 mt-1">{block.data.message}</p>
            {block.data.suggestion && (
              <p className="text-sm text-red-500 mt-2">
                Suggestion: {block.data.suggestion}
              </p>
            )}
          </div>
        </div>
      );

    default:
      // Handle unknown block types gracefully
      console.warn(`Unknown block type: ${(block as Block).type}`);
      return null;
  }
}

/**
 * UnifiedRenderer - Renders either a Card or a Block
 * Detects the type based on the presence of specific properties
 */
interface UnifiedRendererProps {
  item: Card | Block;
}

export function UnifiedRenderer({ item }: UnifiedRendererProps) {
  // Check if it's a Block (has 'id' and 'createdAt' properties)
  if ('id' in item && 'createdAt' in item) {
    return <BlockRenderer block={item as Block} />;
  }

  // Otherwise, treat it as a legacy Card
  return <CardRenderer card={item as Card} />;
}

export default BlockRenderer;
