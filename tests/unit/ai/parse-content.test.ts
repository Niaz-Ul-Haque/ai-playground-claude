import { describe, it, expect } from 'vitest';
import { parseMessageContent, stripCardMarkers, hasCards } from '@/lib/ai/parse-content';

describe('parse-content', () => {
  describe('parseMessageContent', () => {
    it('should parse text-only content', () => {
      const content = 'This is a simple message';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({
        type: 'text',
        content: 'This is a simple message',
      });
    });

    it('should parse single card marker', () => {
      const content = '<<<CARD:task:{"id":"1","title":"Test Task"}>>>';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({
        type: 'card',
        card: {
          type: 'task',
          data: { id: '1', title: 'Test Task' },
        },
      });
    });

    it('should parse text before card', () => {
      const content = 'Here is your task: <<<CARD:task:{"id":"1"}>>>';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(2);
      expect(segments[0]).toEqual({
        type: 'text',
        content: 'Here is your task:',
      });
      expect(segments[1].type).toBe('card');
    });

    it('should parse text after card', () => {
      const content = '<<<CARD:task:{"id":"1"}>>> Let me know if you need help.';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(2);
      expect(segments[0].type).toBe('card');
      expect(segments[1]).toEqual({
        type: 'text',
        content: 'Let me know if you need help.',
      });
    });

    it('should parse text between multiple cards', () => {
      const content = 'First task: <<<CARD:task:{"id":"1"}>>> And second: <<<CARD:task:{"id":"2"}>>>';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(4);
      expect(segments[0].content).toBe('First task:');
      expect(segments[1].type).toBe('card');
      expect(segments[2].content).toBe('And second:');
      expect(segments[3].type).toBe('card');
    });

    it('should handle multiple cards without text between them', () => {
      const content = '<<<CARD:task:{"id":"1"}>>><<<CARD:task:{"id":"2"}>>>';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(2);
      expect(segments[0].type).toBe('card');
      expect(segments[1].type).toBe('card');
    });

    it('should handle nested JSON in card data', () => {
      const content = '<<<CARD:client:{"id":"1","address":{"street":"123 Main","city":"Toronto"}}>>>';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({
        type: 'card',
        card: {
          type: 'client',
          data: {
            id: '1',
            address: {
              street: '123 Main',
              city: 'Toronto',
            },
          },
        },
      });
    });

    it('should handle different card types', () => {
      const taskCard = '<<<CARD:task:{"id":"1"}>>>';
      const clientCard = '<<<CARD:client:{"id":"2"}>>>';
      const reviewCard = '<<<CARD:review:{"id":"3"}>>>';

      expect(parseMessageContent(taskCard)[0].card?.type).toBe('task');
      expect(parseMessageContent(clientCard)[0].card?.type).toBe('client');
      expect(parseMessageContent(reviewCard)[0].card?.type).toBe('review');
    });

    it('should treat malformed JSON as text', () => {
      const content = '<<<CARD:task:{invalid json}>>>';
      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(1);
      expect(segments[0].type).toBe('text');
      expect(segments[0].content).toContain('CARD');
    });

    it('should trim whitespace from text segments', () => {
      const content = '  Leading spaces  <<<CARD:task:{"id":"1"}>>>  Trailing spaces  ';
      const segments = parseMessageContent(content);

      expect(segments[0].content).toBe('Leading spaces');
      expect(segments[2].content).toBe('Trailing spaces');
    });

    it('should handle empty content', () => {
      const segments = parseMessageContent('');
      expect(segments).toHaveLength(0);
    });

    it('should handle whitespace-only content', () => {
      const segments = parseMessageContent('   \n  \t  ');
      expect(segments).toHaveLength(0);
    });

    it('should parse complex multi-card response', () => {
      const content = `You have 3 tasks for today:

<<<CARD:task-list:{"tasks":[{"id":"1"},{"id":"2"}]}>>>

Would you like me to help with any of these?`;

      const segments = parseMessageContent(content);

      expect(segments).toHaveLength(3);
      expect(segments[0].content).toContain('You have 3 tasks');
      expect(segments[1].type).toBe('card');
      expect(segments[2].content).toContain('Would you like');
    });
  });

  describe('stripCardMarkers', () => {
    it('should remove all card markers from content', () => {
      const content = 'Text <<<CARD:task:{"id":"1"}>>> more text';
      const result = stripCardMarkers(content);

      expect(result).toBe('Text  more text');
    });

    it('should remove multiple card markers', () => {
      const content = '<<<CARD:task:{"id":"1"}>>> and <<<CARD:task:{"id":"2"}>>>';
      const result = stripCardMarkers(content);

      expect(result).toBe('and');
    });

    it('should trim result', () => {
      const content = '  <<<CARD:task:{"id":"1"}>>>  ';
      const result = stripCardMarkers(content);

      expect(result).toBe('');
    });

    it('should return original text if no cards', () => {
      const content = 'Just regular text';
      const result = stripCardMarkers(content);

      expect(result).toBe('Just regular text');
    });
  });

  describe('hasCards', () => {
    it('should return true when content has cards', () => {
      const content = 'Text <<<CARD:task:{"id":"1"}>>>';
      expect(hasCards(content)).toBe(true);
    });

    it('should return true for multiple cards', () => {
      const content = '<<<CARD:task:{"id":"1"}>>><<<CARD:task:{"id":"2"}>>>';
      expect(hasCards(content)).toBe(true);
    });

    it('should return false when no cards', () => {
      const content = 'Just regular text';
      expect(hasCards(content)).toBe(false);
    });

    it('should return false for empty content', () => {
      expect(hasCards('')).toBe(false);
    });

    it('should return false for partial card markers', () => {
      const content = '<<<CARD:task';
      expect(hasCards(content)).toBe(false);
    });
  });
});
