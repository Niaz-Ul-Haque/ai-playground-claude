'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ChatState, ChatAction, ChatContext as ChatContextType } from '@/types/state';
import type { Message } from '@/types/chat';
import { getTasks, updateTask, getClients } from '@/lib/mock-data';

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

    case 'UPDATE_TASK':
      const updatedTask = updateTask(action.payload.id, action.payload.updates);
      if (updatedTask) {
        return {
          ...state,
          tasks: state.tasks.map(task =>
            task.id === action.payload.id ? updatedTask : task
          ),
        };
      }
      return state;

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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load initial data
  useEffect(() => {
    const tasks = getTasks();
    const clients = getClients();
    dispatch({ type: 'SET_TASKS', payload: tasks });
    dispatch({ type: 'SET_CLIENTS', payload: clients });
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: state.currentContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        cards: data.cards,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

      // Update context if provided
      if (data.context) {
        dispatch({ type: 'SET_CONTEXT', payload: data.context });
      }

      // Refresh tasks if they were updated
      if (data.tasksUpdated) {
        const tasks = getTasks();
        dispatch({ type: 'SET_TASKS', payload: tasks });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred',
      });

      // Add error message
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
  }, [state.currentContext]);

  const handleApproveTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Update task status to completed
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          id: taskId,
          updates: {
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
        },
      });

      // Send confirmation message
      await sendMessage(`Approve task ${taskId}`);
    } catch (error) {
      console.error('Error approving task:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to approve task',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [sendMessage]);

  const handleRejectTask = useCallback(async (taskId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Update task status back to pending
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          id: taskId,
          updates: {
            status: 'pending',
            aiCompleted: false,
            aiCompletionData: undefined,
          },
        },
      });

      // Send confirmation message
      await sendMessage(`Reject task ${taskId}`);
    } catch (error) {
      console.error('Error rejecting task:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to reject task',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [sendMessage]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: {
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      },
    });

    const tasks = getTasks();
    dispatch({ type: 'SET_TASKS', payload: tasks });
  }, []);

  const handleViewClient = useCallback((clientId: string) => {
    dispatch({
      type: 'SET_CONTEXT',
      payload: { focusedClientId: clientId },
    });
  }, []);

  const handleUndo = useCallback(() => {
    // TODO: Implement undo functionality
    console.log('Undo not yet implemented');
  }, []);

  const handleResetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  const contextValue: ChatContextType = {
    ...state,
    sendMessage,
    handleApproveTask,
    handleRejectTask,
    handleCompleteTask,
    handleViewClient,
    handleUndo,
    handleResetChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
