import type { UserIntent, IntentClassification, ExtractedEntities } from '@/types/intent';
import type { ChatState } from '@/types/state';

const INTENT_PATTERNS: Record<UserIntent, RegExp[]> = {
  show_todays_tasks: [
    /what.*do.*i.*have.*today/i,
    /today'?s.*tasks?/i,
    /tasks?.*for.*today/i,
    /what'?s.*on.*my.*schedule.*today/i,
    /show.*today/i,
  ],
  show_task_status: [
    /status.*on/i,
    /update.*on/i,
    /how'?s.*the/i,
    /what'?s.*happening.*with/i,
  ],
  show_pending_reviews: [
    /what.*needs?.*(?:my )?(?:approval|review)/i,
    /pending.*reviews?/i,
    /what.*(?:should|can|must).*i.*(?:approve|review)/i,
    /show.*(?:pending|reviews?)/i,
  ],
  approve_task: [
    /approve(?:.*(?:it|that|this))?$/i,
    /looks?.*good/i,
    /(?:go|send).*ahead/i,
    /confirm(?:.*(?:it|that|this))?$/i,
    /yes.*(?:approve|send)/i,
  ],
  reject_task: [
    /(?:don'?t|do not).*(?:send|approve)/i,
    /reject(?:.*(?:it|that|this))?$/i,
    /cancel(?:.*(?:it|that|this))?$/i,
    /no.*(?:don'?t|do not)/i,
  ],
  show_client_info: [
    /tell.*me.*about/i,
    /who.*is/i,
    /show.*(?:me )?(?:client|profile)/i,
    /(?:info|information).*(?:on|about|for)/i,
  ],
  complete_task: [
    /mark.*(?:as )?(?:done|complete)/i,
    /complete.*(?:the|that)/i,
    /finish.*(?:the|that)/i,
    /i.*(?:completed|finished|did)/i,
  ],
  general_question: [],
};

export function parseIntent(message: string, context?: ChatState['currentContext']): IntentClassification {
  const normalized = message.toLowerCase().trim();

  // Check for pattern matches
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [UserIntent, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        const entities = extractEntities(message);
        const resolvedEntities = resolveReferences(entities, context);

        return {
          intent,
          entities: resolvedEntities,
          confidence: 0.9,
        };
      }
    }
  }

  // Default to general question
  return {
    intent: 'general_question',
    entities: extractEntities(message),
    confidence: 0.5,
  };
}

export function extractEntities(message: string): ExtractedEntities {
  const entities: ExtractedEntities = {};

  // Extract potential client names (capitalized words)
  const nameMatch = message.match(/\b([A-Z][a-z]+(?:\s+(?:and\s+)?[A-Z][a-z]+)*)\b/);
  if (nameMatch) {
    entities.clientName = nameMatch[1];
  }

  // Extract dates
  const todayMatch = /\btoday\b/i.test(message);
  const tomorrowMatch = /\btomorrow\b/i.test(message);
  const thisWeekMatch = /\bthis\s+week\b/i.test(message);

  if (todayMatch) {
    entities.date = 'today';
  } else if (tomorrowMatch) {
    entities.date = 'tomorrow';
  } else if (thisWeekMatch) {
    entities.date = 'week';
  }

  // Extract action keywords
  const actionMatch = message.match(/\b(approve|reject|complete|send|cancel)\b/i);
  if (actionMatch) {
    entities.action = actionMatch[1].toLowerCase();
  }

  return entities;
}

export function resolveReferences(
  entities: ExtractedEntities,
  context?: ChatState['currentContext']
): ExtractedEntities {
  const resolved = { ...entities };

  // Resolve "it", "that", "this" references
  const hasReference = /\b(?:it|that|this)\b/i.test(JSON.stringify(entities));

  if (hasReference && context) {
    if (context.focusedTaskId && !resolved.taskId) {
      resolved.taskId = context.focusedTaskId;
    }

    if (context.focusedClientId && !resolved.clientId) {
      resolved.clientId = context.focusedClientId;
    }
  }

  return resolved;
}
