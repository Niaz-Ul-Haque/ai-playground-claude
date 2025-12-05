import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { MessageItem } from '@/components/chat/message-item';
import type { Message } from '@/types/chat';

describe('MessageItem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
  });

  it('should render user message', () => {
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Hello, AI!',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('should render assistant message', () => {
    const message: Message = {
      id: '2',
      role: 'assistant',
      content: 'Hello! How can I help?',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
    expect(screen.getByText('Ciri')).toBeInTheDocument();
  });

  it('should display formatted timestamp', () => {
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Test',
      timestamp: '2025-12-04T10:30:00.000Z',
    };

    renderWithProviders(<MessageItem message={message} />);

    // Should show time for today's messages
    expect(screen.getByText(/\d{1,2}:\d{2}\s(?:AM|PM)/i)).toBeInTheDocument();
  });

  it('should render multiline text', () => {
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Line 1\nLine 2\nLine 3',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    const contentElement = screen.getByText(/Line 1/);
    expect(contentElement.textContent).toContain('Line 1');
    expect(contentElement.textContent).toContain('Line 2');
    expect(contentElement.textContent).toContain('Line 3');
  });

  it('should render text segment from parsed content', () => {
    const message: Message = {
      id: '1',
      role: 'assistant',
      content: 'Here is your information.',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    expect(screen.getByText('Here is your information.')).toBeInTheDocument();
  });

  it('should render card from parsed content', () => {
    const message: Message = {
      id: '1',
      role: 'assistant',
      content: 'Here is your task: <<<CARD:task:{"task":{"id":"1","title":"Test Task","description":"Description","status":"pending","dueDate":"2025-12-10T10:00:00.000Z","priority":"medium","tags":[],"createdAt":"2025-12-01T10:00:00.000Z","updatedAt":"2025-12-01T10:00:00.000Z"},"showActions":true}>>>',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    expect(screen.getByText('Here is your task:')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should apply different styling for user vs assistant', () => {
    const userMessage: Message = {
      id: '1',
      role: 'user',
      content: 'User message',
      timestamp: new Date().toISOString(),
    };

    const { rerender } = renderWithProviders(<MessageItem message={userMessage} />);

    const userBubble = screen.getByText('User message');
    expect(userBubble).toHaveClass('bg-primary');

    const assistantMessage: Message = {
      id: '2',
      role: 'assistant',
      content: 'Assistant message',
      timestamp: new Date().toISOString(),
    };

    rerender(<MessageItem message={assistantMessage} />);

    const assistantBubble = screen.getByText('Assistant message');
    expect(assistantBubble).toHaveClass('bg-muted');
  });

  it('should render avatar for user', () => {
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Test',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    // Avatar should be present (checking for "You" label)
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('should render avatar for assistant', () => {
    const message: Message = {
      id: '1',
      role: 'assistant',
      content: 'Test',
      timestamp: new Date().toISOString(),
    };

    renderWithProviders(<MessageItem message={message} />);

    // Avatar should be present (checking for "Ciri" label)
    expect(screen.getByText('Ciri')).toBeInTheDocument();
  });

  it('should render explicit cards array as fallback', () => {
    const message: Message = {
      id: '1',
      role: 'assistant',
      content: 'Here are your tasks.',
      timestamp: new Date().toISOString(),
      cards: [
        {
          type: 'task',
          data: {
            task: {
              id: '1',
              title: 'Explicit Card Task',
              description: 'From cards array',
              status: 'pending',
              dueDate: '2025-12-10T10:00:00.000Z',
              priority: 'medium',
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            showActions: true,
          },
        },
      ],
    };

    renderWithProviders(<MessageItem message={message} />);

    expect(screen.getByText('Here are your tasks.')).toBeInTheDocument();
    expect(screen.getByText('Explicit Card Task')).toBeInTheDocument();
  });
});
