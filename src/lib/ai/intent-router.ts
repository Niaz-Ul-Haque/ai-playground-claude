// Intent Router - Phase 1: Core Infrastructure
// Routes user messages to appropriate tools using LLM classification

import type {
  ExecutionPlan,
  IntentCategory,
  IntentRoutingContext,
  IntentClassificationResult,
  ExtractedEntities,
  MultiMatch,
  ConfidenceLevel,
} from '@/types/execution-plan';
import type { EntityType, ToolRenderBlock } from '@/types/tools';
import { getTool, generateToolPrompt } from './tool-registry';
import {
  getClientByName,
  getClients,
  getTasks,
} from '@/lib/mock-data';

// ============================================
// Intent Classification Prompt
// ============================================

/**
 * System prompt for intent classification
 */
export function getClassificationSystemPrompt(): string {
  return `You are an intent classifier for a financial advisor AI assistant called Ciri.
Your job is to analyze user messages and determine:
1. What the user wants to do (intent category)
2. Which tool should handle this request
3. What arguments to pass to the tool
4. Whether clarification is needed

${generateToolPrompt()}

## Response Format
Respond with a JSON object:
{
  "intent": "<intent_category>",
  "tool": "<tool_name>",
  "arguments": { ... },
  "confidence": <0.0-1.0>,
  "requiresClarification": false,
  "clarification": null,
  "reasoning": "Brief explanation of your classification"
}

If clarification is needed:
{
  "intent": "<intent_category>",
  "tool": "<tool_name>",
  "arguments": { ... },
  "confidence": <0.0-1.0>,
  "requiresClarification": true,
  "clarification": {
    "field": "<parameter_name>",
    "reason": "Why clarification is needed",
    "question": "Question to ask the user",
    "options": ["option1", "option2"]
  }
}

## Intent Categories
- read: Viewing/listing data
- search: Searching for data
- create: Creating new records
- update: Modifying records
- delete: Deleting/archiving records
- summarize: Getting summaries
- report: Generating reports
- export: Exporting data
- workflow: Workflow operations
- automation: Automation operations
- integration: Integration operations
- help: Asking for help
- general: General conversation
- confirm: Confirming a pending action
- cancel: Canceling a pending action
- undo: Undoing the last action

## Important Rules
1. If the user refers to "it", "that", "this", etc., check the context for what they're referring to
2. For destructive actions (delete, archive), always recommend confirmation
3. If multiple entities match a name, flag for disambiguation
4. Default to high confidence only when the intent is unambiguous
5. For partial/unclear names, try to find the best match or ask for clarification`;
}

/**
 * Build classification prompt with context
 */
export function buildClassificationPrompt(
  message: string,
  context: IntentRoutingContext
): string {
  let contextInfo = '';

  if (context.focusedClientId || context.focusedTaskId || context.focusedOpportunityId) {
    contextInfo += '\n\n## Current Context\n';
    if (context.focusedClientId) {
      contextInfo += `Currently focused on client ID: ${context.focusedClientId}\n`;
    }
    if (context.focusedTaskId) {
      contextInfo += `Currently focused on task ID: ${context.focusedTaskId}\n`;
    }
    if (context.focusedOpportunityId) {
      contextInfo += `Currently focused on opportunity ID: ${context.focusedOpportunityId}\n`;
    }
  }

  if (context.lastIntent) {
    contextInfo += `Last intent: ${context.lastIntent}\n`;
  }

  if (context.lastTool) {
    contextInfo += `Last tool used: ${context.lastTool}\n`;
  }

  if (context.pendingAction) {
    contextInfo += `\nPending action awaiting confirmation: ${context.pendingAction.plan.tool}\n`;
    contextInfo += `Pending action message: ${context.pendingAction.message}\n`;
  }

  if (context.recentEntities && context.recentEntities.length > 0) {
    contextInfo += '\nRecent entities mentioned:\n';
    for (const entity of context.recentEntities.slice(0, 5)) {
      contextInfo += `- ${entity.type}: ${entity.name} (ID: ${entity.id})\n`;
    }
  }

  return `${contextInfo}

## User Message
"${message}"

Classify this message and return a JSON response.`;
}

// ============================================
// Entity Extraction
// ============================================

/**
 * Extract entities from a message using pattern matching
 */
export function extractEntities(
  message: string,
  context: IntentRoutingContext
): ExtractedEntities {
  const entities: ExtractedEntities = {};

  // Extract potential client names (capitalized words that might be names)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const potentialNames: string[] = [];
  let match;
  while ((match = namePattern.exec(message)) !== null) {
    // Filter out common non-name words
    const nonNames = ['I', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
      'November', 'December', 'Today', 'Tomorrow', 'Week', 'Month', 'Year', 'Task', 'Client', 'Show',
      'List', 'Create', 'Update', 'Delete', 'High', 'Medium', 'Low', 'Done', 'Complete', 'Pending'];
    if (!nonNames.includes(match[1])) {
      potentialNames.push(match[1]);
    }
  }
  if (potentialNames.length > 0) {
    entities.clientNames = potentialNames;
  }

  // Extract dates
  const datePatterns = [
    { pattern: /\btoday\b/i, type: 'relative' as const },
    { pattern: /\btomorrow\b/i, type: 'relative' as const },
    { pattern: /\bnext\s+(?:week|month|monday|tuesday|wednesday|thursday|friday)\b/i, type: 'relative' as const },
    { pattern: /\bthis\s+(?:week|month)\b/i, type: 'relative' as const },
    { pattern: /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/, type: 'absolute' as const },
    { pattern: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?\b/i, type: 'absolute' as const },
  ];

  const dates: Array<{ raw: string; parsed: string; type: 'absolute' | 'relative' }> = [];
  for (const { pattern, type } of datePatterns) {
    const dateMatch = message.match(pattern);
    if (dateMatch) {
      dates.push({
        raw: dateMatch[0],
        parsed: parseDateString(dateMatch[0]),
        type,
      });
    }
  }
  if (dates.length > 0) {
    entities.dates = dates;
  }

  // Extract priorities
  const priorityMatch = message.match(/\b(high|medium|low)\s*priority\b/i);
  if (priorityMatch) {
    entities.priorities = [priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low'];
  }

  // Extract references to context
  const references: Array<{ type: 'it' | 'that' | 'this' | 'them' | 'those'; resolvedTo?: string; resolvedType?: EntityType }> = [];

  if (/\bit\b/i.test(message)) {
    const ref: { type: 'it'; resolvedTo?: string; resolvedType?: EntityType } = { type: 'it' };
    if (context.focusedTaskId) {
      ref.resolvedTo = context.focusedTaskId;
      ref.resolvedType = 'task';
    } else if (context.focusedClientId) {
      ref.resolvedTo = context.focusedClientId;
      ref.resolvedType = 'client';
    }
    references.push(ref);
  }

  if (/\bthat\b/i.test(message)) {
    const ref: { type: 'that'; resolvedTo?: string; resolvedType?: EntityType } = { type: 'that' };
    if (context.focusedTaskId) {
      ref.resolvedTo = context.focusedTaskId;
      ref.resolvedType = 'task';
    } else if (context.focusedOpportunityId) {
      ref.resolvedTo = context.focusedOpportunityId;
      ref.resolvedType = 'opportunity';
    }
    references.push(ref);
  }

  if (/\bthis\b/i.test(message)) {
    const ref: { type: 'this'; resolvedTo?: string; resolvedType?: EntityType } = { type: 'this' };
    if (context.focusedTaskId) {
      ref.resolvedTo = context.focusedTaskId;
      ref.resolvedType = 'task';
    }
    references.push(ref);
  }

  if (references.length > 0) {
    entities.references = references;
  }

  // Extract numbers/amounts
  const numberPattern = /\$?[\d,]+(?:\.\d{2})?\b/g;
  const numbers: number[] = [];
  let numMatch;
  while ((numMatch = numberPattern.exec(message)) !== null) {
    const cleaned = numMatch[0].replace(/[$,]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      numbers.push(num);
    }
  }
  if (numbers.length > 0) {
    entities.numbers = numbers;
  }

  return entities;
}

/**
 * Parse date string to ISO format
 */
function parseDateString(dateStr: string): string {
  const now = new Date();
  const lower = dateStr.toLowerCase();

  if (lower === 'today') {
    return now.toISOString().split('T')[0];
  }

  if (lower === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (lower.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  if (lower.includes('next month')) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  }

  // Try to parse as-is
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return dateStr;
}

// ============================================
// Fallback Intent Classification
// ============================================

/**
 * Pattern-based fallback intent classification
 * Used when LLM classification is unavailable or fails
 * Phase 7: Enhanced intent coverage for all 41 tools
 */
export function classifyIntentFallback(
  message: string,
  context: IntentRoutingContext,
  entities: ExtractedEntities
): ExecutionPlan {
  const lower = message.toLowerCase();

  // ==========================================
  // Confirmation patterns (for pending actions)
  // ==========================================
  if (context.pendingAction) {
    if (/\b(yes|confirm|approve|ok|okay|sure|go ahead|do it|proceed|affirmative)\b/i.test(message)) {
      return {
        intent: 'confirm',
        tool: context.pendingAction.plan.tool,
        arguments: context.pendingAction.plan.arguments,
        renderAs: context.pendingAction.plan.renderAs,
        requiresConfirmation: false,
        confidence: 0.9,
        confidenceLevel: 'high',
        originalMessage: message,
      };
    }
    if (/\b(no|cancel|don't|stop|never mind|abort|negative|nope)\b/i.test(message)) {
      return {
        intent: 'cancel',
        tool: 'cancel_action',
        arguments: { actionId: context.pendingAction.id },
        renderAs: 'confirmation',
        requiresConfirmation: false,
        confidence: 0.9,
        confidenceLevel: 'high',
        originalMessage: message,
      };
    }
  }

  // ==========================================
  // Undo pattern (highest priority)
  // ==========================================
  if (/\b(undo|revert|rollback|take.*back)\b/i.test(lower)) {
    return createPlan('undo', 'undo_action', {}, 'confirmation', 0.95, message);
  }

  // ==========================================
  // HELP patterns
  // ==========================================
  if (/\b(help|what can you do|how do i|capabilities|commands)\b/i.test(lower)) {
    return createPlan('help', 'general_response', { topic: 'help' }, 'text', 0.9, message);
  }

  // ==========================================
  // DELETE/ARCHIVE patterns (require confirmation)
  // ==========================================
  if (/\b(delete|remove|trash)\b/i.test(lower)) {
    if (/\btask/i.test(lower) && context.focusedTaskId) {
      return createPlan('delete', 'delete_task', { id: context.focusedTaskId }, 'confirm-action', 0.85, message);
    }
    if (/\btask/i.test(lower)) {
      // Extract task reference from message
      const taskMatch = message.match(/(?:delete|remove)\s+(?:the\s+)?(?:task\s+)?["']?([^"']+)["']?/i);
      if (taskMatch) {
        return createPlan('delete', 'delete_task', { title: taskMatch[1].trim() }, 'confirm-action', 0.75, message);
      }
    }
  }

  if (/\b(archive)\b/i.test(lower)) {
    if (/\bclient/i.test(lower) && context.focusedClientId) {
      return createPlan('delete', 'archive_client', { id: context.focusedClientId }, 'confirm-action', 0.85, message);
    }
    if (/\bopportunit/i.test(lower) && context.focusedOpportunityId) {
      return createPlan('delete', 'archive_opportunity', { id: context.focusedOpportunityId }, 'confirm-action', 0.85, message);
    }
    if (entities.clientNames && entities.clientNames.length > 0) {
      return createPlan('delete', 'archive_client', { name: entities.clientNames[0] }, 'confirm-action', 0.75, message);
    }
  }

  // ==========================================
  // EXPORT patterns
  // ==========================================
  if (/\b(export|download|csv|json|spreadsheet)\b/i.test(lower)) {
    const format = /\bjson\b/i.test(lower) ? 'json' : 'csv';

    if (/\bclient/i.test(lower)) {
      return createPlan('export', 'export_clients', { format }, 'export-download', 0.9, message);
    }
    if (/\btask/i.test(lower)) {
      return createPlan('export', 'export_tasks', { format }, 'export-download', 0.9, message);
    }
    if (/\bopportunit|pipeline/i.test(lower)) {
      return createPlan('export', 'export_opportunities', { format }, 'export-download', 0.9, message);
    }

    // Generic export - default to clients
    if (/\bexport\b/i.test(lower) && !/\b(client|task|opportunit)/i.test(lower)) {
      return createPlan('export', 'export_clients', { format }, 'export-download', 0.6, message);
    }
  }

  // ==========================================
  // REPORT/STATS patterns
  // ==========================================
  if (/\b(stats|statistics|metrics|report|summary|overview|dashboard|how\s*many|how's|how\s*is|breakdown)\b/i.test(lower)) {
    if (/\bclient/i.test(lower)) {
      return createPlan('report', 'get_client_stats', {}, 'chart', 0.85, message);
    }
    if (/\btask|workload|busy|productivity/i.test(lower)) {
      return createPlan('report', 'get_task_stats', {}, 'chart', 0.85, message);
    }
    if (/\bopportunit|pipeline|sales|revenue/i.test(lower)) {
      return createPlan('report', 'get_opportunity_stats', {}, 'chart', 0.85, message);
    }
    if (/\bworkload|capacity|schedule/i.test(lower)) {
      return createPlan('report', 'get_workload_summary', {}, 'chart', 0.85, message);
    }
    if (/\bpipeline/i.test(lower)) {
      return createPlan('report', 'get_pipeline_summary', {}, 'chart', 0.85, message);
    }

    // Generic stats - show task stats as default
    return createPlan('report', 'get_task_stats', {}, 'chart', 0.6, message);
  }

  // ==========================================
  // TASK patterns
  // ==========================================
  if (/\b(tasks?|todo|to-?do|work items?|action items?)\b/i.test(lower)) {
    // Create task patterns
    if (/\b(create|add|new|make|schedule)\b/i.test(lower)) {
      const titleMatch = message.match(/(?:create|add|new|make|schedule)\s+(?:a\s+)?(?:task\s+)?(?:to\s+|for\s+)?(.+)/i);
      const title = titleMatch ? titleMatch[1].trim() : 'New Task';

      // Extract priority if mentioned
      let priority = 'medium';
      if (/\b(high|urgent|important|critical)\b/i.test(lower)) priority = 'high';
      if (/\b(low|minor|whenever)\b/i.test(lower)) priority = 'low';

      // Extract due date if mentioned
      const dueDate = entities.dates && entities.dates.length > 0
        ? entities.dates[0].parsed
        : undefined;

      return createPlan('create', 'create_task', {
        title,
        priority,
        dueDate,
        clientId: context.focusedClientId,
      }, 'confirmation', 0.8, message);
    }

    // Complete/finish task patterns
    if (/\b(complete|done|finish|mark.*done|mark.*complete|completed|finished)\b/i.test(lower)) {
      if (context.focusedTaskId) {
        return createPlan('update', 'complete_task', { id: context.focusedTaskId }, 'confirmation', 0.9, message);
      }
      // Try to find task by reference
      const taskMatch = message.match(/(?:complete|finish|mark)\s+(?:the\s+)?(?:task\s+)?["']?([^"']+)["']?\s+(?:as\s+)?(?:done|complete)?/i);
      if (taskMatch) {
        return createPlan('update', 'complete_task', { title: taskMatch[1].trim() }, 'confirmation', 0.75, message);
      }
    }

    // Update task patterns
    if (/\b(update|change|modify|edit|set|reschedule)\b/i.test(lower)) {
      if (context.focusedTaskId) {
        const updates: Record<string, unknown> = { id: context.focusedTaskId };
        if (/\bhigh\s*priority\b/i.test(lower)) updates.priority = 'high';
        if (/\bmedium\s*priority\b/i.test(lower)) updates.priority = 'medium';
        if (/\blow\s*priority\b/i.test(lower)) updates.priority = 'low';
        if (entities.dates && entities.dates.length > 0) {
          updates.dueDate = entities.dates[0].parsed;
        }
        return createPlan('update', 'update_task', updates, 'confirmation', 0.8, message);
      }
    }

    // Filter patterns
    if (/\b(today|today's|for today)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { dueDate: 'today' }, 'task-list', 0.9, message);
    }
    if (/\b(this week|week's|weekly)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { dueDate: 'week' }, 'task-list', 0.85, message);
    }
    if (/\b(overdue|late|missed|past due)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { dueDate: 'overdue' }, 'task-list', 0.9, message);
    }
    if (/\b(high\s*priority|urgent|important|critical)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { priority: 'high' }, 'task-list', 0.85, message);
    }
    if (/\b(pending|not done|incomplete|open)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { status: 'pending' }, 'task-list', 0.85, message);
    }
    if (/\b(in progress|working on|active)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { status: 'in-progress' }, 'task-list', 0.85, message);
    }
    if (/\b(completed|done|finished)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { status: 'completed' }, 'task-list', 0.85, message);
    }
    if (/\b(ai completed|ciri did|auto|automatic)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { aiCompleted: true }, 'task-list', 0.85, message);
    }

    // Search task patterns
    if (/\b(search|find|look for|where is)\b/i.test(lower)) {
      const queryMatch = message.match(/(?:search|find|look for|where is)\s+(?:task\s+)?["']?([^"']+)["']?/i);
      if (queryMatch) {
        return createPlan('search', 'search_tasks', { query: queryMatch[1].trim() }, 'task-list', 0.8, message);
      }
    }

    // Default to list all tasks
    return createPlan('read', 'list_tasks', {}, 'task-list', 0.75, message);
  }

  // ==========================================
  // CLIENT patterns
  // ==========================================
  if (/\b(clients?|customers?|contacts?|people)\b/i.test(lower)) {
    // Create client patterns
    if (/\b(create|add|new|register)\b/i.test(lower)) {
      const nameMatch = message.match(/(?:create|add|new|register)\s+(?:a\s+)?(?:client|customer)?\s*(?:named?\s+)?["']?([^"',]+)["']?/i);
      const name = nameMatch ? nameMatch[1].trim() : 'New Client';
      return createPlan('create', 'create_client', { name, status: 'prospect' }, 'confirmation', 0.8, message);
    }

    // Update client patterns
    if (/\b(update|change|modify|edit)\b/i.test(lower) && context.focusedClientId) {
      return createPlan('update', 'update_client', { id: context.focusedClientId }, 'confirmation', 0.75, message);
    }

    // Filter patterns
    if (/\b(conservative)\b/i.test(lower)) {
      return createPlan('read', 'list_clients', { riskProfile: 'conservative' }, 'client-table', 0.85, message);
    }
    if (/\b(moderate)\b/i.test(lower)) {
      return createPlan('read', 'list_clients', { riskProfile: 'moderate' }, 'client-table', 0.85, message);
    }
    if (/\b(aggressive|high risk)\b/i.test(lower)) {
      return createPlan('read', 'list_clients', { riskProfile: 'aggressive' }, 'client-table', 0.85, message);
    }
    if (/\b(active)\b/i.test(lower)) {
      return createPlan('read', 'list_clients', { status: 'active' }, 'client-table', 0.85, message);
    }
    if (/\b(prospect|potential|new)\b/i.test(lower)) {
      return createPlan('read', 'list_clients', { status: 'prospect' }, 'client-table', 0.85, message);
    }

    // Search client patterns
    if (/\b(search|find|look for|where is)\b/i.test(lower)) {
      const queryMatch = message.match(/(?:search|find|look for|where is)\s+(?:client\s+)?["']?([^"']+)["']?/i);
      if (queryMatch) {
        return createPlan('search', 'search_clients', { query: queryMatch[1].trim() }, 'client-table', 0.8, message);
      }
    }

    // Get specific client by name
    if (entities.clientNames && entities.clientNames.length > 0) {
      return createPlan('read', 'get_client', { name: entities.clientNames[0] }, 'client-profile', 0.8, message);
    }

    // Default to list all clients
    return createPlan('read', 'list_clients', {}, 'client-table', 0.75, message);
  }

  // ==========================================
  // "Tell me about X" / "Show me X's" patterns
  // ==========================================
  if (/\b(tell\s*me\s*about|show\s*me|who\s*is|what\s*about|info\s*on|details?\s*(?:about|for|on))\b/i.test(lower)) {
    if (entities.clientNames && entities.clientNames.length > 0) {
      return createPlan('read', 'get_client', { name: entities.clientNames[0] }, 'client-profile', 0.85, message);
    }
  }

  // ==========================================
  // OPPORTUNITY patterns
  // ==========================================
  if (/\b(opportunit|pipeline|leads?|deals?|prospects?)\b/i.test(lower)) {
    // Create opportunity patterns
    if (/\b(create|add|new|log)\b/i.test(lower)) {
      const titleMatch = message.match(/(?:create|add|new|log)\s+(?:an?\s+)?(?:opportunity|deal|lead)?\s*(?:for\s+)?["']?([^"']+)["']?/i);
      const title = titleMatch ? titleMatch[1].trim() : 'New Opportunity';
      return createPlan('create', 'create_opportunity', {
        title,
        clientId: context.focusedClientId,
        type: 'milestone',
      }, 'confirmation', 0.75, message);
    }

    // Snooze opportunity patterns
    if (/\b(snooze|delay|postpone|remind\s*me\s*later|defer)\b/i.test(lower)) {
      if (context.focusedOpportunityId) {
        let duration = '1_week';
        if (/\bday\b/i.test(lower)) duration = '1_day';
        if (/\b3\s*days?\b/i.test(lower)) duration = '3_days';
        if (/\bweek\b/i.test(lower)) duration = '1_week';
        if (/\b2\s*weeks?\b/i.test(lower)) duration = '2_weeks';
        if (/\bmonth\b/i.test(lower)) duration = '1_month';
        return createPlan('update', 'snooze_opportunity', { id: context.focusedOpportunityId, duration }, 'confirmation', 0.85, message);
      }
    }

    // Dismiss opportunity patterns
    if (/\b(dismiss|remove|not\s*interested|pass|skip)\b/i.test(lower)) {
      if (context.focusedOpportunityId) {
        return createPlan('update', 'dismiss_opportunity', {
          id: context.focusedOpportunityId,
          reason: 'not_relevant',
        }, 'confirmation', 0.85, message);
      }
    }

    // Filter patterns
    if (/\b(new|fresh)\b/i.test(lower)) {
      return createPlan('read', 'list_opportunities', { status: 'new' }, 'opportunity-list', 0.85, message);
    }
    if (/\b(high\s*impact|important|priority)\b/i.test(lower)) {
      return createPlan('read', 'list_opportunities', { impactLevel: 'high' }, 'opportunity-list', 0.85, message);
    }
    if (/\b(snoozed|delayed|deferred)\b/i.test(lower)) {
      return createPlan('read', 'list_opportunities', { status: 'snoozed' }, 'opportunity-list', 0.85, message);
    }
    if (/\b(contract|renewal)\b/i.test(lower)) {
      return createPlan('read', 'list_opportunities', { type: 'contract' }, 'opportunity-list', 0.85, message);
    }
    if (/\b(milestone|life\s*event)\b/i.test(lower)) {
      return createPlan('read', 'list_opportunities', { type: 'milestone' }, 'opportunity-list', 0.85, message);
    }
    if (/\b(market)\b/i.test(lower)) {
      return createPlan('read', 'list_opportunities', { type: 'market' }, 'opportunity-list', 0.85, message);
    }

    // Summary/overview patterns
    if (/\b(summary|overview|stats)\b/i.test(lower)) {
      return createPlan('report', 'get_pipeline_summary', {}, 'chart', 0.85, message);
    }

    // Default to list opportunities
    return createPlan('read', 'list_opportunities', {}, 'opportunity-list', 0.75, message);
  }

  // ==========================================
  // APPROVAL/REJECTION patterns
  // ==========================================
  if (/\b(approve|approved|looks?\s*good|send\s*it|go\s*ahead|ship\s*it|lgtm)\b/i.test(lower)) {
    if (context.focusedTaskId) {
      return createPlan('update', 'approve_task', { id: context.focusedTaskId }, 'confirmation', 0.9, message);
    }
  }

  if (/\b(reject|don't\s*send|cancel|stop|don't\s*approve|decline)\b/i.test(lower)) {
    if (context.focusedTaskId) {
      return createPlan('update', 'reject_task', { id: context.focusedTaskId }, 'confirmation', 0.9, message);
    }
  }

  // ==========================================
  // REVIEW patterns
  // ==========================================
  if (/\b(review|reviews?|pending\s*approval|needs?\s*(?:my\s+)?(?:approval|review)|what\s*needs?\s*(?:my\s+)?approval)\b/i.test(lower)) {
    return createPlan('read', 'list_tasks', { status: 'needs-review' }, 'task-list', 0.85, message);
  }

  // ==========================================
  // WORKFLOW patterns
  // ==========================================
  if (/\b(workflows?|processes?|procedures?)\b/i.test(lower)) {
    // Start workflow patterns
    if (/\b(start|begin|initiate|launch|kick\s*off)\b/i.test(lower)) {
      let type: string = 'client_onboarding';
      if (/\b(onboard|new\s*client)\b/i.test(lower)) type = 'client_onboarding';
      if (/\b(annual|review)\b/i.test(lower)) type = 'annual_review';
      if (/\b(rebalance|portfolio)\b/i.test(lower)) type = 'portfolio_rebalance';
      if (/\b(insurance|renewal)\b/i.test(lower)) type = 'insurance_renewal';
      if (/\b(estate|planning)\b/i.test(lower)) type = 'estate_planning';
      if (/\b(tax)\b/i.test(lower)) type = 'tax_planning';

      return createPlan('workflow', 'start_workflow', {
        type,
        clientId: context.focusedClientId,
      }, 'workflow-status', 0.8, message);
    }

    // Filter patterns
    if (/\b(active|in\s*progress|running)\b/i.test(lower)) {
      return createPlan('read', 'list_workflows', { status: 'active' }, 'workflow-status', 0.85, message);
    }
    if (/\b(completed|done|finished)\b/i.test(lower)) {
      return createPlan('read', 'list_workflows', { status: 'completed' }, 'workflow-status', 0.85, message);
    }
    if (/\b(paused|stopped|on\s*hold)\b/i.test(lower)) {
      return createPlan('read', 'list_workflows', { status: 'paused' }, 'workflow-status', 0.85, message);
    }

    // Default to list active workflows
    return createPlan('read', 'list_workflows', { status: 'active' }, 'workflow-status', 0.75, message);
  }

  // ==========================================
  // AUTOMATION patterns
  // ==========================================
  if (/\b(automation|automate|automated|automatic)\b/i.test(lower)) {
    // Pause automation patterns
    if (/\b(pause|stop|halt|disable)\b/i.test(lower)) {
      return createPlan('update', 'pause_automation', {}, 'confirmation', 0.75, message);
    }

    // Resume automation patterns
    if (/\b(resume|restart|enable|reactivate)\b/i.test(lower)) {
      return createPlan('update', 'resume_automation', {}, 'confirmation', 0.75, message);
    }

    // Suggest automation patterns
    if (/\b(suggest|create|new|add)\b/i.test(lower)) {
      const descMatch = message.match(/(?:suggest|create|add)\s+(?:an?\s+)?automation\s+(?:to\s+|for\s+)?(.+)/i);
      const description = descMatch ? descMatch[1].trim() : 'New automation';
      return createPlan('create', 'suggest_automation', {
        description,
        category: 'communication',
      }, 'confirmation', 0.75, message);
    }

    // List patterns
    if (/\b(suggestion|recommend)\b/i.test(lower)) {
      return createPlan('read', 'list_automations', { type: 'suggestions' }, 'automation-list', 0.85, message);
    }
    if (/\b(active|running)\b/i.test(lower)) {
      return createPlan('read', 'list_automations', { type: 'active' }, 'automation-list', 0.85, message);
    }

    // Default to list all
    return createPlan('read', 'list_automations', {}, 'automation-list', 0.75, message);
  }

  // ==========================================
  // INTEGRATION patterns
  // ==========================================
  if (/\b(integrations?|connections?|linked\s*accounts?|connected\s*services?)\b/i.test(lower)) {
    return createPlan('read', 'list_integrations', {}, 'confirmation', 0.75, message);
  }

  // ==========================================
  // ACTIVITY/HISTORY patterns
  // ==========================================
  if (/\b(activity|activities|recent|what.*happened|history|timeline|events?|log)\b/i.test(lower)) {
    let limit = 20;
    if (/\b(all|everything)\b/i.test(lower)) limit = 50;
    if (/\b(last\s*5|five)\b/i.test(lower)) limit = 5;
    if (/\b(last\s*10|ten)\b/i.test(lower)) limit = 10;

    // Filter by entity type if mentioned
    let entityType: string | undefined;
    if (/\bclient/i.test(lower)) entityType = 'client';
    if (/\btask/i.test(lower)) entityType = 'task';
    if (/\bopportunit/i.test(lower)) entityType = 'opportunity';

    return createPlan('read', 'get_activity_feed', { limit, entityType }, 'timeline', 0.8, message);
  }

  // ==========================================
  // GREETING patterns
  // ==========================================
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings?|howdy)/i.test(lower.trim())) {
    return createPlan('general', 'general_response', { greeting: true }, 'text', 0.9, message);
  }

  // ==========================================
  // WHAT patterns (general queries)
  // ==========================================
  if (/^what('s|\s+is|\s+are|\s+do\s+i)/i.test(lower.trim())) {
    // "What do I have today?"
    if (/\b(today|scheduled|due)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { dueDate: 'today' }, 'task-list', 0.85, message);
    }
    // "What needs my attention?"
    if (/\b(needs?\s*(?:my\s+)?attention|priority|urgent|important)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { priority: 'high' }, 'task-list', 0.8, message);
    }
    // "What's pending?"
    if (/\b(pending|waiting|open)\b/i.test(lower)) {
      return createPlan('read', 'list_tasks', { status: 'pending' }, 'task-list', 0.8, message);
    }
  }

  // ==========================================
  // Default to general conversation
  // ==========================================
  return createPlan('general', 'general_response', {}, 'text', 0.5, message);
}

/**
 * Helper to create execution plan
 */
function createPlan(
  intent: IntentCategory,
  tool: string,
  args: Record<string, unknown>,
  renderAs: ToolRenderBlock,
  confidence: number,
  originalMessage: string
): ExecutionPlan {
  const toolDef = getTool(tool);

  return {
    intent,
    entity: toolDef?.entityType,
    tool,
    arguments: args,
    renderAs,
    requiresConfirmation: toolDef?.requiresConfirmation ?? false,
    confidence,
    confidenceLevel: getConfidenceLevel(confidence),
    originalMessage,
  };
}

/**
 * Get confidence level category
 */
function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

// ============================================
// Entity Resolution
// ============================================

/**
 * Resolve client by name, handling ambiguity
 */
export function resolveClient(
  name: string
): { id: string; name: string } | MultiMatch | null {
  // Try exact match first
  const exactMatch = getClientByName(name);
  if (exactMatch) {
    return { id: exactMatch.id, name: exactMatch.name };
  }

  // Try partial match
  const clients = getClients({ name });
  if (clients.length === 0) {
    return null;
  }
  if (clients.length === 1) {
    return { id: clients[0].id, name: clients[0].name };
  }

  // Multiple matches - need disambiguation
  return {
    entityType: 'client',
    matches: clients.slice(0, 5).map(c => ({
      id: c.id,
      displayName: c.name,
      summary: `${c.riskProfile} risk, $${c.portfolioValue.toLocaleString()} portfolio`,
    })),
    reason: `Found ${clients.length} clients matching "${name}"`,
  };
}

/**
 * Resolve task by title
 */
export function resolveTask(
  title: string
): { id: string; title: string } | MultiMatch | null {
  const tasks = getTasks({ searchTerm: title });

  if (tasks.length === 0) {
    return null;
  }
  if (tasks.length === 1) {
    return { id: tasks[0].id, title: tasks[0].title };
  }

  // Multiple matches
  return {
    entityType: 'task',
    matches: tasks.slice(0, 5).map(t => ({
      id: t.id,
      displayName: t.title,
      summary: `${t.status}, due ${t.dueDate}`,
    })),
    reason: `Found ${tasks.length} tasks matching "${title}"`,
  };
}

// ============================================
// Main Router Function
// ============================================

/**
 * Route a user message to an execution plan
 * This is the fallback synchronous version that doesn't use LLM
 */
export function routeIntent(
  message: string,
  context: IntentRoutingContext = {}
): IntentClassificationResult {
  // Extract entities from message
  const entities = extractEntities(message, context);

  // Get execution plan using fallback classification
  const plan = classifyIntentFallback(message, context, entities);

  // Attach extracted entities
  plan.extractedEntities = entities;

  // Resolve references and entities
  if (entities.clientNames && entities.clientNames.length > 0 && !plan.arguments.id && !plan.arguments.clientId) {
    const resolution = resolveClient(entities.clientNames[0]);
    if (resolution) {
      if ('matches' in resolution) {
        // Multi-match - need disambiguation
        plan.multiMatch = resolution;
        return {
          plan,
          readyForExecution: false,
          needsUserInput: true,
          userPrompt: `I found multiple clients matching "${entities.clientNames[0]}". Which one did you mean?`,
        };
      } else {
        // Single match - add to arguments
        if (plan.tool.includes('client')) {
          plan.arguments.id = resolution.id;
        } else {
          plan.arguments.clientId = resolution.id;
          plan.arguments.clientName = resolution.name;
        }
      }
    }
  }

  // Check if confirmation is required
  if (plan.requiresConfirmation) {
    const toolDef = getTool(plan.tool);
    return {
      plan,
      readyForExecution: false,
      confirmationMessage: `Are you sure you want to ${toolDef?.description.toLowerCase() || 'perform this action'}?`,
      needsUserInput: true,
    };
  }

  // Check if clarification is needed
  if (plan.clarificationNeeded) {
    return {
      plan,
      readyForExecution: false,
      needsUserInput: true,
      userPrompt: plan.clarificationNeeded.question,
    };
  }

  return {
    plan,
    readyForExecution: true,
  };
}

/**
 * Check if a tool requires an entity ID
 */
export function toolRequiresId(toolName: string): boolean {
  const toolsRequiringId = [
    'get_client', 'get_task', 'get_opportunity', 'get_workflow', 'get_automation',
    'update_task', 'complete_task', 'approve_task', 'reject_task',
    'update_opportunity', 'snooze_opportunity', 'dismiss_opportunity',
    'update_client', 'delete_task', 'archive_client', 'archive_opportunity',
    'pause_automation', 'resume_automation',
  ];
  return toolsRequiringId.includes(toolName);
}

/**
 * Update context after execution
 */
export function updateContextAfterExecution(
  context: IntentRoutingContext,
  plan: ExecutionPlan,
  result: { entityId?: string; entityType?: EntityType; entityName?: string }
): IntentRoutingContext {
  const updated: IntentRoutingContext = {
    ...context,
    lastIntent: plan.intent,
    lastTool: plan.tool,
    lastEntityType: plan.entity,
    pendingAction: undefined, // Clear any pending action after execution
  };

  // Update focused entity based on result
  if (result.entityId && result.entityType) {
    switch (result.entityType) {
      case 'client':
        updated.focusedClientId = result.entityId;
        break;
      case 'task':
        updated.focusedTaskId = result.entityId;
        break;
      case 'opportunity':
        updated.focusedOpportunityId = result.entityId;
        break;
    }

    // Add to recent entities
    if (result.entityName) {
      const recentEntities = context.recentEntities || [];
      updated.recentEntities = [
        {
          id: result.entityId,
          type: result.entityType,
          name: result.entityName,
          mentionedAt: new Date().toISOString(),
        },
        ...recentEntities.filter(e => e.id !== result.entityId).slice(0, 9),
      ];
    }
  }

  return updated;
}
