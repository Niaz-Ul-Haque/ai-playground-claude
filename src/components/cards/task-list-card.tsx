'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  LayoutList,
  Users,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { TaskListCardData } from '@/types/chat';
import type { TaskSummary } from '@/types/task';
import { formatDueDate } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface TaskListCardProps {
  data: TaskListCardData;
}

type SortOption = 'due_date' | 'priority' | 'status' | 'client';
type GroupOption = 'none' | 'status' | 'client' | 'priority' | 'due_date';

const STATUS_ORDER = ['needs-review', 'in-progress', 'pending', 'completed'];
const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];

export function TaskListCard({ data }: TaskListCardProps) {
  const { handleApproveTask, handleRejectTask, handleExecuteAction } = useChatContext();
  const { title, tasks, show_actions = false } = data;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [sortAsc, setSortAsc] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupOption>('none');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(query) ||
          task.client_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (priorityFilter.length > 0 && task.priority && !priorityFilter.includes(task.priority)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Sorting
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'due_date':
          const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case 'priority':
          const prioA = PRIORITY_ORDER.indexOf(a.priority || 'low');
          const prioB = PRIORITY_ORDER.indexOf(b.priority || 'low');
          comparison = prioA - prioB;
          break;
        case 'status':
          const statusA = STATUS_ORDER.indexOf(a.status);
          const statusB = STATUS_ORDER.indexOf(b.status);
          comparison = statusA - statusB;
          break;
        case 'client':
          comparison = (a.client_name || '').localeCompare(b.client_name || '');
          break;
      }

      return sortAsc ? comparison : -comparison;
    });

    return sorted;
  }, [filteredTasks, sortBy, sortAsc]);

  // Grouping
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': sortedTasks };
    }

    const groups: Record<string, TaskSummary[]> = {};

    sortedTasks.forEach(task => {
      let key: string;

      switch (groupBy) {
        case 'status':
          key = task.status;
          break;
        case 'client':
          key = task.client_name || 'No Client';
          break;
        case 'priority':
          key = task.priority || 'No Priority';
          break;
        case 'due_date':
          if (!task.due_date) {
            key = 'No Due Date';
          } else {
            const date = new Date(task.due_date);
            const today = new Date();
            const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diff < 0) key = 'Overdue';
            else if (diff === 0) key = 'Today';
            else if (diff === 1) key = 'Tomorrow';
            else if (diff <= 7) key = 'This Week';
            else key = 'Later';
          }
          break;
        default:
          key = 'Other';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [sortedTasks, groupBy]);

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.task_id)));
    }
  };

  const handleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkComplete = async () => {
    for (const taskId of selectedTasks) {
      await handleApproveTask(taskId);
    }
    setSelectedTasks(new Set());
  };

  const handleBulkReassign = async () => {
    const assignee = prompt('Enter assignee name:');
    if (assignee) {
      await handleExecuteAction('bulk_reassign', 'tasks', 'bulk', {
        task_ids: Array.from(selectedTasks),
        assignee,
      });
      setSelectedTasks(new Set());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'needs-review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const uniqueStatuses = [...new Set(tasks.map(t => t.status))];
  const uniquePriorities = [...new Set(tasks.map(t => t.priority).filter(Boolean))];

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title || 'Tasks'}</CardTitle>
          <Badge variant="outline">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</Badge>
        </div>
        {data.description && (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8"
            />
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(statusFilter.length > 0 || priorityFilter.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1">
                    {statusFilter.length + priorityFilter.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {uniqueStatuses.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {uniquePriorities.map(priority => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={priorityFilter.includes(priority!)}
                  onCheckedChange={() => togglePriorityFilter(priority!)}
                >
                  {priority}
                </DropdownMenuCheckboxItem>
              ))}
              {(statusFilter.length > 0 || priorityFilter.length > 0) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setStatusFilter([]); setPriorityFilter([]); }}>
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSortBy('due_date'); setSortAsc(true); }}>
                <Calendar className="h-4 w-4 mr-2" />
                Due Date (Earliest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('due_date'); setSortAsc(false); }}>
                <Calendar className="h-4 w-4 mr-2" />
                Due Date (Latest)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy('priority'); setSortAsc(true); }}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Priority (Highest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('status'); setSortAsc(true); }}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('client'); setSortAsc(true); }}>
                <Users className="h-4 w-4 mr-2" />
                Client (A-Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Group */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <LayoutList className="h-4 w-4 mr-2" />
                Group
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setGroupBy('none')}>
                No Grouping
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setGroupBy('status')}>
                By Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('priority')}>
                By Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('client')}>
                By Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('due_date')}>
                By Due Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-primary/5 rounded-lg">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedTasks.size} selected</span>
            <Button variant="outline" size="sm" className="ml-auto h-7" onClick={handleBulkComplete}>
              Complete All
            </Button>
            <Button variant="outline" size="sm" className="h-7" onClick={handleBulkReassign}>
              Reassign
            </Button>
            <Button variant="ghost" size="sm" className="h-7" onClick={() => setSelectedTasks(new Set())}>
              Clear
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Select All */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <input
              type="checkbox"
              checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-xs text-muted-foreground">Select all</span>
          </div>
        )}

        {/* Grouped Tasks */}
        {Object.entries(groupedTasks).map(([group, groupTasks]) => (
          <div key={group} className="mb-4 last:mb-0">
            {groupBy !== 'none' && (
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium capitalize">{group}</h4>
                <Badge variant="secondary" className="text-xs">{groupTasks.length}</Badge>
              </div>
            )}

            <div className="space-y-2">
              {groupTasks.map((task) => (
                <div
                  key={task.task_id}
                  className={`flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                    selectedTasks.has(task.task_id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.task_id)}
                    onChange={() => handleSelectTask(task.task_id)}
                    className="h-4 w-4 mt-1 rounded border-gray-300"
                  />

                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.ai_completed && (
                          <Badge variant="secondary" className="text-xs">
                            AI Completed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {task.due_date && <span>{formatDueDate(task.due_date)}</span>}
                        {task.client_name && (
                          <>
                            <span>•</span>
                            <span>{task.client_name}</span>
                          </>
                        )}
                        {task.priority && (
                          <Badge
                            variant="outline"
                            className={`${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {show_actions && task.status === 'needs-review' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveTask(task.task_id)}
                        className="h-8 text-xs"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectTask(task.task_id)}
                        className="h-8 text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery || statusFilter.length > 0 || priorityFilter.length > 0
              ? 'No tasks match your filters'
              : 'No tasks'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
