import type { TimelineEvent } from '@/types/client';

export const MOCK_TIMELINE: TimelineEvent[] = [
  // Michael Johnson (id: 1) - recent activity
  {
    id: 'tl-1',
    clientId: '1',
    type: 'meeting',
    title: 'Quarterly Portfolio Review',
    description: 'Discussed Q3 performance and rebalancing strategy. Client expressed interest in ESG investments.',
    timestamp: '2025-11-28T10:30:00.000Z',
    metadata: { duration: 60, location: 'Office' }
  },
  {
    id: 'tl-2',
    clientId: '1',
    type: 'email',
    title: 'ESG Investment Options',
    description: 'Sent overview of ESG ETF options and sustainable investing strategies.',
    timestamp: '2025-11-29T14:00:00.000Z'
  },
  {
    id: 'tl-3',
    clientId: '1',
    type: 'task_completed',
    title: 'Portfolio Review Report Generated',
    description: 'AI completed Q4 portfolio analysis with rebalancing recommendations.',
    timestamp: '2025-12-04T08:30:00.000Z'
  },
  {
    id: 'tl-4',
    clientId: '1',
    type: 'milestone',
    title: 'Birthday Coming Up',
    description: 'Michael turns 57 on May 15th.',
    timestamp: '2025-05-15T00:00:00.000Z',
    metadata: { type: 'birthday', age: 57 }
  },

  // Sarah Chen (id: 2) - recent activity
  {
    id: 'tl-5',
    clientId: '2',
    type: 'call',
    title: 'RRSP Strategy Discussion',
    description: 'Discussed maximizing RRSP contributions before year end.',
    timestamp: '2025-12-01T14:15:00.000Z',
    metadata: { duration: 25 }
  },
  {
    id: 'tl-6',
    clientId: '2',
    type: 'email',
    title: 'RRSP Contribution Reminder',
    description: 'Sent annual RRSP contribution reminder email.',
    timestamp: '2025-12-04T07:15:00.000Z'
  },
  {
    id: 'tl-7',
    clientId: '2',
    type: 'policy_change',
    title: 'TFSA Contribution Made',
    description: 'Client made $7,000 TFSA contribution for 2025.',
    timestamp: '2025-11-15T09:00:00.000Z',
    metadata: { amount: 7000, accountType: 'TFSA' }
  },

  // David and Emily Williams (id: 3) - recent activity
  {
    id: 'tl-8',
    clientId: '3',
    type: 'meeting',
    title: 'Retirement Planning Session',
    description: 'Comprehensive retirement income planning discussion. Reviewed pension options and CPP/OAS strategies.',
    timestamp: '2025-12-03T15:30:00.000Z',
    metadata: { duration: 90, location: 'Video Call', attendees: ['David Williams', 'Emily Williams'] }
  },
  {
    id: 'tl-9',
    clientId: '3',
    type: 'note',
    title: 'Estate Planning Follow-up',
    description: 'Need to schedule meeting with their lawyer to review beneficiary designations.',
    timestamp: '2025-12-03T17:00:00.000Z'
  },
  {
    id: 'tl-10',
    clientId: '3',
    type: 'milestone',
    title: 'Wedding Anniversary',
    description: '40th wedding anniversary approaching.',
    timestamp: '2026-06-15T00:00:00.000Z',
    metadata: { type: 'anniversary', years: 40 }
  },

  // Robert Thompson (id: 4) - recent activity
  {
    id: 'tl-11',
    clientId: '4',
    type: 'call',
    title: 'RRIF Withdrawal Discussion',
    description: 'Discussed minimum RRIF withdrawal amounts for 2026.',
    timestamp: '2025-11-15T09:45:00.000Z',
    metadata: { duration: 20 }
  },
  {
    id: 'tl-12',
    clientId: '4',
    type: 'payment',
    title: 'RRIF Monthly Withdrawal',
    description: 'Monthly RRIF withdrawal of $3,200 processed.',
    timestamp: '2025-12-01T00:00:00.000Z',
    metadata: { amount: 3200, type: 'withdrawal' }
  },
  {
    id: 'tl-13',
    clientId: '4',
    type: 'system',
    title: 'GIC Maturity Alert',
    description: '5-year GIC ($50,000) maturing in 30 days.',
    timestamp: '2025-12-10T00:00:00.000Z',
    metadata: { amount: 50000, maturityDate: '2026-01-10' }
  },

  // Priya Patel (id: 5) - recent activity
  {
    id: 'tl-14',
    clientId: '5',
    type: 'meeting',
    title: 'RESP Review',
    description: 'Annual review of children\'s RESP performance. Discussed contribution strategy.',
    timestamp: '2025-11-22T16:20:00.000Z',
    metadata: { duration: 45, location: 'Office' }
  },
  {
    id: 'tl-15',
    clientId: '5',
    type: 'email',
    title: 'Business Succession Planning',
    description: 'Shared article on business succession planning for small business owners.',
    timestamp: '2025-11-25T10:00:00.000Z'
  },
  {
    id: 'tl-16',
    clientId: '5',
    type: 'payment',
    title: 'RESP Contribution',
    description: 'Annual RESP contribution of $7,500 per child (total $15,000).',
    timestamp: '2025-12-01T00:00:00.000Z',
    metadata: { amount: 15000, type: 'contribution' }
  },

  // James Morrison (id: 6) - recent activity
  {
    id: 'tl-17',
    clientId: '6',
    type: 'meeting',
    title: 'Alternative Investments Review',
    description: 'Discussed private equity opportunities and cryptocurrency allocation.',
    timestamp: '2025-12-05T11:00:00.000Z',
    metadata: { duration: 75, location: 'Office' }
  },
  {
    id: 'tl-18',
    clientId: '6',
    type: 'note',
    title: 'Risk Assessment Update',
    description: 'Client wants to increase crypto exposure to 5% of portfolio. Need to document risk tolerance update.',
    timestamp: '2025-12-05T12:15:00.000Z'
  },
  {
    id: 'tl-19',
    clientId: '6',
    type: 'policy_change',
    title: 'Portfolio Rebalancing',
    description: 'Executed rebalancing: reduced Canadian equities, increased US tech exposure.',
    timestamp: '2025-11-20T09:00:00.000Z',
    metadata: { tradeValue: 125000 }
  },

  // Lisa Rodriguez (id: 7) - recent activity
  {
    id: 'tl-20',
    clientId: '7',
    type: 'meeting',
    title: 'Inheritance Planning Session',
    description: 'Discussed allocation strategy for $200,000 inheritance. Focused on ESG options.',
    timestamp: '2025-12-08T13:45:00.000Z',
    metadata: { duration: 60, location: 'Video Call' }
  },
  {
    id: 'tl-21',
    clientId: '7',
    type: 'email',
    title: 'ESG Portfolio Recommendations',
    description: 'Sent detailed ESG investment recommendations for inheritance allocation.',
    timestamp: '2025-12-13T14:20:00.000Z'
  },
  {
    id: 'tl-22',
    clientId: '7',
    type: 'milestone',
    title: 'Early Retirement Target',
    description: 'Target retirement age 60 (in 7 years).',
    timestamp: '2032-08-14T00:00:00.000Z',
    metadata: { type: 'retirement', targetAge: 60 }
  },

  // Ahmed Hassan (id: 8) - recent activity
  {
    id: 'tl-23',
    clientId: '8',
    type: 'call',
    title: 'Home Purchase Planning',
    description: 'Discussed timeline for home purchase and down payment strategy.',
    timestamp: '2025-11-30T14:00:00.000Z',
    metadata: { duration: 30 }
  },
  {
    id: 'tl-24',
    clientId: '8',
    type: 'task_completed',
    title: 'TFSA vs Down Payment Analysis',
    description: 'AI completed analysis comparing TFSA contribution vs larger down payment options.',
    timestamp: '2025-12-14T09:30:00.000Z'
  },
  {
    id: 'tl-25',
    clientId: '8',
    type: 'milestone',
    title: 'Wedding Anniversary',
    description: 'First wedding anniversary approaching.',
    timestamp: '2026-03-15T00:00:00.000Z',
    metadata: { type: 'anniversary', years: 1 }
  },

  // Margaret O'Connor (id: 9) - recent activity
  {
    id: 'tl-26',
    clientId: '9',
    type: 'meeting',
    title: 'Estate Planning Review',
    description: 'Annual review of estate planning documents and beneficiary designations.',
    timestamp: '2025-12-10T10:15:00.000Z',
    metadata: { duration: 60, location: 'Home Visit' }
  },
  {
    id: 'tl-27',
    clientId: '9',
    type: 'email',
    title: 'Grandchildren Education Savings',
    description: 'Discussed options for contributing to grandchildren\'s education savings.',
    timestamp: '2025-12-11T09:00:00.000Z'
  },
  {
    id: 'tl-28',
    clientId: '9',
    type: 'payment',
    title: 'RRIF Withdrawal',
    description: 'Annual RRIF minimum withdrawal of $58,000 processed.',
    timestamp: '2025-12-01T00:00:00.000Z',
    metadata: { amount: 58000, type: 'withdrawal' }
  },

  // Kevin and Jennifer Zhang (id: 10) - recent activity
  {
    id: 'tl-29',
    clientId: '10',
    type: 'meeting',
    title: 'Year-End Tax Planning',
    description: 'Discussed tax-efficient investment strategies and RESP contributions.',
    timestamp: '2025-12-02T16:30:00.000Z',
    metadata: { duration: 45, location: 'Video Call', attendees: ['Kevin Zhang', 'Jennifer Zhang'] }
  },
  {
    id: 'tl-30',
    clientId: '10',
    type: 'task_completed',
    title: 'RESP Annual Report Generated',
    description: 'AI generated RESP performance report for all three children.',
    timestamp: '2025-12-13T16:45:00.000Z',
    artifactIds: ['art-15']
  },
  {
    id: 'tl-31',
    clientId: '10',
    type: 'payment',
    title: 'RESP Contributions',
    description: 'Annual RESP contributions: $7,000 per child ($21,000 total).',
    timestamp: '2025-12-01T00:00:00.000Z',
    metadata: { amount: 21000, type: 'contribution' }
  }
];
