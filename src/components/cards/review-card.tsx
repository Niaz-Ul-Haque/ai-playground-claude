'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Edit3,
  Mail,
  FileText,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
  Bell,
  Gift,
  RefreshCw,
  Send,
} from 'lucide-react';
import type { ReviewCardData } from '@/types/chat';
import { useChatContext } from '@/context/chat-context';

interface ReviewCardProps {
  data: ReviewCardData;
}

// Action type configurations for UI differentiation
const ACTION_TYPE_CONFIG: Record<string, { 
  icon: React.ReactNode; 
  label: string; 
  bgColor: string; 
  borderColor: string;
  iconColor: string;
}> = {
  email_draft: {
    icon: <Mail className="h-5 w-5" />,
    label: 'Email Draft',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  portfolio_review: {
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Portfolio Review',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
  },
  meeting_notes: {
    icon: <FileText className="h-5 w-5" />,
    label: 'Meeting Notes',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
  },
  policy_summary: {
    icon: <FileText className="h-5 w-5" />,
    label: 'Policy Summary',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconColor: 'text-indigo-600',
  },
  client_summary: {
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Client Summary',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    iconColor: 'text-cyan-600',
  },
  compliance_check: {
    icon: <ClipboardCheck className="h-5 w-5" />,
    label: 'Compliance Check',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
  },
  report: {
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Report',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    iconColor: 'text-slate-600',
  },
  reminder: {
    icon: <Bell className="h-5 w-5" />,
    label: 'Reminder',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
  },
  analysis: {
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Analysis',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconColor: 'text-teal-600',
  },
  proposal: {
    icon: <FileText className="h-5 w-5" />,
    label: 'Proposal',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  birthday_greeting: {
    icon: <Gift className="h-5 w-5" />,
    label: 'Birthday Greeting',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    iconColor: 'text-pink-600',
  },
  renewal_notice: {
    icon: <RefreshCw className="h-5 w-5" />,
    label: 'Renewal Notice',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
  },
};

const DEFAULT_CONFIG = {
  icon: <Sparkles className="h-5 w-5" />,
  label: 'AI Generated',
  bgColor: 'bg-yellow-50',
  borderColor: 'border-yellow-200',
  iconColor: 'text-yellow-600',
};

export function ReviewCard({ data }: ReviewCardProps) {
  const { handleApproveTask, handleRejectTask, handleExecuteAction } = useChatContext();
  const { title, summary, action_type, confidence, task } = data;
  
  // Support both 'message' and 'content' fields (backend sends 'message')
  const displayContent = data.message || data.content || data.generated_content;
  // Get task_id from task object or directly from data
  const taskId = data.task_id || task?.task_id;
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(displayContent || '');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get config for this action type
  const config = action_type ? (ACTION_TYPE_CONFIG[action_type] || DEFAULT_CONFIG) : DEFAULT_CONFIG;

  // Auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleCopy = async () => {
    const contentToCopy = isEditing ? editedContent : displayContent;
    if (contentToCopy) {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartEdit = () => {
    setEditedContent(displayContent || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(displayContent || '');
    setIsEditing(false);
  };

  const handleSaveAndSend = async () => {
    if (!taskId) return;
    
    // If content was edited, send with modifications
    if (editedContent !== displayContent) {
      await handleExecuteAction('approve_with_edits', 'tasks', taskId, {
        original_content: displayContent,
        edited_content: editedContent,
      });
    } else {
      await handleApproveTask(taskId);
    }
    setIsEditing(false);
  };

  const handleReject = () => {
    if (!taskId) return;
    const reason = prompt('Please provide a reason for rejection (optional):');
    handleRejectTask(taskId, reason || undefined);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (conf >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className={`my-4 ${config.borderColor} ${config.bgColor}/50`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={config.iconColor}>{config.icon}</span>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {action_type && (
              <Badge variant="outline" className={`${config.bgColor} ${config.iconColor} ${config.borderColor}`}>
                {config.label}
              </Badge>
            )}
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Needs Review
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-white rounded-lg border">
          {/* Header with actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {confidence !== undefined && (
                <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidence)}`}>
                  {confidence}% confident
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 w-7 p-0"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              {!isEditing && displayContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-7 w-7 p-0"
                  title="Edit content"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {displayContent && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 text-xs p-0 hover:bg-transparent"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide content
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show content
                    </>
                  )}
                </Button>

                {isExpanded && (
                  <>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          ref={textareaRef}
                          value={editedContent}
                          onChange={(e) => {
                            setEditedContent(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          className="min-h-[150px] text-sm font-mono resize-none"
                          placeholder="Edit the content..."
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Edit3 className="h-3 w-3" />
                          <span>Editing mode - your changes will be sent with approval</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                        {displayContent}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {taskId && (
          <div className="flex gap-2 pt-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveAndSend}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Save & Send
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleApproveTask(taskId)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Send
                </Button>
                <Button
                  onClick={handleStartEdit}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Before Send
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="px-4"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
