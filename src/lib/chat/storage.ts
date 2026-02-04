/**
 * Chat Storage - localStorage persistence for conversation context
 * 
 * This module handles saving and loading accumulated context data
 * so that the AI has full context when sending messages.
 */

const STORAGE_KEY = 'ai-chat-context';
const STORAGE_VERSION = 1;

export interface AccumulatedContext {
  version: number;
  // Current focus
  focused_client_id?: string;
  focused_client_name?: string;
  focused_policy_id?: string;
  focused_policy_number?: string;
  focused_task_id?: string;
  focused_task_title?: string;
  // Collected data from conversation
  collected_client_ids?: string[];
  collected_policy_ids?: string[];
  collected_task_ids?: string[];
  // User preferences inferred during conversation
  preferences?: {
    preferred_contact_method?: 'email' | 'phone' | 'sms';
    communication_style?: 'formal' | 'casual';
  };
  // Action history (for context)
  recent_actions?: Array<{
    action: string;
    entity_type: 'task' | 'client' | 'policy' | 'email';
    entity_id: string;
    timestamp: string;
    result?: 'success' | 'error';
  }>;
  // Pending drafts/content that hasn't been sent
  pending_drafts?: Array<{
    type: 'email' | 'meeting_notes' | 'proposal';
    content: unknown;
    created_at: string;
  }>;
  // Session metadata
  session_started_at: string;
  last_updated_at: string;
}

function createEmptyContext(): AccumulatedContext {
  const now = new Date().toISOString();
  return {
    version: STORAGE_VERSION,
    collected_client_ids: [],
    collected_policy_ids: [],
    collected_task_ids: [],
    recent_actions: [],
    pending_drafts: [],
    session_started_at: now,
    last_updated_at: now,
  };
}

/**
 * Load accumulated context from localStorage
 */
export function loadConversationContext(): AccumulatedContext {
  if (typeof window === 'undefined') {
    return createEmptyContext();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyContext();
    }

    const parsed = JSON.parse(stored) as AccumulatedContext;
    
    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      // Version mismatch - reset context
      return createEmptyContext();
    }

    return parsed;
  } catch (error) {
    console.error('Error loading conversation context:', error);
    return createEmptyContext();
  }
}

/**
 * Save accumulated context to localStorage
 */
export function saveConversationContext(context: AccumulatedContext): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const toSave: AccumulatedContext = {
      ...context,
      version: STORAGE_VERSION,
      last_updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving conversation context:', error);
  }
}

/**
 * Clear conversation context (on new chat or refresh)
 */
export function clearConversationContext(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing conversation context:', error);
  }
}

/**
 * Append new data to accumulated context
 */
export function appendContextData(
  updates: Partial<Omit<AccumulatedContext, 'version' | 'session_started_at'>>
): AccumulatedContext {
  const current = loadConversationContext();
  
  const updated: AccumulatedContext = {
    ...current,
    ...updates,
    // Merge arrays instead of replacing
    collected_client_ids: Array.from(new Set([
      ...(current.collected_client_ids || []),
      ...(updates.collected_client_ids || []),
    ])),
    collected_policy_ids: Array.from(new Set([
      ...(current.collected_policy_ids || []),
      ...(updates.collected_policy_ids || []),
    ])),
    collected_task_ids: Array.from(new Set([
      ...(current.collected_task_ids || []),
      ...(updates.collected_task_ids || []),
    ])),
    recent_actions: [
      ...(current.recent_actions || []),
      ...(updates.recent_actions || []),
    ].slice(-20), // Keep last 20 actions
    pending_drafts: updates.pending_drafts !== undefined 
      ? updates.pending_drafts 
      : current.pending_drafts,
    last_updated_at: new Date().toISOString(),
  };

  saveConversationContext(updated);
  return updated;
}

/**
 * Record an action in the context
 */
export function recordAction(
  action: string,
  entityType: 'task' | 'client' | 'policy' | 'email',
  entityId: string,
  result?: 'success' | 'error'
): void {
  appendContextData({
    recent_actions: [{
      action,
      entity_type: entityType,
      entity_id: entityId,
      timestamp: new Date().toISOString(),
      result,
    }],
  });
}

/**
 * Update focused entity
 */
export function setFocusedEntity(
  type: 'client' | 'policy' | 'task',
  id: string,
  name?: string
): AccumulatedContext {
  const updates: Partial<AccumulatedContext> = {};
  
  switch (type) {
    case 'client':
      updates.focused_client_id = id;
      updates.focused_client_name = name;
      updates.collected_client_ids = [id];
      break;
    case 'policy':
      updates.focused_policy_id = id;
      updates.focused_policy_number = name;
      updates.collected_policy_ids = [id];
      break;
    case 'task':
      updates.focused_task_id = id;
      updates.focused_task_title = name;
      updates.collected_task_ids = [id];
      break;
  }
  
  return appendContextData(updates);
}

/**
 * Save a pending draft
 */
export function savePendingDraft(
  type: 'email' | 'meeting_notes' | 'proposal',
  content: unknown
): void {
  const current = loadConversationContext();
  const drafts = current.pending_drafts || [];
  
  appendContextData({
    pending_drafts: [
      ...drafts,
      {
        type,
        content,
        created_at: new Date().toISOString(),
      },
    ],
  });
}

/**
 * Clear pending drafts
 */
export function clearPendingDrafts(): void {
  appendContextData({
    pending_drafts: [],
  });
}

/**
 * Convert accumulated context to API format for sending to backend
 */
export function getContextForApi(): Record<string, unknown> {
  const context = loadConversationContext();
  
  return {
    focused_client_id: context.focused_client_id,
    focused_client_name: context.focused_client_name,
    focused_policy_id: context.focused_policy_id,
    focused_task_id: context.focused_task_id,
    collected_entities: {
      client_ids: context.collected_client_ids,
      policy_ids: context.collected_policy_ids,
      task_ids: context.collected_task_ids,
    },
    recent_actions: context.recent_actions?.slice(-5), // Last 5 actions for context
    has_pending_drafts: (context.pending_drafts?.length || 0) > 0,
    session_started_at: context.session_started_at,
  };
}
