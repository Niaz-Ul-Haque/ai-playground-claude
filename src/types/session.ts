// Session and authentication types

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  type: 'guest' | 'user';
  user?: User;
  createdAt: string;
  expiresAt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview?: string;
  /** Preview of last message */
  lastMessage?: string;
  /** Whether session is pinned */
  isPinned?: boolean;
}

export interface SessionState {
  session: Session | null;
  isLoading: boolean;
  chatSessions: ChatSession[];
  activeChatSessionId: string | null;
}

export interface SessionContextType extends SessionState {
  signIn: (email: string, password?: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => void;
  continueAsGuest: () => void;
  claimWorkspace: (email: string) => Promise<void>;
  createChatSession: () => ChatSession;
  selectChatSession: (id: string) => void;
  deleteChatSession: (id: string) => void;
  updateChatSessionTitle: (id: string, title: string) => void;
  togglePinChatSession: (id: string) => void;
}

export type SessionAction =
  | { type: 'SET_SESSION'; payload: Session }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CHAT_SESSIONS'; payload: ChatSession[] }
  | { type: 'ADD_CHAT_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_CHAT_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_CHAT_SESSION'; payload: string }
  | { type: 'SET_ACTIVE_CHAT_SESSION'; payload: string | null };
