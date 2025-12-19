'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getSessionManager,
  type ExtendedChatSession,
  type ChatSessionSummary,
} from '@/lib/chat/session-manager';
import type { Message } from '@/types/chat';
import type { StreamingStatus } from '@/types/chat-session';

interface UseChatSessionsOptions {
  autoCreateSession?: boolean;
}

interface UseChatSessionsReturn {
  // Session data
  sessions: ChatSessionSummary[];
  currentSession: ExtendedChatSession | null;
  currentSessionId: string | null;

  // Session actions
  createSession: (firstMessage?: Message, intent?: string) => string;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  pinSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  searchSessions: (query: string) => void;

  // Message actions
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string, append?: boolean) => void;

  // Context actions
  updateEntityContext: (context: ExtendedChatSession['entityContext']) => void;

  // Search state
  searchQuery: string;
  filteredSessions: ChatSessionSummary[];

  // Streaming state (managed locally for hook consumers)
  streamingStatus: StreamingStatus;
  setStreamingStatus: (status: StreamingStatus) => void;
  streamingText: string;
  appendStreamingText: (text: string) => void;
  clearStreaming: () => void;

  // Utilities
  isLoading: boolean;
  hasSession: boolean;
}

export function useChatSessions(
  options: UseChatSessionsOptions = {}
): UseChatSessionsReturn {
  const { autoCreateSession = true } = options;

  // Session state
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ExtendedChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Streaming state
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>('idle');
  const [streamingText, setStreamingText] = useState('');

  // Get session manager
  const sessionManager = useMemo(() => getSessionManager(), []);

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = () => {
      const allSessions = sessionManager.getSessions();
      setSessions(allSessions);

      // Auto-create session if none exists
      if (allSessions.length === 0 && autoCreateSession) {
        const newSession = sessionManager.createSession();
        setCurrentSessionId(newSession.id);
        setCurrentSession(newSession);
        setSessions(sessionManager.getSessions());
      } else if (allSessions.length > 0 && !currentSessionId) {
        // Select most recent session
        const mostRecent = allSessions[0];
        setCurrentSessionId(mostRecent.id);
        setCurrentSession(sessionManager.getSession(mostRecent.id));
      }

      setIsLoading(false);
    };

    loadSessions();

    // Subscribe to changes
    const unsubscribe = sessionManager.subscribe(() => {
      setSessions(sessionManager.getSessions());
      if (currentSessionId) {
        setCurrentSession(sessionManager.getSession(currentSessionId));
      }
    });

    // Handle storage events for multi-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ciri_chat_sessions') {
        sessionManager.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sessionManager, autoCreateSession, currentSessionId]);

  // Filtered sessions for search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    return sessionManager.searchSessions(searchQuery);
  }, [sessions, searchQuery, sessionManager]);

  // Create a new session
  const createSession = useCallback(
    (firstMessage?: Message, intent?: string): string => {
      const session = sessionManager.createSession(firstMessage, intent);
      setCurrentSessionId(session.id);
      setCurrentSession(session);
      return session.id;
    },
    [sessionManager]
  );

  // Select a session
  const selectSession = useCallback(
    (sessionId: string) => {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        setCurrentSession(session);
        // Clear streaming state when switching sessions
        setStreamingStatus('idle');
        setStreamingText('');
      }
    },
    [sessionManager]
  );

  // Delete a session
  const deleteSession = useCallback(
    (sessionId: string) => {
      sessionManager.deleteSession(sessionId);

      // If deleting current session, switch to another
      if (sessionId === currentSessionId) {
        const remaining = sessionManager.getSessions();
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else if (autoCreateSession) {
          createSession();
        } else {
          setCurrentSessionId(null);
          setCurrentSession(null);
        }
      }
    },
    [sessionManager, currentSessionId, selectSession, createSession, autoCreateSession]
  );

  // Pin/unpin a session
  const pinSession = useCallback(
    (sessionId: string) => {
      sessionManager.togglePin(sessionId);
    },
    [sessionManager]
  );

  // Rename a session
  const renameSession = useCallback(
    (sessionId: string, title: string) => {
      sessionManager.updateTitle(sessionId, title);
    },
    [sessionManager]
  );

  // Search sessions
  const searchSessions = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Add a message to current session
  const addMessage = useCallback(
    (message: Message) => {
      if (!currentSessionId) {
        // Create a new session with this message
        createSession(message);
      } else {
        sessionManager.addMessage(currentSessionId, message);
      }
    },
    [currentSessionId, sessionManager, createSession]
  );

  // Update the last message (for streaming)
  const updateLastMessage = useCallback(
    (content: string, append: boolean = false) => {
      if (currentSessionId) {
        sessionManager.updateLastMessage(currentSessionId, content, append);
      }
    },
    [currentSessionId, sessionManager]
  );

  // Update entity context
  const updateEntityContext = useCallback(
    (context: ExtendedChatSession['entityContext']) => {
      if (currentSessionId) {
        sessionManager.updateEntityContext(currentSessionId, context);
      }
    },
    [currentSessionId, sessionManager]
  );

  // Streaming helpers
  const appendStreamingText = useCallback((text: string) => {
    setStreamingText((prev) => prev + text);
  }, []);

  const clearStreaming = useCallback(() => {
    setStreamingStatus('idle');
    setStreamingText('');
  }, []);

  return {
    // Session data
    sessions,
    currentSession,
    currentSessionId,

    // Session actions
    createSession,
    selectSession,
    deleteSession,
    pinSession,
    renameSession,
    searchSessions,

    // Message actions
    addMessage,
    updateLastMessage,

    // Context actions
    updateEntityContext,

    // Search state
    searchQuery,
    filteredSessions,

    // Streaming state
    streamingStatus,
    setStreamingStatus,
    streamingText,
    appendStreamingText,
    clearStreaming,

    // Utilities
    isLoading,
    hasSession: !!currentSessionId,
  };
}
