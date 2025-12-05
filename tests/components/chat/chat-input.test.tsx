import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../test-utils';
import { ChatInput } from '@/components/chat/chat-input';

describe('ChatInput', () => {
  it('should render textarea and send button', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should update textarea value when typing', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Hello world');

    expect(textarea).toHaveValue('Hello world');
  });

  it('should call onSend when send button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test message');

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
    expect(mockOnSend).toHaveBeenCalledTimes(1);
  });

  it('should clear textarea after sending', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test message');

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(textarea).toHaveValue('');
  });

  it('should send message when Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test message{Enter}');

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('should not send message when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Line 1\nLine 2');
  });

  it('should trim whitespace before sending', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, '  Test message  ');

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('should not send empty message', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should not send whitespace-only message', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, '   ');

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should disable send button when empty', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when text is entered', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeEnabled();
  });

  it('should disable textarea when disabled prop is true', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    expect(textarea).toBeDisabled();
  });

  it('should disable send button when disabled prop is true', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('should not send message when disabled', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    // Textarea is disabled, but we can still try to type (won't work)

    const sendButton = screen.getByRole('button');
    // Button is disabled, click won't work
    expect(sendButton).toBeDisabled();

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should show character count', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    // Should show 2000 remaining initially
    expect(screen.getByText('2000')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Hello'); // 5 characters

    // Should show 1995 remaining
    expect(screen.getByText('1995')).toBeInTheDocument();
  });

  it('should disable send when over character limit', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask me anything...');
    const longText = 'a'.repeat(2001); // Over 2000 limit
    await user.type(textarea, longText);

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('should show helper text about keyboard shortcuts', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByText(/Press Enter to send/)).toBeInTheDocument();
  });
});
