'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  onPromptClick: (prompt: string) => void;
}

export function WelcomeMessage({ onPromptClick }: WelcomeMessageProps) {
  const suggestedPrompts = [
    "What tasks do I have today?",
    "What needs my approval?",
    "Show me pending reviews",
    "Tell me about Michael Johnson",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Ciri</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your Ciri-powered assistant for managing tasks, clients, and workflows
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4">Try asking:</p>
            <div className="grid gap-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => onPromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>I can help you with:</p>
          <ul className="mt-2 space-y-1">
            <li>Viewing and managing daily tasks</li>
            <li>Reviewing Ciri-completed work</li>
            <li>Looking up client information</li>
            <li>Answering questions about schedules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
