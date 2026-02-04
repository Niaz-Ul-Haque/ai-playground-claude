'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  StreamingStatus,
  SSEEventData,
  StreamingChatResponse,
  StreamingChatContext,
} from '@/types/chat';

interface UseStreamingChatOptions {
  streamingEndpoint: string;
  onStatusChange?: (status: StreamingStatus, message: string, progress: number) => void;
  onResult?: (result: StreamingChatResponse) => void;
  onError?: (error: string) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions) {
  const { streamingEndpoint, onStatusChange, onResult, onError } = options;

  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<StreamingStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    context?: StreamingChatContext,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<StreamingChatResponse | null> => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setStatus('connecting');
    setStatusMessage('Connecting...');
    setProgress(0);

    try {
      const response = await fetch(streamingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message,
          context,
          conversation_history: conversationHistory,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: StreamingChatResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEventType = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6);
          } else if (line === '' && currentEventType && currentData) {
            // End of event, process it
            try {
              const eventData: SSEEventData = JSON.parse(currentData);

              if (eventData.status) {
                setStatus(eventData.status);
                setStatusMessage(eventData.message || '');
                setProgress(eventData.progress || 0);
                onStatusChange?.(
                  eventData.status,
                  eventData.message || '',
                  eventData.progress || 0
                );
              }

              if (currentEventType === 'result' && eventData.result) {
                finalResult = eventData.result;
                onResult?.(eventData.result);
              }

              if (currentEventType === 'error' && eventData.error) {
                onError?.(eventData.error);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }

            // Reset for next event
            currentEventType = '';
            currentData = '';
          }
        }
      }

      return finalResult;

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus('error');
      setStatusMessage(errorMessage);
      onError?.(errorMessage);
      throw error; // Re-throw so caller can handle fallback

    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [streamingEndpoint, onStatusChange, onResult, onError]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStatus(null);
    setStatusMessage('');
    setProgress(0);
  }, []);

  return {
    sendMessage,
    cancel,
    isStreaming,
    status,
    statusMessage,
    progress,
  };
}
