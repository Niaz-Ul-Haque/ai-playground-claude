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
    default:
      return null;
  }
}
