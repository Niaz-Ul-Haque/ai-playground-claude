import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, createMockTask, userEvent } from '../../test-utils';
import { ReviewCard } from '@/components/cards/review-card';
import type { ReviewCardData } from '@/types/chat';
import * as ChatContext from '@/context/chat-context';

describe('ReviewCard', () => {
  const mockHandleApproveTask = vi.fn();
  const mockHandleRejectTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ChatContext, 'useChatContext').mockReturnValue({
      handleApproveTask: mockHandleApproveTask,
      handleRejectTask: mockHandleRejectTask,
    } as any);
  });

  it('should render title and message', () => {
    const task = createMockTask();
    const data: ReviewCardData = {
      task,
      title: 'Review Email Draft',
      message: 'I have drafted an email for your client',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Review Email Draft')).toBeInTheDocument();
    expect(screen.getByText('I have drafted an email for your client')).toBeInTheDocument();
  });

  it('should display "Needs Review" badge', () => {
    const task = createMockTask();
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Please review',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Needs Review')).toBeInTheDocument();
  });

  it('should display task title', () => {
    const task = createMockTask({ title: 'Send RRSP Reminder' });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Send RRSP Reminder')).toBeInTheDocument();
  });

  it('should display action type label', () => {
    const task = createMockTask({
      aiActionType: 'email_draft',
    });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Email Draft')).toBeInTheDocument();
  });

  it('should display confidence level', () => {
    const task = createMockTask({
      aiCompletionData: {
        completedAt: new Date().toISOString(),
        summary: 'Summary',
        details: 'Details',
        confidence: 95,
      },
    });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('95% confident')).toBeInTheDocument();
  });

  it('should display AI completion summary', () => {
    const task = createMockTask({
      aiCompletionData: {
        completedAt: new Date().toISOString(),
        summary: 'Email drafted and ready to send',
        details: 'Full email content',
        confidence: 88,
      },
    });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Email drafted and ready to send')).toBeInTheDocument();
  });

  it('should show "Show details" button when details are present', () => {
    const task = createMockTask({
      aiCompletionData: {
        completedAt: new Date().toISOString(),
        summary: 'Summary',
        details: 'Detailed information here',
        confidence: 90,
      },
    });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Show details')).toBeInTheDocument();
  });

  it('should expand details when "Show details" is clicked', async () => {
    const user = userEvent.setup();
    const task = createMockTask({
      aiCompletionData: {
        completedAt: new Date().toISOString(),
        summary: 'Summary',
        details: 'This is the detailed content',
        confidence: 90,
      },
    });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    // Details should not be visible initially
    expect(screen.queryByText('This is the detailed content')).not.toBeInTheDocument();

    // Click Show details
    const showButton = screen.getByText('Show details');
    await user.click(showButton);

    // Details should now be visible
    expect(screen.getByText('This is the detailed content')).toBeInTheDocument();
    expect(screen.getByText('Hide details')).toBeInTheDocument();
  });

  it('should collapse details when "Hide details" is clicked', async () => {
    const user = userEvent.setup();
    const task = createMockTask({
      aiCompletionData: {
        completedAt: new Date().toISOString(),
        summary: 'Summary',
        details: 'Detailed content',
        confidence: 90,
      },
    });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    // Expand
    await user.click(screen.getByText('Show details'));
    expect(screen.getByText('Detailed content')).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByText('Hide details'));
    expect(screen.queryByText('Detailed content')).not.toBeInTheDocument();
  });

  it('should display Approve & Send button', () => {
    const task = createMockTask();
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Approve & Send')).toBeInTheDocument();
  });

  it('should display Reject button', () => {
    const task = createMockTask();
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('should call handleApproveTask when Approve is clicked', async () => {
    const user = userEvent.setup();
    const task = createMockTask({ id: 'task-456' });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    const approveButton = screen.getByText('Approve & Send');
    await user.click(approveButton);

    expect(mockHandleApproveTask).toHaveBeenCalledWith('task-456');
    expect(mockHandleApproveTask).toHaveBeenCalledTimes(1);
  });

  it('should call handleRejectTask when Reject is clicked', async () => {
    const user = userEvent.setup();
    const task = createMockTask({ id: 'task-789' });
    const data: ReviewCardData = {
      task,
      title: 'Review',
      message: 'Message',
    };

    renderWithProviders(<ReviewCard data={data} />);

    const rejectButton = screen.getByText('Reject');
    await user.click(rejectButton);

    expect(mockHandleRejectTask).toHaveBeenCalledWith('task-789');
    expect(mockHandleRejectTask).toHaveBeenCalledTimes(1);
  });

  describe('action type labels', () => {
    const actionTypes: Array<[string, string]> = [
      ['email_draft', 'Email Draft'],
      ['portfolio_review', 'Portfolio Review'],
      ['meeting_notes', 'Meeting Notes'],
      ['report', 'Report'],
      ['reminder', 'Reminder'],
      ['analysis', 'Analysis'],
    ];

    actionTypes.forEach(([type, label]) => {
      it(`should display "${label}" for ${type}`, () => {
        const task = createMockTask({ aiActionType: type as any });
        const data: ReviewCardData = {
          task,
          title: 'Review',
          message: 'Message',
        };

        renderWithProviders(<ReviewCard data={data} />);

        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });
});
