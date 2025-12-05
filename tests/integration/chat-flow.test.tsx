import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test-utils';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageItem } from '@/components/chat/message-item';
import type { Message } from '@/types/chat';

describe('Chat Flow Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-04T12:00:00.000Z'));
  });

  describe('Message sending flow', () => {
    it('should handle complete send message flow', async () => {
      const user = userEvent.setup({ delay: null });
      const handleSend = vi.fn();

      renderWithProviders(<ChatInput onSend={handleSend} />);

      // Type a message
      const textarea = screen.getByPlaceholderText('Ask me anything...');
      await user.type(textarea, 'What tasks do I have today?');

      // Verify message is in textarea
      expect(textarea).toHaveValue('What tasks do I have today?');

      // Send message
      const sendButton = screen.getByRole('button');
      await user.click(sendButton);

      // Verify handler was called
      expect(handleSend).toHaveBeenCalledWith('What tasks do I have today?');

      // Verify textarea is cleared
      expect(textarea).toHaveValue('');
    });

    it('should handle keyboard send (Enter key)', async () => {
      const user = userEvent.setup({ delay: null });
      const handleSend = vi.fn();

      renderWithProviders(<ChatInput onSend={handleSend} />);

      const textarea = screen.getByPlaceholderText('Ask me anything...');
      await user.type(textarea, 'Show me my clients');
      await user.keyboard('{Enter}');

      expect(handleSend).toHaveBeenCalledWith('Show me my clients');
      expect(textarea).toHaveValue('');
    });
  });

  describe('Message display flow', () => {
    it('should display user message correctly', () => {
      const message: Message = {
        id: '1',
        role: 'user',
        content: 'Tell me about Sarah Chen',
        timestamp: new Date().toISOString(),
      };

      renderWithProviders(<MessageItem message={message} />);

      expect(screen.getByText('Tell me about Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('should display assistant message with text', () => {
      const message: Message = {
        id: '2',
        role: 'assistant',
        content: 'Here is the information about Sarah Chen.',
        timestamp: new Date().toISOString(),
      };

      renderWithProviders(<MessageItem message={message} />);

      expect(screen.getByText('Here is the information about Sarah Chen.')).toBeInTheDocument();
      expect(screen.getByText('Ciri')).toBeInTheDocument();
    });

    it('should display assistant message with card', () => {
      const message: Message = {
        id: '3',
        role: 'assistant',
        content: 'Here is your task: <<<CARD:task:{"task":{"id":"1","title":"Portfolio Review","description":"Review quarterly portfolio","status":"pending","dueDate":"2025-12-10T14:00:00.000Z","priority":"high","tags":["portfolio"],"createdAt":"2025-12-01T10:00:00.000Z","updatedAt":"2025-12-01T10:00:00.000Z"},"showActions":true}>>>',
        timestamp: new Date().toISOString(),
      };

      renderWithProviders(<MessageItem message={message} />);

      expect(screen.getByText('Here is your task:')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Review')).toBeInTheDocument();
      expect(screen.getByText('Review quarterly portfolio')).toBeInTheDocument();
    });
  });

  describe('Multi-message conversation flow', () => {
    it('should render conversation with multiple messages', () => {
      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'What tasks do I have today?',
          timestamp: '2025-12-04T10:00:00.000Z',
        },
        {
          id: '2',
          role: 'assistant',
          content: 'You have 3 tasks scheduled for today.',
          timestamp: '2025-12-04T10:00:05.000Z',
        },
        {
          id: '3',
          role: 'user',
          content: 'Show me the first one',
          timestamp: '2025-12-04T10:01:00.000Z',
        },
      ];

      const { container } = renderWithProviders(
        <div>
          {messages.map(msg => (
            <MessageItem key={msg.id} message={msg} />
          ))}
        </div>
      );

      expect(screen.getByText('What tasks do I have today?')).toBeInTheDocument();
      expect(screen.getByText('You have 3 tasks scheduled for today.')).toBeInTheDocument();
      expect(screen.getByText('Show me the first one')).toBeInTheDocument();

      // Should have 2 user messages and 1 assistant message
      expect(screen.getAllByText('You')).toHaveLength(2);
      expect(screen.getAllByText('Ciri')).toHaveLength(1);
    });
  });

  describe('Input validation flow', () => {
    it('should prevent sending empty messages', async () => {
      const user = userEvent.setup({ delay: null });
      const handleSend = vi.fn();

      renderWithProviders(<ChatInput onSend={handleSend} />);

      const sendButton = screen.getByRole('button');

      // Try to send without typing
      await user.click(sendButton);
      expect(handleSend).not.toHaveBeenCalled();

      // Try to send whitespace
      const textarea = screen.getByPlaceholderText('Ask me anything...');
      await user.type(textarea, '   ');
      await user.click(sendButton);
      expect(handleSend).not.toHaveBeenCalled();
    });

    it('should trim whitespace from messages', async () => {
      const user = userEvent.setup({ delay: null });
      const handleSend = vi.fn();

      renderWithProviders(<ChatInput onSend={handleSend} />);

      const textarea = screen.getByPlaceholderText('Ask me anything...');
      await user.type(textarea, '  Hello world  ');

      const sendButton = screen.getByRole('button');
      await user.click(sendButton);

      expect(handleSend).toHaveBeenCalledWith('Hello world');
    });
  });

  describe('Disabled state flow', () => {
    it('should prevent interaction when disabled', async () => {
      const user = userEvent.setup({ delay: null });
      const handleSend = vi.fn();

      renderWithProviders(<ChatInput onSend={handleSend} disabled={true} />);

      const textarea = screen.getByPlaceholderText('Ask me anything...');
      const sendButton = screen.getByRole('button');

      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled();

      // Attempts to interact should not work
      expect(handleSend).not.toHaveBeenCalled();
    });
  });

  describe('Card rendering in messages', () => {
    it('should render task card within message', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Your task: <<<CARD:task:{"task":{"id":"1","title":"Call Client","description":"Follow up call","status":"pending","dueDate":"2025-12-05T10:00:00.000Z","priority":"high","tags":[],"createdAt":"2025-12-01T10:00:00.000Z","updatedAt":"2025-12-01T10:00:00.000Z"},"showActions":true}>>>',
        timestamp: new Date().toISOString(),
      };

      renderWithProviders(<MessageItem message={message} />);

      expect(screen.getByText('Your task:')).toBeInTheDocument();
      expect(screen.getByText('Call Client')).toBeInTheDocument();
      expect(screen.getByText('Follow up call')).toBeInTheDocument();
      expect(screen.getByText('high priority')).toBeInTheDocument();
    });

    it('should render multiple segments in one message', () => {
      const message: Message = {
        id: '1',
        role: 'assistant',
        content: 'Here are your tasks: <<<CARD:task:{"task":{"id":"1","title":"Task 1","description":"First task","status":"pending","dueDate":"2025-12-05T10:00:00.000Z","priority":"high","tags":[],"createdAt":"2025-12-01T10:00:00.000Z","updatedAt":"2025-12-01T10:00:00.000Z"},"showActions":true}>>> And here is another: <<<CARD:task:{"task":{"id":"2","title":"Task 2","description":"Second task","status":"pending","dueDate":"2025-12-06T10:00:00.000Z","priority":"medium","tags":[],"createdAt":"2025-12-01T10:00:00.000Z","updatedAt":"2025-12-01T10:00:00.000Z"},"showActions":true}>>>',
        timestamp: new Date().toISOString(),
      };

      renderWithProviders(<MessageItem message={message} />);

      expect(screen.getByText('Here are your tasks:')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('And here is another:')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });
});
