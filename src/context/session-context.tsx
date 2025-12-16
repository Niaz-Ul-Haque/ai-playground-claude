'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  Session,
  ChatSession,
  SessionState,
  SessionContextType,
  SessionAction,
} from '@/types/session';

const STORAGE_KEY = 'ciri_session';
const CHAT_SESSIONS_KEY = 'ciri_chat_sessions';

const initialState: SessionState = {
  session: null,
  isLoading: true,
  chatSessions: [],
  activeChatSessionId: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        isLoading: false,
      };

    case 'CLEAR_SESSION':
      return {
        ...state,
        session: null,
        isLoading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_CHAT_SESSIONS':
      return {
        ...state,
        chatSessions: action.payload,
      };

    case 'ADD_CHAT_SESSION':
      return {
        ...state,
        chatSessions: [action.payload, ...state.chatSessions],
        activeChatSessionId: action.payload.id,
      };

    case 'UPDATE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        ),
      };

    case 'DELETE_CHAT_SESSION':
      const filtered = state.chatSessions.filter(s => s.id !== action.payload);
      return {
        ...state,
        chatSessions: filtered,
        activeChatSessionId:
          state.activeChatSessionId === action.payload
            ? filtered[0]?.id || null
            : state.activeChatSessionId,
      };

    case 'SET_ACTIVE_CHAT_SESSION':
      return {
        ...state,
        activeChatSessionId: action.payload,
      };

    default:
      return state;
  }
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      const storedChatSessions = localStorage.getItem(CHAT_SESSIONS_KEY);

      if (storedSession) {
        const session = JSON.parse(storedSession) as Session;
        dispatch({ type: 'SET_SESSION', payload: session });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      if (storedChatSessions) {
        const chatSessions = JSON.parse(storedChatSessions) as ChatSession[];
        dispatch({ type: 'SET_CHAT_SESSIONS', payload: chatSessions });
        if (chatSessions.length > 0) {
          dispatch({ type: 'SET_ACTIVE_CHAT_SESSION', payload: chatSessions[0].id });
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Persist session to localStorage and cookies
  useEffect(() => {
    if (state.session) {
      const sessionJson = JSON.stringify(state.session);
      localStorage.setItem(STORAGE_KEY, sessionJson);
      // Set cookie for middleware - ensure it's not a guest session for protected routes
      document.cookie = `ciri_session=${encodeURIComponent(sessionJson)}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      // Remove cookie
      document.cookie = 'ciri_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [state.session]);

  // Persist chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(state.chatSessions));
  }, [state.chatSessions]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signIn = useCallback(async (email: string, password?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const session: Session = {
      id: `session-${Date.now()}`,
      type: 'user',
      user: {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    // Set cookie immediately before dispatch
    document.cookie = `ciri_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=2592000; SameSite=Lax`;
    
    dispatch({ type: 'SET_SESSION', payload: session });
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate sending magic link
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, immediately sign in after "sending" magic link
    const session: Session = {
      id: `session-${Date.now()}`,
      type: 'user',
      user: {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    // Set cookie immediately before dispatch
    document.cookie = `ciri_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=2592000; SameSite=Lax`;
    
    dispatch({ type: 'SET_SESSION', payload: session });
  }, []);

  const signOut = useCallback(() => {
    dispatch({ type: 'CLEAR_SESSION' });
    localStorage.removeItem(STORAGE_KEY);
    // Remove cookie
    document.cookie = 'ciri_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/login');
  }, [router]);

  const continueAsGuest = useCallback(() => {
    const session: Session = {
      id: `guest-${Date.now()}`,
      type: 'guest',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'SET_SESSION', payload: session });
  }, []);

  const claimWorkspace = useCallback(async (email: string) => {
    if (!state.session || state.session.type !== 'guest') {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const session: Session = {
      ...state.session,
      type: 'user',
      user: {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      },
    };

    // Set cookie immediately before dispatch
    document.cookie = `ciri_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=2592000; SameSite=Lax`;
    
    dispatch({ type: 'SET_SESSION', payload: session });
  }, [state.session]);

  const createChatSession = useCallback((): ChatSession => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };

    dispatch({ type: 'ADD_CHAT_SESSION', payload: newSession });
    return newSession;
  }, []);

  const selectChatSession = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT_SESSION', payload: id });
  }, []);

  const deleteChatSession = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CHAT_SESSION', payload: id });
  }, []);

  const updateChatSessionTitle = useCallback((id: string, title: string) => {
    dispatch({
      type: 'UPDATE_CHAT_SESSION',
      payload: { id, updates: { title, updatedAt: new Date().toISOString() } },
    });
  }, []);

  const contextValue: SessionContextType = {
    ...state,
    signIn,
    signInWithMagicLink,
    signOut,
    continueAsGuest,
    claimWorkspace,
    createChatSession,
    selectChatSession,
    deleteChatSession,
    updateChatSessionTitle,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
