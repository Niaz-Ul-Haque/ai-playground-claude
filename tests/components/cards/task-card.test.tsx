import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, createMockTask, userEvent } from '../../test-utils';
import { TaskCard } from '@/components/cards/task-card';
import type { TaskCardData } from '@/types/chat';
import * as ChatContext from '@/context/chat-context';

describe('TaskCard', () => {
  const mockHandleCompleteTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ChatContext, 'useChatContext').mockReturnValue({
      handleCompleteTask: mockHandleCompleteTask,
    } as any);
  });

  it('should render task title and description', () => {
    const task = createMockTask({
      title: 'Review Portfolio',
      description: 'Complete quarterly review',
    });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('Review Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Complete quarterly review')).toBeInTheDocument();
  });

  it('should display status badge', () => {
    const task = createMockTask({ status: 'in-progress' });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display priority badge', () => {
    const task = createMockTask({ priority: 'high' });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('high priority')).toBeInTheDocument();
  });

  it('should display Ciri Completed badge when task is Ciri completed', () => {
    const task = createMockTask({ aiCompleted: true });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('Ciri Completed')).toBeInTheDocument();
  });

  it('should display client name when present', () => {
    const task = createMockTask({ clientName: 'John Doe' });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should not display client section when no client', () => {
    const task = createMockTask({ clientName: undefined });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.queryByText('Client:')).not.toBeInTheDocument();
  });

  it('should display tags when present', () => {
    const task = createMockTask({ tags: ['urgent', 'portfolio'] });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('portfolio')).toBeInTheDocument();
  });

  it('should display AI completion data when present', () => {
    const task = createMockTask({
      aiCompleted: true,
      aiCompletionData: {
        completedAt: new Date().toISOString(),
        summary: 'Portfolio analysis complete',
        details: 'Full details here',
        confidence: 92,
      },
    });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('AI Completion Summary')).toBeInTheDocument();
    expect(screen.getByText('Portfolio analysis complete')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 92%')).toBeInTheDocument();
  });

  it('should show Mark Complete button for non-completed tasks', () => {
    const task = createMockTask({ status: 'pending' });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText('Mark Complete')).toBeInTheDocument();
  });

  it('should hide Mark Complete button for completed tasks', () => {
    const task = createMockTask({ status: 'completed' });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument();
  });

  it('should hide actions when showActions is false', () => {
    const task = createMockTask({ status: 'pending' });
    const data: TaskCardData = { task, showActions: false };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument();
  });

  it('should call handleCompleteTask when Mark Complete is clicked', async () => {
    const user = userEvent.setup();
    const task = createMockTask({ id: 'task-123', status: 'pending' });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    const button = screen.getByText('Mark Complete');
    await user.click(button);

    expect(mockHandleCompleteTask).toHaveBeenCalledWith('task-123');
    expect(mockHandleCompleteTask).toHaveBeenCalledTimes(1);
  });

  it('should display completion timestamp for completed tasks', () => {
    const task = createMockTask({
      status: 'completed',
      completedAt: '2025-12-04T14:00:00.000Z',
    });
    const data: TaskCardData = { task };

    renderWithProviders(<TaskCard data={data} />);

    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  describe('priority colors', () => {
    it('should apply high priority color', () => {
      const task = createMockTask({ priority: 'high' });
      const data: TaskCardData = { task };

      renderWithProviders(<TaskCard data={data} />);

      const badge = screen.getByText('high priority');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('should apply medium priority color', () => {
      const task = createMockTask({ priority: 'medium' });
      const data: TaskCardData = { task };

      renderWithProviders(<TaskCard data={data} />);

      const badge = screen.getByText('medium priority');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('should apply low priority color', () => {
      const task = createMockTask({ priority: 'low' });
      const data: TaskCardData = { task };

      renderWithProviders(<TaskCard data={data} />);

      const badge = screen.getByText('low priority');
      expect(badge).toHaveClass('bg-gray-100');
    });
  });
});
