import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, createMockClient, createMockTask } from '../../test-utils';
import { ClientCard } from '@/components/cards/client-card';
import type { ClientCardData } from '@/types/chat';

describe('ClientCard', () => {
  it('should render client name', () => {
    const client = createMockClient({ name: 'Sarah Chen' });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  it('should display client initials in avatar', () => {
    const client = createMockClient({ name: 'John Smith' });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('should display risk profile badge', () => {
    const client = createMockClient({ riskProfile: 'aggressive' });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('aggressive risk')).toBeInTheDocument();
  });

  it('should display account type', () => {
    const client = createMockClient({ accountType: 'TFSA & RRSP' });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('TFSA & RRSP')).toBeInTheDocument();
  });

  it('should display formatted portfolio value', () => {
    const client = createMockClient({ portfolioValue: 1250000 });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('$1,250,000')).toBeInTheDocument();
  });

  it('should display contact information', () => {
    const client = createMockClient({
      email: 'test@example.com',
      phone: '(416) 555-0100',
    });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('(416) 555-0100')).toBeInTheDocument();
  });

  it('should display address', () => {
    const client = createMockClient({
      address: '123 Main Street',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5H 2N2',
    });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('123 Main Street')).toBeInTheDocument();
    expect(screen.getByText(/Toronto, ON M5H 2N2/)).toBeInTheDocument();
  });

  it('should display next meeting when present', () => {
    const client = createMockClient({
      nextMeeting: '2025-12-15T14:00:00.000Z',
    });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('Next Meeting')).toBeInTheDocument();
  });

  it('should not display next meeting section when not present', () => {
    const client = createMockClient({ nextMeeting: undefined });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.queryByText('Next Meeting')).not.toBeInTheDocument();
  });

  it('should display notes when present', () => {
    const client = createMockClient({
      notes: 'Long-term client, prefers conservative investments',
    });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText(/Long-term client/)).toBeInTheDocument();
  });

  it('should display client tags', () => {
    const client = createMockClient({
      tags: ['high-value', 'retirement-planning'],
    });
    const data: ClientCardData = { client };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('high-value')).toBeInTheDocument();
    expect(screen.getByText('retirement-planning')).toBeInTheDocument();
  });

  it('should display recent tasks when provided', () => {
    const client = createMockClient();
    const recentTasks = [
      createMockTask({
        id: '1',
        title: 'Portfolio Review',
        dueDate: '2025-12-10T14:00:00.000Z',
      }),
      createMockTask({
        id: '2',
        title: 'Meeting Follow-up',
        dueDate: '2025-12-12T10:00:00.000Z',
      }),
    ];
    const data: ClientCardData = { client, recentTasks };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Review')).toBeInTheDocument();
    expect(screen.getByText('Meeting Follow-up')).toBeInTheDocument();
  });

  it('should not display recent tasks section when empty', () => {
    const client = createMockClient();
    const data: ClientCardData = { client, recentTasks: [] };

    renderWithProviders(<ClientCard data={data} />);

    expect(screen.queryByText('Recent Tasks')).not.toBeInTheDocument();
  });

  describe('risk profile colors', () => {
    it('should apply aggressive risk color', () => {
      const client = createMockClient({ riskProfile: 'aggressive' });
      const data: ClientCardData = { client };

      renderWithProviders(<ClientCard data={data} />);

      const badge = screen.getByText('aggressive risk');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('should apply moderate risk color', () => {
      const client = createMockClient({ riskProfile: 'moderate' });
      const data: ClientCardData = { client };

      renderWithProviders(<ClientCard data={data} />);

      const badge = screen.getByText('moderate risk');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('should apply conservative risk color', () => {
      const client = createMockClient({ riskProfile: 'conservative' });
      const data: ClientCardData = { client };

      renderWithProviders(<ClientCard data={data} />);

      const badge = screen.getByText('conservative risk');
      expect(badge).toHaveClass('bg-green-100');
    });
  });
});
