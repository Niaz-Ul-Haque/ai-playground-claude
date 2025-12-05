import type { Task } from '@/types/task';

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review Johnson Portfolio Q4 Performance',
    description: 'Quarterly review of portfolio performance and rebalancing recommendations',
    status: 'needs-review',
    dueDate: '2025-12-04T14:00:00.000Z',
    clientId: '1',
    clientName: 'Michael Johnson',
    priority: 'high',
    tags: ['portfolio', 'quarterly-review'],
    createdAt: '2025-12-01T09:00:00.000Z',
    updatedAt: '2025-12-04T08:30:00.000Z',
    aiCompleted: true,
    aiActionType: 'portfolio_review',
    aiCompletionData: {
      completedAt: '2025-12-04T08:30:00.000Z',
      summary: 'Portfolio analysis complete with rebalancing recommendations',
      details: 'The portfolio has performed well with a 7.2% return YTD. Current allocation is 65% equities, 30% fixed income, 5% cash. Recommend minor rebalancing: reduce equity exposure by 5% to lock in gains and increase fixed income allocation. Specifically, consider trimming Canadian bank positions and adding government bonds.',
      confidence: 92
    }
  },
  {
    id: '2',
    title: 'Draft Email: Chen RRSP Contribution Reminder',
    description: 'Send annual RRSP contribution reminder to Sarah Chen',
    status: 'needs-review',
    dueDate: '2025-12-04T10:00:00.000Z',
    clientId: '2',
    clientName: 'Sarah Chen',
    priority: 'medium',
    tags: ['email', 'rrsp', 'tax-planning'],
    createdAt: '2025-12-02T10:00:00.000Z',
    updatedAt: '2025-12-04T07:15:00.000Z',
    aiCompleted: true,
    aiActionType: 'email_draft',
    aiCompletionData: {
      completedAt: '2025-12-04T07:15:00.000Z',
      summary: 'RRSP contribution reminder email drafted',
      details: 'Subject: RRSP Contribution Deadline Approaching - Maximize Your 2025 Tax Benefits\n\nHi Sarah,\n\nI hope this email finds you well. I wanted to reach out as we approach the RRSP contribution deadline for the 2025 tax year (March 1, 2026).\n\nBased on your current income and contribution room, you have $18,500 remaining in RRSP contribution room. Contributing the full amount could save you approximately $7,400 in taxes.\n\nI recommend we schedule a brief call to discuss your contribution strategy and ensure you maximize this tax-advantaged opportunity.\n\nPlease let me know your availability.\n\nBest regards,\n[Your name]',
      confidence: 88
    }
  },
  {
    id: '3',
    title: 'Prepare Meeting Notes: Williams Retirement Planning',
    description: 'Document meeting discussion and action items from retirement planning session',
    status: 'needs-review',
    dueDate: '2025-12-04T16:00:00.000Z',
    clientId: '3',
    clientName: 'David and Emily Williams',
    priority: 'medium',
    tags: ['meeting-notes', 'retirement'],
    createdAt: '2025-12-03T15:30:00.000Z',
    updatedAt: '2025-12-04T09:45:00.000Z',
    aiCompleted: true,
    aiActionType: 'meeting_notes',
    aiCompletionData: {
      completedAt: '2025-12-04T09:45:00.000Z',
      summary: 'Meeting notes compiled with action items',
      details: 'Meeting Date: December 3, 2025\nAttendees: David Williams, Emily Williams\nTopic: Retirement Planning Review\n\nKey Discussion Points:\n- Target retirement age: 65 (in 8 years)\n- Current retirement savings: $850,000\n- Desired retirement income: $80,000/year\n- Concerns about market volatility\n\nAction Items:\n1. Run retirement projection scenarios\n2. Discuss pension income splitting strategies\n3. Review estate planning documents\n4. Schedule follow-up in January 2026\n\nNext Steps:\n- Prepare detailed retirement income projection\n- Research optimal CPP/OAS claiming strategies',
      confidence: 95
    }
  },
  {
    id: '4',
    title: 'Follow-up Call: Thompson TFSA Investment',
    description: 'Call Robert Thompson to discuss TFSA investment options',
    status: 'pending',
    dueDate: '2025-12-04T11:00:00.000Z',
    clientId: '4',
    clientName: 'Robert Thompson',
    priority: 'high',
    tags: ['call', 'tfsa'],
    createdAt: '2025-12-02T14:00:00.000Z',
    updatedAt: '2025-12-02T14:00:00.000Z'
  },
  {
    id: '5',
    title: 'Review Patel Insurance Coverage',
    description: 'Annual review of life and disability insurance coverage',
    status: 'pending',
    dueDate: '2025-12-04T15:00:00.000Z',
    clientId: '5',
    clientName: 'Priya Patel',
    priority: 'medium',
    tags: ['insurance', 'annual-review'],
    createdAt: '2025-12-03T09:00:00.000Z',
    updatedAt: '2025-12-03T09:00:00.000Z'
  },
  {
    id: '6',
    title: 'Quarterly Market Commentary',
    description: 'Prepare and send Q4 market commentary to all clients',
    status: 'in-progress',
    dueDate: '2025-12-05T17:00:00.000Z',
    priority: 'medium',
    tags: ['market-commentary', 'quarterly'],
    createdAt: '2025-12-01T10:00:00.000Z',
    updatedAt: '2025-12-04T08:00:00.000Z'
  },
  {
    id: '7',
    title: 'Schedule Johnson Annual Review Meeting',
    description: 'Book meeting room and send calendar invite for annual review',
    status: 'pending',
    dueDate: '2025-12-05T09:00:00.000Z',
    clientId: '1',
    clientName: 'Michael Johnson',
    priority: 'low',
    tags: ['scheduling', 'annual-review'],
    createdAt: '2025-12-03T11:00:00.000Z',
    updatedAt: '2025-12-03T11:00:00.000Z'
  },
  {
    id: '8',
    title: 'Update Chen Portfolio Holdings',
    description: 'Update portfolio management system with recent trades',
    status: 'completed',
    dueDate: '2025-12-03T12:00:00.000Z',
    clientId: '2',
    clientName: 'Sarah Chen',
    priority: 'medium',
    tags: ['portfolio', 'data-entry'],
    createdAt: '2025-12-02T09:00:00.000Z',
    updatedAt: '2025-12-03T10:30:00.000Z',
    completedAt: '2025-12-03T10:30:00.000Z'
  },
  {
    id: '9',
    title: 'Tax Loss Harvesting Review',
    description: 'Review all portfolios for tax loss harvesting opportunities',
    status: 'pending',
    dueDate: '2025-12-06T16:00:00.000Z',
    priority: 'high',
    tags: ['tax-planning', 'year-end'],
    createdAt: '2025-12-04T08:00:00.000Z',
    updatedAt: '2025-12-04T08:00:00.000Z'
  },
  {
    id: '10',
    title: 'Compliance: Q4 Trade Confirmations',
    description: 'Verify all Q4 trade confirmations have been sent to clients',
    status: 'pending',
    dueDate: '2025-12-08T17:00:00.000Z',
    priority: 'high',
    tags: ['compliance', 'quarterly'],
    createdAt: '2025-12-04T09:00:00.000Z',
    updatedAt: '2025-12-04T09:00:00.000Z'
  }
];
