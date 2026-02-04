'use client';

import { useState } from 'react';
import type { MeetingNotesCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Share2,
  Save,
  Clock,
  ListTodo,
  MessageSquare,
} from 'lucide-react';
import { useChatContext } from '@/context/chat-context';

interface MeetingNotesCardProps {
  data: MeetingNotesCardData;
}

export function MeetingNotesCard({ data }: MeetingNotesCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [actionItems, setActionItems] = useState(data.action_items);
  const [newActionItem, setNewActionItem] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(data.editable ?? false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toggleActionItem = (itemId: string) => {
    setActionItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    
    const newItem = {
      id: `new-${Date.now()}`,
      description: newActionItem.trim(),
      completed: false,
    };
    
    setActionItems(prev => [...prev, newItem]);
    setNewActionItem('');
  };

  const handleSave = async () => {
    setActionLoading('save');
    try {
      await handleExecuteAction('save_meeting_notes', 'meeting', data.meeting_id || 'new', {
        action_items: actionItems,
        notes: data.notes,
      });
    } finally {
      setActionLoading(null);
      setIsEditing(false);
    }
  };

  const handleShare = async () => {
    setActionLoading('share');
    try {
      await handleExecuteAction('share_meeting_notes', 'meeting', data.meeting_id || 'new', {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleScheduleFollowup = async () => {
    await handleExecuteAction('schedule_followup', 'meeting', data.meeting_id || 'new', {
      follow_up_date: data.follow_up_date,
    });
  };

  const completedCount = actionItems.filter(item => item.completed).length;
  const actions = data.available_actions || ['save', 'share'];

  return (
    <Card className="my-4 border-l-4 border-l-indigo-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </div>
          {actionItems.length > 0 && (
            <Badge variant="outline">
              {completedCount}/{actionItems.length} actions done
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDate(data.meeting_date)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Attendees */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Attendees</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.attendees.map((attendee, idx) => (
              <Badge key={idx} variant="secondary" className="py-1">
                {attendee.name}
                {attendee.role && (
                  <span className="text-muted-foreground ml-1">({attendee.role})</span>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Agenda */}
        {data.agenda && data.agenda.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Agenda</h4>
            <ul className="space-y-1">
              {data.agenda.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-medium">{idx + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discussion Points */}
        {data.discussion_points && data.discussion_points.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Discussion Points</h4>
            <ul className="space-y-1">
              {data.discussion_points.map((point, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Action Items</h4>
          </div>
          <div className="space-y-2">
            {actionItems.map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-2 rounded-lg border ${
                  item.completed ? 'bg-muted/50' : 'bg-background'
                }`}
              >
                <button
                  onClick={() => toggleActionItem(item.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {item.owner && <span>@{item.owner}</span>}
                    {item.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {new Date(item.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Action Item */}
            {actions.includes('add_action_item') && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new action item..."
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddActionItem}
                  disabled={!newActionItem.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div>
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            <div className="p-3 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
              {data.notes}
            </div>
          </div>
        )}

        {/* Follow-up */}
        {data.follow_up_date && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Follow-up scheduled:</span>
              <span className="font-medium">{formatDate(data.follow_up_date)}</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap pt-4 border-t">
        {actions.includes('save') && (
          <Button
            onClick={handleSave}
            disabled={actionLoading === 'save'}
          >
            <Save className="w-4 h-4 mr-2" />
            {actionLoading === 'save' ? 'Saving...' : 'Save Notes'}
          </Button>
        )}
        {actions.includes('share') && (
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={actionLoading === 'share'}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {actionLoading === 'share' ? 'Sharing...' : 'Share'}
          </Button>
        )}
        {actions.includes('schedule_followup') && !data.follow_up_date && (
          <Button
            variant="ghost"
            onClick={handleScheduleFollowup}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Follow-up
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
