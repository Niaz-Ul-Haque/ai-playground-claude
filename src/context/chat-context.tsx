'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { ChatState, ChatAction, ChatContextValue } from '@/types/state';
import type { Message, ChatContext as ApiChatContext, EmailComposerCardData, StreamingStatus } from '@/types/chat';
import { sendChatMessage } from '@/services/chat-service';
import { listClients } from '@/services/clients-service';
import { listTasks, approveTask, rejectTask, completeTask } from '@/services/tasks-service';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import {
  loadConversationContext,
  saveConversationContext,
  clearConversationContext,
  appendContextData,
  recordAction,
  setFocusedEntity,
  getContextForApi,
  type AccumulatedContext,
} from '@/lib/chat/storage';

const STREAMING_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_STREAM_ENDPOINT || '';

const initialState: ChatState = {
  messages: [],
  tasks: [],
  clients: [],
  isLoading: false,
  error: null,
  currentContext: {},
  streamingStatus: null,
  streamingProgress: 0,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };

    case 'APPEND_TO_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, content: msg.content + action.payload.content }
            : msg
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_CONTEXT':
      return {
        ...state,
        currentContext: {
          ...state.currentContext,
          ...action.payload,
        },
      };

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };

    case 'SET_CLIENTS':
      return {
        ...state,
        clients: action.payload,
      };

    case 'SET_STREAMING_STATUS':
      return {
        ...state,
        streamingStatus: action.payload.status,
        streamingProgress: action.payload.progress,
      };

    case 'RESET_CHAT':
      return {
        ...state,
        messages: [],
        error: null,
        currentContext: {},
        streamingStatus: null,
        streamingProgress: 0,
      };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const pendingMessageIdRef = useRef<string | null>(null);

  // Streaming chat hook
  const streaming = useStreamingChat({
    streamingEndpoint: STREAMING_ENDPOINT,
    onStatusChange: (status, message, progress) => {
      dispatch({
        type: 'SET_STREAMING_STATUS',
        payload: { status, progress },
      });

      // Update the pending message metadata with real streaming status
      if (pendingMessageIdRef.current) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: pendingMessageIdRef.current,
            updates: {
              metadata: {
                step: message,
                streamingStatus: status,
                streamingProgress: progress,
              },
            },
          },
        });
      }
    },
  });

  // Load context from localStorage on mount
  useEffect(() => {
    const storedContext = loadConversationContext();
    if (storedContext.focused_client_id || storedContext.focused_task_id || storedContext.focused_policy_id) {
      dispatch({
        type: 'SET_CONTEXT',
        payload: {
          focused_client_id: storedContext.focused_client_id,
          focused_task_id: storedContext.focused_task_id,
          focused_policy_id: storedContext.focused_policy_id,
        },
      });
    }
  }, []);

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tasksData, clientsData] = await Promise.all([
          listTasks(),
          listClients(),
        ]);
        dispatch({ type: 'SET_TASKS', payload: tasksData as any });
        dispatch({ type: 'SET_CLIENTS', payload: clientsData as any });
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      const tasksData = await listTasks();
      dispatch({ type: 'SET_TASKS', payload: tasksData as any });
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  }, []);

  const refreshClients = useCallback(async () => {
    try {
      const clientsData = await listClients();
      dispatch({ type: 'SET_CLIENTS', payload: clientsData as any });
    } catch (error) {
      console.error('Failed to refresh clients:', error);
    }
  }, []);

  /**
   * Non-streaming fallback: uses the original /api/chat endpoint
   */
  const sendNonStreamingMessage = useCallback(async (
    content: string,
    pendingMessageId: string,
    apiContext: ApiChatContext & Record<string, unknown>
  ) => {
    const response = await sendChatMessage(content, state.messages, apiContext as ApiChatContext);

    if (response) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: pendingMessageId,
          updates: {
            status: 'typing',
            content: response.message,
            cards: response.cards,
            metadata: undefined,
          },
        },
      });

      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: pendingMessageId,
            updates: { status: 'complete' },
          },
        });
      }, 800);

      if (response.context) {
        const contextUpdate = {
          focused_client_id: response.context.client_id,
          focused_policy_id: response.context.policy_id,
          focused_task_id: response.context.task_id,
        };
        dispatch({ type: 'SET_CONTEXT', payload: contextUpdate });

        if (response.context.client_id) setFocusedEntity('client', response.context.client_id);
        if (response.context.policy_id) setFocusedEntity('policy', response.context.policy_id);
        if (response.context.task_id) setFocusedEntity('task', response.context.task_id);
      }

      await refreshTasks();
    } else {
      throw new Error('No response from server');
    }
  }, [state.messages, refreshTasks]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    // Create pending assistant message
    const pendingMessageId = `assistant-${Date.now()}`;
    pendingMessageIdRef.current = pendingMessageId;
    const pendingMessage: Message = {
      id: pendingMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'pending',
      metadata: { step: 'Connecting...' },
    };
    dispatch({ type: 'ADD_MESSAGE', payload: pendingMessage });

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Get accumulated context from localStorage
      const accumulatedContext = getContextForApi();

      // Build context for API
      const apiContext: ApiChatContext & Record<string, unknown> = {
        current_client_id: state.currentContext.focused_client_id,
        current_policy_id: state.currentContext.focused_policy_id,
        current_task_id: state.currentContext.focused_task_id,
        current_view: state.currentContext.current_view,
        ...accumulatedContext,
      };

      // Build conversation history for streaming
      const conversationHistory = state.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Try streaming first, fall back to non-streaming
      const useStreaming = !!STREAMING_ENDPOINT;

      if (useStreaming) {
        try {
          const result = await streaming.sendMessage(
            content,
            {
              focused_client_id: state.currentContext.focused_client_id,
              focused_policy_id: state.currentContext.focused_policy_id,
              focused_task_id: state.currentContext.focused_task_id,
              ...accumulatedContext,
            },
            conversationHistory
          );

          if (result) {
            // Transition to typing then complete
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: pendingMessageId,
                updates: {
                  status: 'typing',
                  content: result.content,
                  cards: result.cards,
                  metadata: undefined,
                },
              },
            });

            setTimeout(() => {
              dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                  id: pendingMessageId,
                  updates: { status: 'complete' },
                },
              });
            }, 800);

            // Update context from streaming response
            if (result.context) {
              const ctx = result.context;
              const contextUpdate = {
                focused_client_id: ctx.focused_client_id,
                focused_policy_id: ctx.focused_policy_id,
                focused_task_id: ctx.focused_task_id,
              };
              dispatch({ type: 'SET_CONTEXT', payload: contextUpdate });

              if (ctx.focused_client_id) setFocusedEntity('client', ctx.focused_client_id);
              if (ctx.focused_policy_id) setFocusedEntity('policy', ctx.focused_policy_id);
              if (ctx.focused_task_id) setFocusedEntity('task', ctx.focused_task_id);
            }

            if (result.tasks_updated) {
              await refreshTasks();
            }
          } else {
            // null result means aborted, do nothing
          }
        } catch (streamError) {
          console.warn('Streaming failed, falling back to non-streaming:', streamError);
          await sendNonStreamingMessage(content, pendingMessageId, apiContext);
        }
      } else {
        // No streaming endpoint configured, use non-streaming
        await sendNonStreamingMessage(content, pendingMessageId, apiContext);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred',
      });

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: pendingMessageId,
          updates: {
            content: 'Sorry, I encountered an error processing your request. Please try again.',
            status: 'complete',
            metadata: undefined,
          },
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({
        type: 'SET_STREAMING_STATUS',
        payload: { status: null, progress: 0 },
      });
      pendingMessageIdRef.current = null;
    }
  }, [state.currentContext, state.messages, refreshTasks, streaming, sendNonStreamingMessage]);

  const cancelMessage = useCallback(() => {
    streaming.cancel();
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({
      type: 'SET_STREAMING_STATUS',
      payload: { status: null, progress: 0 },
    });

    // Update the pending message to show cancelled
    if (pendingMessageIdRef.current) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: pendingMessageIdRef.current,
          updates: {
            content: 'Request cancelled.',
            status: 'complete',
            metadata: undefined,
          },
        },
      });
      pendingMessageIdRef.current = null;
    }
  }, [streaming]);

  const handleApproveTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const success = await approveTask(taskId);
      if (success) {
        await refreshTasks();

        recordAction('approve', 'task', taskId, 'success');

        const confirmMessage: Message = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: 'Task approved successfully!',
          timestamp: new Date().toISOString(),
          cards: [{
            type: 'confirmation',
            data: {
              type: 'success',
              message: 'Task has been approved and marked as complete.',
            },
          }],
        };
        dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage });
      }
    } catch (error) {
      console.error('Error approving task:', error);
      recordAction('approve', 'task', taskId, 'error');
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to approve task',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshTasks]);

  const handleRejectTask = useCallback(async (taskId: string, reason?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const success = await rejectTask(taskId, reason);
      if (success) {
        await refreshTasks();

        recordAction('reject', 'task', taskId, 'success');

        const confirmMessage: Message = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: 'Task rejected and returned to pending.',
          timestamp: new Date().toISOString(),
          cards: [{
            type: 'confirmation',
            data: {
              type: 'info',
              message: 'Task has been rejected and returned to pending status.',
            },
          }],
        };
        dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage });
      }
    } catch (error) {
      console.error('Error rejecting task:', error);
      recordAction('reject', 'task', taskId, 'error');
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to reject task',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshTasks]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const success = await completeTask(taskId);
      if (success) {
        await refreshTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to complete task',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshTasks]);

  const handleViewClient = useCallback((clientId: string) => {
    dispatch({
      type: 'SET_CONTEXT',
      payload: { focused_client_id: clientId },
    });
    setFocusedEntity('client', clientId);
  }, []);

  const handleUndo = useCallback(() => {
    console.log('Undo not yet implemented');
  }, []);

  const handleResetChat = useCallback(() => {
    streaming.cancel();
    dispatch({ type: 'RESET_CHAT' });
    clearConversationContext();
  }, [streaming]);

  // Phase 1: Action handlers
  const handleSendEmail = useCallback(async (emailData: EmailComposerCardData) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { sendEmail } = await import('@/services/actions-service');
      const result = await sendEmail(emailData);

      if (result.success) {
        recordAction('send_email', 'email', emailData.related_task_id || 'direct', 'success');

        const confirmMessage: Message = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: `Email sent successfully to ${emailData.to}!`,
          timestamp: new Date().toISOString(),
          cards: [{
            type: 'confirmation',
            data: {
              type: 'success',
              message: `Email "${emailData.subject}" has been sent to ${emailData.to}.`,
            },
          }],
        };
        dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage });

        if (emailData.related_task_id) {
          await refreshTasks();
        }
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      recordAction('send_email', 'email', emailData.related_task_id || 'direct', 'error');

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to send email.',
        timestamp: new Date().toISOString(),
        cards: [{
          type: 'confirmation',
          data: {
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to send email. Please try again.',
          },
        }],
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshTasks]);

  const handleCopyToClipboard = useCallback(async (content: string) => {
    try {
      const { copyToClipboard } = await import('@/services/actions-service');
      const result = await copyToClipboard(content);

      if (result.success) {
        const confirmMessage: Message = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: 'Content copied to clipboard!',
          timestamp: new Date().toISOString(),
          cards: [{
            type: 'confirmation',
            data: {
              type: 'success',
              message: 'Content has been copied to your clipboard.',
            },
          }],
        };
        dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage });
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }, []);

  const handleExecuteAction = useCallback(async (
    actionType: string,
    entityType: string,
    entityId: string,
    payload?: Record<string, unknown>
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { executeAction } = await import('@/services/actions-service');
      const result = await executeAction(actionType, entityType, entityId, payload);

      if (result.success) {
        recordAction(actionType, entityType as 'task' | 'client' | 'policy' | 'email', entityId, 'success');

        const confirmMessage: Message = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: result.message || 'Action completed successfully!',
          timestamp: new Date().toISOString(),
          cards: [{
            type: 'confirmation',
            data: {
              type: 'success',
              message: result.message || `${actionType} completed successfully.`,
            },
          }],
        };
        dispatch({ type: 'ADD_MESSAGE', payload: confirmMessage });

        if (entityType === 'task') {
          await refreshTasks();
        } else if (entityType === 'client') {
          await refreshClients();
        }
      } else {
        throw new Error(result.error || `Failed to execute ${actionType}`);
      }
    } catch (error) {
      console.error(`Error executing action ${actionType}:`, error);
      recordAction(actionType, entityType as 'task' | 'client' | 'policy' | 'email', entityId, 'error');

      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : `Failed to execute ${actionType}`,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshTasks, refreshClients]);

  const contextValue: ChatContextValue = {
    ...state,
    sendMessage,
    cancelMessage,
    handleApproveTask,
    handleRejectTask,
    handleCompleteTask,
    handleViewClient,
    handleUndo,
    handleResetChat,
    refreshTasks,
    refreshClients,
    // Phase 1: Action handlers
    handleSendEmail,
    handleCopyToClipboard,
    handleExecuteAction,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
