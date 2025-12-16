'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task } from '@/types/task';
import type { CustomStatus } from '@/lib/mock-data';
import { KanbanColumn } from './kanban-column';
import { KanbanTaskCard } from './kanban-task-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  tasks: Task[];
  statuses: CustomStatus[];
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newStatus: string, newOrder: number) => void;
}

export function KanbanBoard({
  tasks,
  statuses,
  onTaskClick,
  onTaskMove,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    statuses.forEach((status) => {
      grouped[status.id] = tasks
        .filter((task) => task.status === status.id)
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    });
    return grouped;
  }, [tasks, statuses]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = () => {
    // This can be used for real-time visual feedback if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine the target status (column)
    let targetStatus: string = activeTask.status;
    let targetTasks = tasksByStatus[targetStatus];

    // Check if over is a column or a task
    const isOverColumn = statuses.some((s) => s.id === overId);
    
    if (isOverColumn) {
      targetStatus = overId;
      targetTasks = tasksByStatus[targetStatus];
    } else {
      // Over is a task, find its status
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        targetTasks = tasksByStatus[targetStatus];
      }
    }

    // If moving to a different column
    if (targetStatus !== activeTask.status) {
      // Add to end of new column
      const newOrder = targetTasks.length;
      onTaskMove(activeId, targetStatus, newOrder);
    } else {
      // Reordering within same column
      const oldIndex = targetTasks.findIndex((t) => t.id === activeId);
      const newIndex = isOverColumn
        ? targetTasks.length - 1
        : targetTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(targetTasks, oldIndex, newIndex);
        // Update orders for all tasks in this column
        reordered.forEach((task, index) => {
          if (task.id === activeId) {
            onTaskMove(activeId, targetStatus, index);
          }
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-1 pb-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status.id}
              id={status.id}
              title={status.name}
              tasks={tasksByStatus[status.id] || []}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </ScrollArea>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <KanbanTaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
