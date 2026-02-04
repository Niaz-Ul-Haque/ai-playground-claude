'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Copy, Save, Paperclip, X } from 'lucide-react';
import type { EmailComposerCardData } from '@/types/chat';
import { useChatContext } from '@/context/chat-context';

interface EmailComposerCardProps {
  data: EmailComposerCardData;
}

export function EmailComposerCard({ data }: EmailComposerCardProps) {
  const { handleSendEmail, handleCopyToClipboard, isLoading } = useChatContext();
  const [emailData, setEmailData] = useState<EmailComposerCardData>({
    ...data,
    editable: data.editable !== false, // Default to editable
  });
  const [isSending, setIsSending] = useState(false);

  const handleFieldChange = (field: keyof EmailComposerCardData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      await handleSendEmail(emailData);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    const emailText = `To: ${emailData.to}\n${emailData.cc ? `CC: ${emailData.cc}\n` : ''}Subject: ${emailData.subject}\n\n${emailData.body}`;
    handleCopyToClipboard(emailText);
  };

  const isDisabled = isLoading || isSending;

  return (
    <Card className="my-4 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Email Draft</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Ready to Send
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* To Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <Input
            value={emailData.to}
            onChange={(e) => handleFieldChange('to', e.target.value)}
            disabled={!emailData.editable || isDisabled}
            placeholder="recipient@example.com"
          />
        </div>

        {/* CC Field (optional) */}
        {(emailData.cc || emailData.editable) && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">CC</label>
            <Input
              value={emailData.cc || ''}
              onChange={(e) => handleFieldChange('cc', e.target.value)}
              disabled={!emailData.editable || isDisabled}
              placeholder="cc@example.com (optional)"
            />
          </div>
        )}

        {/* Subject Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Subject</label>
          <Input
            value={emailData.subject}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            disabled={!emailData.editable || isDisabled}
            placeholder="Email subject"
          />
        </div>

        {/* Body Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Message</label>
          <Textarea
            value={emailData.body}
            onChange={(e) => handleFieldChange('body', e.target.value)}
            disabled={!emailData.editable || isDisabled}
            placeholder="Email content..."
            className="min-h-[200px] bg-white"
          />
        </div>

        {/* Attachments (read-only display) */}
        {emailData.attachments && emailData.attachments.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Attachments</label>
            <div className="flex flex-wrap gap-2">
              {emailData.attachments.map((attachment, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {attachment.name}
                  {attachment.size && (
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(attachment.size / 1024)}KB)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSend}
            disabled={isDisabled || !emailData.to || !emailData.subject}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            disabled={isDisabled}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
