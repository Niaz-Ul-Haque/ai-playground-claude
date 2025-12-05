'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 2000;

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = MAX_CHARS - message.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={disabled}
              className="min-h-[60px] max-h-[200px] resize-none pr-16"
              rows={1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span className={isOverLimit ? 'text-destructive' : ''}>
                {remainingChars}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim() || isOverLimit}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
