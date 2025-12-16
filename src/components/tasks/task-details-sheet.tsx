'use client';

import React, { useState } from 'react';
import type { Task, Label } from '@/types/task';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  User,
  Tag,
  MessageSquare,
  Sparkles,
  Plus,
  X,
  Send,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface TaskDetailsSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLabels: Label[];
  onAddLabel: (taskId: string, label: Label) => void;
  onRemoveLabel: (taskId: string, labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
  onAddComment: (taskId: string, text: string, authorName: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f97316', '#84cc16', '#06b6d4', '#6366f1', '#a855f7', '#f43f5e',
];

export function TaskDetailsSheet({
  task,
  open,
  onOpenChange,
  availableLabels,
  onAddLabel,
  onRemoveLabel,
  onCreateLabel,
  onAddComment,
}: TaskDetailsSheetProps) {
  const [commentText, setCommentText] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [showCreateLabel, setShowCreateLabel] = useState(false);

  if (!task) return null;

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(task.id, commentText, 'Advisor');
      setCommentText('');
    }
  };

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onCreateLabel(newLabelName, newLabelColor);
      setNewLabelName('');
      setNewLabelColor(PRESET_COLORS[0]);
      setShowCreateLabel(false);
    }
  };

  const taskLabels = task.labels || [];
  const unassignedLabels = availableLabels.filter(
    (label) => !taskLabels.find((tl) => tl.id === label.id)
  );

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'needs-review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <SheetHeader>
          <SheetTitle>{task.title}</SheetTitle>
          <SheetDescription className="sr-only">Task details and comments</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Status and Priority */}
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority} priority
              </Badge>
              {task.aiCompleted && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Completed
                </Badge>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {task.clientName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{task.clientName}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due:</span>
                  <span className="font-medium">
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>

            {/* AI Completion Data */}
            {task.aiCompletionData && (
              <div className="rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Analysis
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {task.aiCompletionData.summary}
                </p>
                {task.aiCompletionData.details && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {task.aiCompletionData.details}
                  </p>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Confidence: {task.aiCompletionData.confidence}%
                </div>
              </div>
            )}

            {/* Labels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Labels
                </h4>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Label
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-3">
                      {/* Available Labels */}
                      {unassignedLabels.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Available Labels
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {unassignedLabels.map((label) => (
                              <Badge
                                key={label.id}
                                variant="outline"
                                className="cursor-pointer text-xs"
                                style={{
                                  backgroundColor: `${label.color}15`,
                                  borderColor: label.color,
                                  color: label.color,
                                }}
                                onClick={() => onAddLabel(task.id, label)}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Create New Label */}
                      {!showCreateLabel ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setShowCreateLabel(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create New Label
                        </Button>
                      ) : (
                        <div className="space-y-2 pt-2 border-t">
                          <p className="text-xs font-medium">Create New Label</p>
                          <Input
                            placeholder="Label name"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            className="h-8"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                className="w-6 h-6 rounded border-2 transition-all"
                                style={{
                                  backgroundColor: color,
                                  borderColor:
                                    newLabelColor === color ? '#000' : 'transparent',
                                }}
                                onClick={() => setNewLabelColor(color)}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={handleCreateLabel}
                            >
                              Create
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowCreateLabel(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {taskLabels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {taskLabels.map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className="text-xs px-2 py-0.5 gap-1"
                      style={{
                        backgroundColor: `${label.color}15`,
                        borderColor: label.color,
                        color: label.color,
                      }}
                    >
                      {label.name}
                      <button
                        onClick={() => onRemoveLabel(task.id, label.id)}
                        className="hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No labels assigned</p>
              )}
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({task.comments?.length || 0})
              </h4>

              {/* Comment List */}
              <div className="space-y-3 mb-4">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to submit
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
