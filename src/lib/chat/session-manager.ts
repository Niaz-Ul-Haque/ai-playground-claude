// Chat Session Manager - Phase 4: Session Management
// localStorage-based session persistence with auto-title generation

import type {
  ExtendedChatSession,
  ChatSessionSummary,
  SessionStorage,
  TitleGenerationConfig,
} from '@/types/chat-session';
import type { Message } from '@/types/chat';

const STORAGE_KEY = 'ciri_chat_sessions';
const STORAGE_VERSION = '1.0';
const MAX_SESSIONS = 50; // Maximum sessions to store
const MAX_TITLE_LENGTH = 50;

/**
 * Title generation patterns based on intent type
 */
const TITLE_PATTERNS: TitleGenerationConfig = {
  maxLength: MAX_TITLE_LENGTH,
  patterns: {
    list_tasks: 'Tasks overview',
    list_clients: 'Client list',
    list_opportunities: 'Opportunities',
    get_client: 'Client: {name}',
    get_task: 'Task: {title}',
    get_opportunity: 'Opportunity details',
    create_task: 'New task: {title}',
    create_client: 'New client: {name}',
    update_task: 'Task update',
    complete_task: 'Task completion',
    delete_task: 'Task deletion',
    search_clients: 'Client search: {query}',
    search_tasks: 'Task search: {query}',
    get_pipeline_summary: 'Pipeline summary',
    get_daily_brief: 'Daily brief',
    export_clients: 'Client export',
    export_tasks: 'Task export',
  },
  fallback: 'Chat session',
};

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Auto-generate a title from the first user message
 */
export function generateSessionTitle(
  firstMessage: string,
  intent?: string
): string {
  // Try to use intent-based pattern first
  if (intent && TITLE_PATTERNS.patterns[intent]) {
    const pattern = TITLE_PATTERNS.patterns[intent];
    // Extract relevant info from message for pattern substitution
    // This is a simplified version - could be enhanced with NLP
    return pattern
      .replace('{name}', extractName(firstMessage) || 'Unknown')
      .replace('{title}', extractTitle(firstMessage) || 'Untitled')
      .replace('{query}', firstMessage.slice(0, 30))
      .slice(0, TITLE_PATTERNS.maxLength);
  }

  // Fallback: Use first message content
  const cleanMessage = firstMessage
    .replace(/[^\w\s]/gi, '')
    .trim()
    .slice(0, MAX_TITLE_LENGTH);

  return cleanMessage || TITLE_PATTERNS.fallback;
}

/**
 * Extract a name from a message (simple heuristic)
 */
function extractName(message: string): string | null {
  // Look for patterns like "about John Smith" or "client Smith"
  const patterns = [
    /about\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /client\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extract a title from a message (simple heuristic)
 */
function extractTitle(message: string): string | null {
  // Look for quoted text or after "called" or "titled"
  const patterns = [
    /"([^"]+)"/,
    /called\s+([^,.\n]+)/i,
    /titled\s+([^,.\n]+)/i,
    /task\s+(?:to\s+)?(.+?)(?:\s+for|\s+by|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1].trim().slice(0, 40);
  }
  return null;
}

/**
 * Get session summary from full session
 */
function toSummary(session: ExtendedChatSession): ChatSessionSummary {
  const lastMessage =
    session.messages.length > 0
      ? session.messages[session.messages.length - 1].content.slice(0, 100)
      : '';

  return {
    id: session.id,
    title: session.title,
    lastMessage,
    messageCount: session.messages.length,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    isPinned: session.isPinned,
    primaryEntityType: undefined, // Could be derived from session content
  };
}

/**
 * Load all sessions from localStorage
 */
function loadSessions(): ExtendedChatSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored);

    // Version check for future migrations
    if (data.version !== STORAGE_VERSION) {
      console.warn('Session storage version mismatch, clearing old data');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return data.sessions || [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

/**
 * Save all sessions to localStorage
 */
function saveSessions(sessions: ExtendedChatSession[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Limit number of sessions (keep pinned + most recent)
    const pinnedSessions = sessions.filter((s) => s.isPinned);
    const unpinnedSessions = sessions
      .filter((s) => !s.isPinned)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, MAX_SESSIONS - pinnedSessions.length);

    const sessionsToSave = [...pinnedSessions, ...unpinnedSessions];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        sessions: sessionsToSave,
      })
    );
  } catch (error) {
    console.error('Failed to save sessions:', error);
    // If storage is full, try removing oldest sessions
    if (
      error instanceof Error &&
      error.name === 'QuotaExceededError'
    ) {
      const trimmedSessions = sessions.slice(0, Math.floor(sessions.length / 2));
      saveSessions(trimmedSessions);
    }
  }
}

/**
 * Session Manager Singleton
 */
class SessionManager implements SessionStorage {
  private sessions: ExtendedChatSession[];
  private listeners: Array<() => void> = [];

  constructor() {
    this.sessions = loadSessions();
  }

  /**
   * Subscribe to session changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Reload sessions from storage (for multi-tab sync)
   */
  reload(): void {
    this.sessions = loadSessions();
    this.notify();
  }

  /**
   * Get all session summaries
   */
  getSessions(): ChatSessionSummary[] {
    return this.sessions.map(toSummary).sort((a, b) => {
      // Pinned first, then by date
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }

  /**
   * Get a full session by ID
   */
  getSession(id: string): ExtendedChatSession | null {
    return this.sessions.find((s) => s.id === id) || null;
  }

  /**
   * Create a new session
   */
  createSession(
    firstMessage?: Message,
    intent?: string
  ): ExtendedChatSession {
    const now = new Date().toISOString();
    const title = firstMessage
      ? generateSessionTitle(firstMessage.content, intent)
      : 'New conversation';

    const session: ExtendedChatSession = {
      id: generateSessionId(),
      title,
      messages: firstMessage ? [firstMessage] : [],
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      entityContext: {},
    };

    this.sessions.unshift(session);
    saveSessions(this.sessions);
    this.notify();

    return session;
  }

  /**
   * Save (update) a session
   */
  saveSession(session: ExtendedChatSession): void {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    const updatedSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      this.sessions[index] = updatedSession;
    } else {
      this.sessions.unshift(updatedSession);
    }

    saveSessions(this.sessions);
    this.notify();
  }

  /**
   * Add a message to a session
   */
  addMessage(sessionId: string, message: Message): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();

    // Auto-update title if this is the first user message
    if (
      session.messages.length === 1 &&
      message.role === 'user' &&
      session.title === 'New conversation'
    ) {
      session.title = generateSessionTitle(message.content);
    }

    this.saveSession(session);
  }

  /**
   * Update the last message in a session (for streaming)
   */
  updateLastMessage(
    sessionId: string,
    content: string,
    append: boolean = false
  ): void {
    const session = this.getSession(sessionId);
    if (!session || session.messages.length === 0) return;

    const lastIndex = session.messages.length - 1;
    const lastMessage = session.messages[lastIndex];

    if (append) {
      session.messages[lastIndex] = {
        ...lastMessage,
        content: lastMessage.content + content,
      };
    } else {
      session.messages[lastIndex] = {
        ...lastMessage,
        content,
      };
    }

    session.updatedAt = new Date().toISOString();
    this.saveSession(session);
  }

  /**
   * Delete a session
   */
  deleteSession(id: string): boolean {
    const index = this.sessions.findIndex((s) => s.id === id);
    if (index < 0) return false;

    this.sessions.splice(index, 1);
    saveSessions(this.sessions);
    this.notify();

    return true;
  }

  /**
   * Toggle pin status
   */
  togglePin(id: string): boolean {
    const session = this.getSession(id);
    if (!session) return false;

    session.isPinned = !session.isPinned;
    session.updatedAt = new Date().toISOString();
    this.saveSession(session);

    return session.isPinned;
  }

  /**
   * Update session title
   */
  updateTitle(id: string, title: string): boolean {
    const session = this.getSession(id);
    if (!session) return false;

    session.title = title.slice(0, MAX_TITLE_LENGTH);
    session.updatedAt = new Date().toISOString();
    this.saveSession(session);

    return true;
  }

  /**
   * Update session entity context
   */
  updateEntityContext(
    id: string,
    context: ExtendedChatSession['entityContext']
  ): boolean {
    const session = this.getSession(id);
    if (!session) return false;

    session.entityContext = {
      ...session.entityContext,
      ...context,
    };
    session.updatedAt = new Date().toISOString();
    this.saveSession(session);

    return true;
  }

  /**
   * Search sessions by query
   */
  searchSessions(query: string): ChatSessionSummary[] {
    if (!query.trim()) return this.getSessions();

    const lowerQuery = query.toLowerCase();
    return this.sessions
      .filter((session) => {
        // Search in title
        if (session.title.toLowerCase().includes(lowerQuery)) return true;

        // Search in messages
        return session.messages.some((msg) =>
          msg.content.toLowerCase().includes(lowerQuery)
        );
      })
      .map(toSummary)
      .sort((a, b) => {
        // Pinned first, then by relevance (title match first)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const aInTitle = a.title.toLowerCase().includes(lowerQuery);
        const bInTitle = b.title.toLowerCase().includes(lowerQuery);
        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;

        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
  }

  /**
   * Get recent sessions (for sidebar)
   */
  getRecentSessions(limit: number = 10): ChatSessionSummary[] {
    return this.getSessions().slice(0, limit);
  }

  /**
   * Get pinned sessions
   */
  getPinnedSessions(): ChatSessionSummary[] {
    return this.getSessions().filter((s) => s.isPinned);
  }

  /**
   * Clear all sessions
   */
  clearAll(): void {
    this.sessions = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.notify();
  }

  /**
   * Export sessions for backup
   */
  exportSessions(): string {
    return JSON.stringify({
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      sessions: this.sessions,
    });
  }

  /**
   * Import sessions from backup
   */
  importSessions(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
        throw new Error('Invalid session data format');
      }

      // Merge with existing sessions, avoiding duplicates
      const existingIds = new Set(this.sessions.map((s) => s.id));
      const newSessions = parsed.sessions.filter(
        (s: ExtendedChatSession) => !existingIds.has(s.id)
      );

      this.sessions = [...this.sessions, ...newSessions];
      saveSessions(this.sessions);
      this.notify();

      return true;
    } catch (error) {
      console.error('Failed to import sessions:', error);
      return false;
    }
  }
}

// Singleton instance
let sessionManagerInstance: SessionManager | null = null;

/**
 * Get the session manager instance
 */
export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
}

// Export types for convenience
export type { ExtendedChatSession, ChatSessionSummary };
