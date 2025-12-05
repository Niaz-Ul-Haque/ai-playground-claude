'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Info, Undo2 } from 'lucide-react';
import type { ConfirmationCardData } from '@/types/chat';
import { useChatContext } from '@/context/chat-context';

interface ConfirmationCardProps {
  data: ConfirmationCardData;
}

export function ConfirmationCard({ data }: ConfirmationCardProps) {
  const { handleUndo } = useChatContext();
  const { type, message, undoable } = data;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCardStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <Card className={`my-4 ${getCardStyles()}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          {undoable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="h-8"
            >
              <Undo2 className="h-3 w-3 mr-1" />
              Undo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
