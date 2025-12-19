'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import type { ChatState, ChatAction, ChatContext as ChatContextType } from '@/types/state';
import type { Message } from '@/types/chat';
import type { StreamingStatus } from '@/types/chat-session';
import { getTasks, updateTask, getClients } from '@/lib/mock-data';
import { getSessionManager } from '@/lib/chat/session-manager';

const initialState: ChatState = {
  messages: [],
  tasks: [],
  clients: [],
  isLoading: false,
  error: null,
  currentContext: {},
  // Session state (Phase 4)
  currentSessionId: null,
  sessions: [],
  streamingStatus: 'idle',
  streamingText: '',
  isSidebarOpen: true,
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
        streamingStatus: 'idle',
        streamingText: '',
      };

    // Session actions (Phase 4)
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSessionId: action.payload,
      };

    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      };

    case 'SET_STREAMING_STATUS':
      return {
        ...state,
        streamingStatus: action.payload,
      };

    case 'SET_STREAMING_TEXT':
      return {
        ...state,
        streamingText: action.payload,
      };

    case 'APPEND_STREAMING_TEXT':
      return {
        ...state,
        streamingText: state.streamingText + action.payload,
      };

    case 'CLEAR_STREAMING':
      return {
        ...state,
        streamingStatus: 'idle',
        streamingText: '',
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen,
      };

    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        isSidebarOpen: action.payload,
      };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Get session manager instance
  const sessionManager = useMemo(() => {
    if (typeof window !== 'undefined') {
      return getSessionManager();
    }
    return null;
  }, []);

  // Load initial data and sessions
  useEffect(() => {
    const tasks = getTasks();
    const clients = getClients();
    dispatch({ type: 'SET_TASKS', payload: tasks });
    dispatch({ type: 'SET_CLIENTS', payload: clients });

    // Load sessions
    if (sessionManager) {
      const sessions = sessionManager.getSessions();
      dispatch({ type: 'SET_SESSIONS', payload: sessions });

      // Auto-create or select session
      if (sessions.length === 0) {
        const newSession = sessionManager.createSession();
        dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession.id });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
        dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
      } else {
        // Select most recent session
        const mostRecent = sessions[0];
        const fullSession = sessionManager.getSession(mostRecent.id);
        dispatch({ type: 'SET_CURRENT_SESSION', payload: mostRecent.id });
        dispatch({ type: 'SET_MESSAGES', payload: fullSession?.messages || [] });
      }

      // Subscribe to session changes
      const unsubscribe = sessionManager.subscribe(() => {
        dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
      });

      return () => unsubscribe();
    }
  }, [sessionManager]);

  // Listen for session events from SessionContext (sidebar)
  useEffect(() => {
    const handleSessionCreated = (event: CustomEvent<{ sessionId: string }>) => {
      // Create new session in our session manager and sync state
      if (sessionManager) {
        const newSession = sessionManager.createSession();
        dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession.id });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
        dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
        dispatch({ type: 'CLEAR_STREAMING' });
        dispatch({ type: 'SET_CONTEXT', payload: {} });
      }
    };

    const handleSessionSelected = (event: CustomEvent<{ sessionId: string }>) => {
      // Try to find and load the session from our session manager
      if (sessionManager) {
        const { sessionId } = event.detail;
        // Look for a session that matches (by checking if messages exist or by timestamp)
        const sessions = sessionManager.getSessions();
        
        // Find best matching session - could be direct match or most recent
        let session = sessions.find(s => s.id === sessionId);
        if (!session && sessions.length > 0) {
          // Try to find by creation time proximity (within 1 second)
          const targetTime = parseInt(sessionId.replace('chat-', ''));
          session = sessions.find(s => {
            const sessionTime = parseInt(s.id.replace(/\D/g, ''));
            return Math.abs(sessionTime - targetTime) < 1000;
          });
        }
        
        if (session) {
          const fullSession = sessionManager.getSession(session.id);
          if (fullSession) {
            dispatch({ type: 'SET_CURRENT_SESSION', payload: session.id });
            dispatch({ type: 'SET_MESSAGES', payload: fullSession.messages });
            dispatch({ type: 'CLEAR_STREAMING' });
          }
        }
      }
    };

    window.addEventListener('chat-session-created', handleSessionCreated as EventListener);
    window.addEventListener('chat-session-selected', handleSessionSelected as EventListener);

    return () => {
      window.removeEventListener('chat-session-created', handleSessionCreated as EventListener);
      window.removeEventListener('chat-session-selected', handleSessionSelected as EventListener);
    };
  }, [sessionManager]);

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
    dispatch({ type: 'SET_STREAMING_STATUS', payload: 'thinking' as StreamingStatus });

    // Save user message to session
    if (sessionManager && state.currentSessionId) {
      sessionManager.addMessage(state.currentSessionId, userMessage);
    }

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
      dispatch({ type: 'SET_STREAMING_STATUS', payload: 'done' as StreamingStatus });

      // Save assistant message to session
      if (sessionManager && state.currentSessionId) {
        sessionManager.addMessage(state.currentSessionId, assistantMessage);
      }

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
      dispatch({ type: 'SET_STREAMING_STATUS', payload: 'error' as StreamingStatus });

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });

      // Save error message to session
      if (sessionManager && state.currentSessionId) {
        sessionManager.addMessage(state.currentSessionId, errorMessage);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setTimeout(() => {
        dispatch({ type: 'CLEAR_STREAMING' });
      }, 1000);
    }
  }, [state.currentContext, state.currentSessionId, sessionManager]);

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
    // TODO: Implement undo functionality with undo-manager
    console.log('Undo not yet implemented');
  }, []);

  const handleResetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });

    // Create a new session
    if (sessionManager) {
      const newSession = sessionManager.createSession();
      dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession.id });
      dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
    }
  }, [sessionManager]);

  // Session management actions (Phase 4)
  const createNewSession = useCallback(() => {
    if (sessionManager) {
      const newSession = sessionManager.createSession();
      dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession.id });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
      dispatch({ type: 'CLEAR_STREAMING' });
      dispatch({ type: 'SET_CONTEXT', payload: {} });
    }
  }, [sessionManager]);

  const selectSession = useCallback((sessionId: string) => {
    if (sessionManager) {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
        dispatch({ type: 'SET_MESSAGES', payload: session.messages });
        dispatch({ type: 'CLEAR_STREAMING' });
        // Restore entity context if available
        if (session.entityContext) {
          dispatch({
            type: 'SET_CONTEXT',
            payload: {
              focusedClientId: session.entityContext.focusedClientId,
              focusedTaskId: session.entityContext.focusedTaskId,
            },
          });
        }
      }
    }
  }, [sessionManager]);

  const deleteSession = useCallback((sessionId: string) => {
    if (sessionManager) {
      sessionManager.deleteSession(sessionId);

      // If deleting current session, switch to another
      if (sessionId === state.currentSessionId) {
        const remaining = sessionManager.getSessions();
        if (remaining.length > 0) {
          const nextSession = sessionManager.getSession(remaining[0].id);
          dispatch({ type: 'SET_CURRENT_SESSION', payload: remaining[0].id });
          dispatch({ type: 'SET_MESSAGES', payload: nextSession?.messages || [] });
        } else {
          // Create a new session
          const newSession = sessionManager.createSession();
          dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession.id });
          dispatch({ type: 'SET_MESSAGES', payload: [] });
        }
      }
      dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
    }
  }, [sessionManager, state.currentSessionId]);

  const pinSession = useCallback((sessionId: string) => {
    if (sessionManager) {
      sessionManager.togglePin(sessionId);
      dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
    }
  }, [sessionManager]);

  const renameSession = useCallback((sessionId: string, title: string) => {
    if (sessionManager) {
      sessionManager.updateTitle(sessionId, title);
      dispatch({ type: 'SET_SESSIONS', payload: sessionManager.getSessions() });
    }
  }, [sessionManager]);

  const searchSessions = useCallback((query: string) => {
    if (sessionManager) {
      const results = sessionManager.searchSessions(query);
      dispatch({ type: 'SET_SESSIONS', payload: results });
    }
  }, [sessionManager]);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
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
    // Session actions (Phase 4)
    createNewSession,
    selectSession,
    deleteSession,
    pinSession,
    renameSession,
    searchSessions,
    toggleSidebar,
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
