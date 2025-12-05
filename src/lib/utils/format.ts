import { formatDistanceToNow, format, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRelativeDate(date: string): string {
  const dateObj = new Date(date);

  if (isToday(dateObj)) {
    return format(dateObj, 'h:mm a');
  }

  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }

  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }

  // For dates within the last week
  const daysDiff = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff >= 0 && daysDiff < 7) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  // For older dates
  return format(dateObj, 'MMM d, yyyy');
}

export function formatDueDate(date: string): string {
  const dateObj = new Date(date);

  if (isToday(dateObj)) {
    return `Today ${format(dateObj, 'h:mm a')}`;
  }

  if (isTomorrow(dateObj)) {
    return `Tomorrow ${format(dateObj, 'h:mm a')}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday ${format(dateObj, 'h:mm a')}`;
  }

  // For dates within the next 7 days
  const daysDiff = Math.floor((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysDiff >= 0 && daysDiff < 7) {
    return format(dateObj, 'EEEE h:mm a'); // e.g., "Friday 2:00 PM"
  }

  // For all other dates
  return format(dateObj, 'MMM d, h:mm a'); // e.g., "Dec 15, 2:00 PM"
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}
