'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ChatState, ChatAction, ChatContextValue } from '@/types/state';
import type { Message, ChatContext as ApiChatContext } from '@/types/chat';
import { sendChatMessage } from '@/services/chat-service';
import { listClients } from '@/services/clients-service';
import { listTasks, approveTask, rejectTask, completeTask } from '@/services/tasks-service';

const initialState: ChatState = {
  messages: [],
  tasks: [],
  clients: [],
  isLoading: false,
  error: null,
  currentContext: {},
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
            ? { ...msg, content: action.payload.content, cards: action.payload.cards }
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

    case 'RESET_CHAT':
      return {
        ...state,
        messages: [],
        error: null,
        currentContext: {},
      };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tasksData, clientsData] = await Promise.all([
          listTasks(),
          listClients(),
        ]);
        // Convert TaskSummary[] to Task[] (they share compatible fields)
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

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Build context for API
      const apiContext: ApiChatContext = {
        current_client_id: state.currentContext.focused_client_id,
        current_policy_id: state.currentContext.focused_policy_id,
        current_task_id: state.currentContext.focused_task_id,
        current_view: state.currentContext.current_view,
      };

      const response = await sendChatMessage(content, state.messages, apiContext);

      if (response) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          cards: response.cards,
        };

        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

        // Update context if provided
        if (response.context) {
          dispatch({
            type: 'SET_CONTEXT',
            payload: {
              focused_client_id: response.context.client_id,
              focused_policy_id: response.context.policy_id,
              focused_task_id: response.context.task_id,
            },
          });
        }

        // Refresh tasks in case they were updated
        await refreshTasks();
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred',
      });

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentContext, state.messages, refreshTasks]);

  const handleApproveTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const success = await approveTask(taskId);
      if (success) {
        await refreshTasks();
        
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
  }, []);

  const handleUndo = useCallback(() => {
    console.log('Undo not yet implemented');
  }, []);

  const handleResetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  const contextValue: ChatContextValue = {
    ...state,
    sendMessage,
    handleApproveTask,
    handleRejectTask,
    handleCompleteTask,
    handleViewClient,
    handleUndo,
    handleResetChat,
    refreshTasks,
    refreshClients,
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
