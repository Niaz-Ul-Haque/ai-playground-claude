'use client';

import { useState } from 'react';
import type { CalendarCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
} from 'lucide-react';
import { useChatContext } from '@/context/chat-context';

interface CalendarCardProps {
  data: CalendarCardData;
}

type ViewType = 'day' | 'week' | 'month';

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: 'bg-blue-500',
  task: 'bg-amber-500',
  reminder: 'bg-purple-500',
  deadline: 'bg-red-500',
};

export function CalendarCard({ data }: CalendarCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [currentView, setCurrentView] = useState<ViewType>(data.view);
  const [currentDate, setCurrentDate] = useState(new Date(data.date));

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = direction === 'next' ? 1 : -1;
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + offset);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (offset * 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + offset);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = async () => {
    await handleExecuteAction('add_event', 'calendar', 'new', {
      date: currentDate.toISOString(),
    });
  };

  const getEventsForDay = (date: Date) => {
    return data.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderDayView = () => {
    const todayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="space-y-2">
        {todayEvents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No events for this day</p>
        ) : (
          todayEvents.map(event => (
            <div
              key={event.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-1 h-full min-h-[40px] rounded ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.start)}
                      {event.end && ` - ${formatTime(event.end)}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.client_name && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      {event.client_name}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={idx}
              className={`p-2 border rounded min-h-[100px] ${
                isToday ? 'bg-primary/5 border-primary' : ''
              }`}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-muted-foreground">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-medium ${isToday ? 'text-primary' : ''}`}>
                  {day.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate text-white ${
                      EVENT_TYPE_COLORS[event.type] || 'bg-gray-500'
                    }`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startPadding = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    
    const days: (Date | null)[] = [
      ...Array(startPadding).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
      }),
    ];

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="p-2 min-h-[60px]" />;
            }
            
            const dayEvents = getEventsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={idx}
                className={`p-1 border rounded min-h-[60px] hover:bg-muted/50 cursor-pointer ${
                  isToday ? 'bg-primary/5 border-primary' : ''
                }`}
              >
                <p className={`text-sm text-center ${isToday ? 'font-bold text-primary' : ''}`}>
                  {day.getDate()}
                </p>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`w-full h-1.5 rounded ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-500'}`}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{dayEvents.length - 2}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const actions = data.available_actions || ['add_event', 'change_view'];

  return (
    <Card className="my-4 border-l-4 border-l-sky-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-500" />
            <CardTitle className="text-lg">{data.title || 'Calendar'}</CardTitle>
          </div>
          
          {/* View Selector */}
          <div className="flex gap-1">
            <Button
              variant={currentView === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('day')}
              className="h-8 px-2"
            >
              <CalendarDays className="w-4 h-4" />
            </Button>
            <Button
              variant={currentView === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('week')}
              className="h-8 px-2"
            >
              <CalendarRange className="w-4 h-4" />
            </Button>
            <Button
              variant={currentView === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('month')}
              className="h-8 px-2"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm font-medium">{formatDate(currentDate)}</p>
        </div>
      </CardHeader>

      <CardContent>
        {currentView === 'day' && renderDayView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'month' && renderMonthView()}
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t text-xs">
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>

      {actions.includes('add_event') && (
        <CardFooter className="pt-4 border-t">
          <Button onClick={handleAddEvent}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
