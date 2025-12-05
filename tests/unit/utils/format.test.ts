import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatCurrency, formatRelativeDate, formatDueDate, getInitials } from '@/lib/utils/format';

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts in CAD', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1250000)).toBe('$1,250,000');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should format negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500');
    });

    it('should round to nearest dollar', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1234.49)).toBe('$1,234');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(99.99)).toBe('$100');
      expect(formatCurrency(100.01)).toBe('$100');
    });
  });

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      // Mock current date to 2025-12-04T12:00:00Z for consistent testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
    });

    it('should format today with time only', () => {
      const today = new Date('2025-12-04T14:30:00.000Z');
      const result = formatRelativeDate(today.toISOString());
      expect(result).toMatch(/\d{1,2}:\d{2}\s(?:AM|PM)/i);
    });

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date('2025-12-03T10:00:00.000Z');
      expect(formatRelativeDate(yesterday.toISOString())).toBe('Yesterday');
    });

    it('should return "Tomorrow" for tomorrow', () => {
      const tomorrow = new Date('2025-12-05T10:00:00.000Z');
      expect(formatRelativeDate(tomorrow.toISOString())).toBe('Tomorrow');
    });

    it('should show relative time for dates within last week', () => {
      const twoDaysAgo = new Date('2025-12-02T12:00:00.000Z');
      const result = formatRelativeDate(twoDaysAgo.toISOString());
      expect(result).toContain('ago');
    });

    it('should format older dates as MMM d, yyyy', () => {
      const oldDate = new Date('2025-11-01T12:00:00.000Z');
      expect(formatRelativeDate(oldDate.toISOString())).toBe('Nov 1, 2025');
    });
  });

  describe('formatDueDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
    });

    it('should format today with "Today" prefix', () => {
      const today = new Date('2025-12-04T14:30:00.000Z');
      const result = formatDueDate(today.toISOString());
      expect(result).toMatch(/^Today \d{1,2}:\d{2}\s(?:AM|PM)$/i);
    });

    it('should format tomorrow with "Tomorrow" prefix', () => {
      const tomorrow = new Date('2025-12-05T10:00:00.000Z');
      const result = formatDueDate(tomorrow.toISOString());
      expect(result).toMatch(/^Tomorrow \d{1,2}:\d{2}\s(?:AM|PM)$/i);
    });

    it('should format yesterday with "Yesterday" prefix', () => {
      const yesterday = new Date('2025-12-03T10:00:00.000Z');
      const result = formatDueDate(yesterday.toISOString());
      expect(result).toMatch(/^Yesterday \d{1,2}:\d{2}\s(?:AM|PM)$/i);
    });

    it('should format dates within next 7 days with day name', () => {
      const nextWeek = new Date('2025-12-08T14:00:00.000Z');
      const result = formatDueDate(nextWeek.toISOString());
      expect(result).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d{1,2}:\d{2}\s(?:AM|PM)$/i);
    });

    it('should format other dates as MMM d, h:mm a', () => {
      const futureDate = new Date('2025-12-20T14:00:00.000Z');
      expect(formatDueDate(futureDate.toISOString())).toMatch(/^Dec 20, \d{1,2}:\d{2}\s(?:AM|PM)$/i);
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Smith')).toBe('JS');
      expect(getInitials('Michael Johnson')).toBe('MJ');
    });

    it('should handle single name', () => {
      expect(getInitials('Madonna')).toBe('MA');
      expect(getInitials('Prince')).toBe('PR');
    });

    it('should handle names with multiple parts', () => {
      expect(getInitials('John Paul Smith')).toBe('JP');
      expect(getInitials('Mary Jane Watson Parker')).toBe('MJ');
    });

    it('should handle extra whitespace', () => {
      expect(getInitials('  John   Smith  ')).toBe('JS');
    });

    it('should return uppercase initials', () => {
      expect(getInitials('john smith')).toBe('JS');
      expect(getInitials('JOHN SMITH')).toBe('JS');
    });

    it('should handle hyphenated names', () => {
      expect(getInitials('Jean-Paul Sartre')).toBe('JS');
    });

    it('should handle empty string gracefully', () => {
      expect(getInitials('')).toBe('');
    });
  });
});
