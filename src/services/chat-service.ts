/**
 * Chat Service - Handles chat API interactions
 */

import { apiPost } from '@/lib/api-client';
import type { ChatRequest, ChatResponse, Message, Card, ChatContext } from '@/types/chat';

export interface SendMessageResult {
  message: string;
  cards: Card[];
  context?: {
    client_id?: string;
    policy_id?: string;
    task_id?: string;
  };
}

/**
 * Send a message to the Ciri AI backend
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: Message[],
  context?: ChatContext
): Promise<SendMessageResult | null> {
  const request: ChatRequest = {
    message,
    conversation_history: conversationHistory.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    context,
  };

  const response = await apiPost<ChatResponse['data']>('/api/chat', request);

  if (!response.success || !response.data) {
    console.error('Chat error:', response.error, response.message);
    return null;
  }

  return {
    message: response.data.message,
    cards: response.data.cards || [],
    context: response.data.context,
  };
}
