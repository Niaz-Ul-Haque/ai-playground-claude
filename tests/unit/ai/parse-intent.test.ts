import { describe, it, expect } from 'vitest';
import { parseIntent, extractEntities, resolveReferences } from '@/lib/ai/parse-intent';
import type { ChatState } from '@/types/state';

describe('parse-intent', () => {
  describe('parseIntent', () => {
    describe('show_todays_tasks intent', () => {
      it('should recognize "what do I have today"', () => {
        const result = parseIntent('What do I have today?');
        expect(result.intent).toBe('show_todays_tasks');
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it('should recognize "today\'s tasks"', () => {
        const result = parseIntent("Show me today's tasks");
        expect(result.intent).toBe('show_todays_tasks');
      });

      it('should recognize "tasks for today"', () => {
        const result = parseIntent('What tasks do I have for today?');
        expect(result.intent).toBe('show_todays_tasks');
      });

      it('should recognize "what\'s on my schedule today"', () => {
        const result = parseIntent("What's on my schedule today?");
        expect(result.intent).toBe('show_todays_tasks');
      });
    });

    describe('show_task_status intent', () => {
      it('should recognize "status on"', () => {
        const result = parseIntent('What is the status on the Johnson review?');
        expect(result.intent).toBe('show_task_status');
      });

      it('should recognize "update on"', () => {
        const result = parseIntent('Give me an update on the portfolio analysis');
        expect(result.intent).toBe('show_task_status');
      });

      it('should recognize "how\'s the"', () => {
        const result = parseIntent("How's the Chen email going?");
        expect(result.intent).toBe('show_task_status');
      });
    });

    describe('show_pending_reviews intent', () => {
      it('should recognize "what needs my approval"', () => {
        const result = parseIntent('What needs my approval?');
        expect(result.intent).toBe('show_pending_reviews');
      });

      it('should recognize "pending reviews"', () => {
        const result = parseIntent('Show me pending reviews');
        expect(result.intent).toBe('show_pending_reviews');
      });

      it('should recognize "what should I review"', () => {
        const result = parseIntent('What should I review?');
        expect(result.intent).toBe('show_pending_reviews');
      });
    });

    describe('approve_task intent', () => {
      it('should recognize "approve"', () => {
        const result = parseIntent('Approve');
        expect(result.intent).toBe('approve_task');
      });

      it('should recognize "approve it"', () => {
        const result = parseIntent('Approve it');
        expect(result.intent).toBe('approve_task');
      });

      it('should recognize "looks good"', () => {
        const result = parseIntent('Looks good!');
        expect(result.intent).toBe('approve_task');
      });

      it('should recognize "go ahead"', () => {
        const result = parseIntent('Go ahead and send it');
        expect(result.intent).toBe('approve_task');
      });

      it('should recognize "confirm"', () => {
        const result = parseIntent('Confirm that');
        expect(result.intent).toBe('approve_task');
      });
    });

    describe('reject_task intent', () => {
      it('should recognize "don\'t send"', () => {
        const result = parseIntent("Don't send that");
        expect(result.intent).toBe('reject_task');
      });

      it('should recognize "reject"', () => {
        const result = parseIntent('Reject it');
        expect(result.intent).toBe('reject_task');
      });

      it('should recognize "cancel"', () => {
        const result = parseIntent('Cancel that');
        expect(result.intent).toBe('reject_task');
      });

      it('should recognize "no don\'t"', () => {
        const result = parseIntent("No, don't approve");
        expect(result.intent).toBe('reject_task');
      });
    });

    describe('show_client_info intent', () => {
      it('should recognize "tell me about"', () => {
        const result = parseIntent('Tell me about Sarah Chen');
        expect(result.intent).toBe('show_client_info');
      });

      it('should recognize "who is"', () => {
        const result = parseIntent('Who is Michael Johnson?');
        expect(result.intent).toBe('show_client_info');
      });

      it('should recognize "show client"', () => {
        const result = parseIntent('Show me client profile for Robert Thompson');
        expect(result.intent).toBe('show_client_info');
      });

      it('should recognize "info about"', () => {
        const result = parseIntent('Give me info about Priya Patel');
        expect(result.intent).toBe('show_client_info');
      });
    });

    describe('complete_task intent', () => {
      it('should recognize "mark as done"', () => {
        const result = parseIntent('Mark the Johnson call as done');
        expect(result.intent).toBe('complete_task');
      });

      it('should recognize "complete the"', () => {
        const result = parseIntent('Complete the portfolio review');
        expect(result.intent).toBe('complete_task');
      });

      it('should recognize "I completed"', () => {
        const result = parseIntent('I completed the meeting');
        expect(result.intent).toBe('complete_task');
      });
    });

    describe('general_question intent', () => {
      it('should default to general question for unmatched patterns', () => {
        const result = parseIntent('What is the weather today?');
        expect(result.intent).toBe('general_question');
      });

      it('should have lower confidence for general questions', () => {
        const result = parseIntent('Random question here');
        expect(result.confidence).toBeLessThan(0.8);
      });
    });
  });

  describe('extractEntities', () => {
    it('should extract client names (capitalized words)', () => {
      const entities = extractEntities('Tell me about Sarah Chen');
      expect(entities.clientName).toBe('Sarah Chen');
    });

    it('should extract multiple word names', () => {
      const entities = extractEntities('Info on David and Emily Williams');
      expect(entities.clientName).toBe('David and Emily Williams');
    });

    it('should extract "today" as date entity', () => {
      const entities = extractEntities('Show me tasks for today');
      expect(entities.date).toBe('today');
    });

    it('should extract "tomorrow" as date entity', () => {
      const entities = extractEntities('What do I have tomorrow?');
      expect(entities.date).toBe('tomorrow');
    });

    it('should extract "this week" as date entity', () => {
      const entities = extractEntities('Tasks for this week');
      expect(entities.date).toBe('week');
    });

    it('should extract action keywords', () => {
      const entities1 = extractEntities('Approve this');
      expect(entities1.action).toBe('approve');

      const entities2 = extractEntities('Reject that');
      expect(entities2.action).toBe('reject');

      const entities3 = extractEntities('Complete the task');
      expect(entities3.action).toBe('complete');
    });

    it('should extract multiple entities', () => {
      const entities = extractEntities('Approve the Sarah Chen email today');
      expect(entities.clientName).toBe('Sarah Chen');
      expect(entities.action).toBe('approve');
      expect(entities.date).toBe('today');
    });

    it('should return empty object when no entities found', () => {
      const entities = extractEntities('hello world');
      expect(Object.keys(entities).length).toBe(0);
    });
  });

  describe('resolveReferences', () => {
    it('should resolve taskId from context when "it" is used', () => {
      const entities = extractEntities('Approve it');
      const context: ChatState['currentContext'] = {
        focusedTaskId: 'task-123',
        focusedClientId: undefined,
      };

      const resolved = resolveReferences(entities, context);
      expect(resolved.taskId).toBe('task-123');
    });

    it('should resolve clientId from context when "that" is used', () => {
      const entities = extractEntities('Tell me about that');
      const context: ChatState['currentContext'] = {
        focusedTaskId: undefined,
        focusedClientId: 'client-456',
      };

      const resolved = resolveReferences(entities, context);
      expect(resolved.clientId).toBe('client-456');
    });

    it('should resolve both from context when "this" is used', () => {
      const entities = extractEntities('Complete this');
      const context: ChatState['currentContext'] = {
        focusedTaskId: 'task-789',
        focusedClientId: 'client-123',
      };

      const resolved = resolveReferences(entities, context);
      expect(resolved.taskId).toBe('task-789');
    });

    it('should not override explicit entity values', () => {
      const entities = { taskId: 'explicit-task' };
      const context: ChatState['currentContext'] = {
        focusedTaskId: 'context-task',
        focusedClientId: undefined,
      };

      const resolved = resolveReferences(entities, context);
      expect(resolved.taskId).toBe('explicit-task');
    });

    it('should return original entities when no context', () => {
      const entities = extractEntities('Approve that');
      const resolved = resolveReferences(entities);
      expect(resolved).toEqual(entities);
    });

    it('should preserve all original entities', () => {
      const entities = {
        clientName: 'John Doe',
        action: 'approve',
        date: 'today',
      };
      const resolved = resolveReferences(entities);
      expect(resolved).toEqual(entities);
    });
  });
});
