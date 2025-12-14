import type { ClientAsset } from '@/types/client';

export const MOCK_ASSETS: ClientAsset[] = [
  // Michael Johnson (id: 1) - assets
  {
    id: 'asset-1',
    clientId: '1',
    type: 'rrsp',
    name: 'RRSP Investment Account',
    accountNumber: 'RSP-4521-8890',
    institution: 'TD Wealth',
    value: 750000,
    status: 'active',
    startDate: '2010-03-15T00:00:00.000Z',
    beneficiary: 'Susan Johnson (spouse)',
    notes: 'Primary retirement savings, moderate growth portfolio'
  },
  {
    id: 'asset-2',
    clientId: '1',
    type: 'non_registered',
    name: 'Non-Registered Investment',
    accountNumber: 'NR-4521-8891',
    institution: 'TD Wealth',
    value: 450000,
    status: 'active',
    startDate: '2012-06-20T00:00:00.000Z',
    notes: 'Dividend-focused portfolio for supplemental income'
  },
  {
    id: 'asset-3',
    clientId: '1',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-4521-8892',
    institution: 'TD Wealth',
    value: 50000,
    status: 'active',
    startDate: '2015-01-10T00:00:00.000Z',
    beneficiary: 'Susan Johnson (spouse)',
    alerts: [
      { id: 'alert-1', type: 'contribution_room', message: 'TFSA contribution room available: $7,000', severity: 'info' }
    ]
  },

  // Sarah Chen (id: 2) - assets
  {
    id: 'asset-4',
    clientId: '2',
    type: 'tfsa',
    name: 'TFSA Growth Account',
    accountNumber: 'TFSA-7823-1102',
    institution: 'RBC Dominion Securities',
    value: 95000,
    status: 'active',
    startDate: '2018-06-20T00:00:00.000Z',
    beneficiary: 'David Chen (father)',
    notes: 'Maxed out annually, aggressive growth strategy'
  },
  {
    id: 'asset-5',
    clientId: '2',
    type: 'rrsp',
    name: 'RRSP',
    accountNumber: 'RSP-7823-1103',
    institution: 'RBC Dominion Securities',
    value: 355000,
    status: 'active',
    startDate: '2018-06-20T00:00:00.000Z',
    beneficiary: 'David Chen (father)',
    alerts: [
      { id: 'alert-2', type: 'contribution_room', message: 'RRSP contribution room: $18,500 remaining', severity: 'warning', dueDate: '2026-03-01T00:00:00.000Z' }
    ]
  },

  // David and Emily Williams (id: 3) - assets
  {
    id: 'asset-6',
    clientId: '3',
    type: 'rrsp',
    name: 'David RRSP',
    accountNumber: 'RSP-9012-3340',
    institution: 'BMO Nesbitt Burns',
    value: 520000,
    status: 'active',
    startDate: '2012-09-05T00:00:00.000Z',
    beneficiary: 'Emily Williams (spouse)',
    notes: 'Converting to RRIF at 65'
  },
  {
    id: 'asset-7',
    clientId: '3',
    type: 'rrsp',
    name: 'Emily RRSP',
    accountNumber: 'RSP-9012-3341',
    institution: 'BMO Nesbitt Burns',
    value: 330000,
    status: 'active',
    startDate: '2012-09-05T00:00:00.000Z',
    beneficiary: 'David Williams (spouse)'
  },
  {
    id: 'asset-8',
    clientId: '3',
    type: 'non_registered',
    name: 'Joint Non-Registered',
    accountNumber: 'NR-9012-3342',
    institution: 'BMO Nesbitt Burns',
    value: 850000,
    status: 'active',
    startDate: '2012-09-05T00:00:00.000Z',
    notes: 'Joint account, 50/50 ownership'
  },
  {
    id: 'asset-9',
    clientId: '3',
    type: 'tfsa',
    name: 'David TFSA',
    accountNumber: 'TFSA-9012-3343',
    institution: 'BMO Nesbitt Burns',
    value: 95000,
    status: 'active',
    startDate: '2015-01-15T00:00:00.000Z'
  },
  {
    id: 'asset-10',
    clientId: '3',
    type: 'tfsa',
    name: 'Emily TFSA',
    accountNumber: 'TFSA-9012-3344',
    institution: 'BMO Nesbitt Burns',
    value: 95000,
    status: 'active',
    startDate: '2015-01-15T00:00:00.000Z'
  },
  {
    id: 'asset-11',
    clientId: '3',
    type: 'pension',
    name: 'David Pension',
    institution: 'Ontario Teachers\' Pension Plan',
    value: 210000,
    status: 'active',
    startDate: '1992-09-01T00:00:00.000Z',
    notes: 'Defined benefit pension, vested'
  },

  // Robert Thompson (id: 4) - assets
  {
    id: 'asset-12',
    clientId: '4',
    type: 'rrif',
    name: 'RRIF',
    accountNumber: 'RIF-5543-9920',
    institution: 'Scotia McLeod',
    value: 680000,
    status: 'active',
    startDate: '2020-12-01T00:00:00.000Z',
    beneficiary: 'Karen Thompson (daughter)',
    notes: 'Converted from RRSP, monthly withdrawals'
  },
  {
    id: 'asset-13',
    clientId: '4',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-5543-9921',
    institution: 'Scotia McLeod',
    value: 50000,
    status: 'active',
    startDate: '2016-02-15T00:00:00.000Z',
    beneficiary: 'Karen Thompson (daughter)'
  },
  {
    id: 'asset-14',
    clientId: '4',
    type: 'gic',
    name: '5-Year GIC',
    accountNumber: 'GIC-5543-9922',
    institution: 'Bank of Nova Scotia',
    value: 50000,
    status: 'active',
    startDate: '2021-01-10T00:00:00.000Z',
    maturityDate: '2026-01-10T00:00:00.000Z',
    notes: '4.5% annual interest',
    alerts: [
      { id: 'alert-3', type: 'expiry', message: 'GIC matures in 27 days - reinvestment decision needed', severity: 'warning', dueDate: '2026-01-10T00:00:00.000Z' }
    ]
  },
  {
    id: 'asset-15',
    clientId: '4',
    type: 'pension',
    name: 'Company Pension',
    institution: 'SNC-Lavalin Pension',
    value: 0,
    status: 'active',
    startDate: '1980-06-01T00:00:00.000Z',
    notes: 'Defined benefit, $4,200/month'
  },

  // Priya Patel (id: 5) - assets
  {
    id: 'asset-16',
    clientId: '5',
    type: 'resp',
    name: 'RESP - Anaya',
    accountNumber: 'RESP-6677-1140',
    institution: 'RBC Direct Investing',
    value: 75000,
    status: 'active',
    startDate: '2019-04-08T00:00:00.000Z',
    beneficiary: 'Anaya Patel',
    notes: 'Grant room: $500 remaining for 2025'
  },
  {
    id: 'asset-17',
    clientId: '5',
    type: 'resp',
    name: 'RESP - Dev',
    accountNumber: 'RESP-6677-1141',
    institution: 'RBC Direct Investing',
    value: 52000,
    status: 'active',
    startDate: '2022-06-15T00:00:00.000Z',
    beneficiary: 'Dev Patel',
    notes: 'Grant room: $500 remaining for 2025'
  },
  {
    id: 'asset-18',
    clientId: '5',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-6677-1142',
    institution: 'RBC Direct Investing',
    value: 88000,
    status: 'active',
    startDate: '2019-04-08T00:00:00.000Z'
  },
  {
    id: 'asset-19',
    clientId: '5',
    type: 'rrsp',
    name: 'RRSP',
    accountNumber: 'RSP-6677-1143',
    institution: 'RBC Direct Investing',
    value: 105000,
    status: 'active',
    startDate: '2019-04-08T00:00:00.000Z',
    beneficiary: 'Raj Patel (spouse)'
  },

  // James Morrison (id: 6) - assets
  {
    id: 'asset-20',
    clientId: '6',
    type: 'non_registered',
    name: 'Growth Portfolio',
    accountNumber: 'NR-8899-2240',
    institution: 'CIBC Wood Gundy',
    value: 650000,
    status: 'active',
    startDate: '2016-11-20T00:00:00.000Z',
    notes: 'Aggressive growth, US tech focus',
    alerts: [
      { id: 'alert-4', type: 'rebalance', message: 'Portfolio drift detected - rebalancing recommended', severity: 'info' }
    ]
  },
  {
    id: 'asset-21',
    clientId: '6',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-8899-2241',
    institution: 'CIBC Wood Gundy',
    value: 95000,
    status: 'active',
    startDate: '2016-11-20T00:00:00.000Z',
    beneficiary: 'Christina Morrison (spouse)'
  },
  {
    id: 'asset-22',
    clientId: '6',
    type: 'property',
    name: 'Investment Properties',
    institution: 'Morrison Properties Inc.',
    value: 145000,
    status: 'active',
    startDate: '2018-03-01T00:00:00.000Z',
    notes: 'Managed separately through holding company (value represents portfolio allocation only)'
  },

  // Lisa Rodriguez (id: 7) - assets
  {
    id: 'asset-23',
    clientId: '7',
    type: 'rrsp',
    name: 'RRSP',
    accountNumber: 'RSP-3344-5560',
    institution: 'National Bank',
    value: 420000,
    status: 'active',
    startDate: '2020-02-14T00:00:00.000Z',
    notes: 'Post-divorce rollover'
  },
  {
    id: 'asset-24',
    clientId: '7',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-3344-5561',
    institution: 'National Bank',
    value: 95000,
    status: 'active',
    startDate: '2020-02-14T00:00:00.000Z'
  },
  {
    id: 'asset-25',
    clientId: '7',
    type: 'non_registered',
    name: 'Inheritance Account',
    accountNumber: 'NR-3344-5562',
    institution: 'National Bank',
    value: 100000,
    status: 'pending',
    startDate: '2025-12-08T00:00:00.000Z',
    notes: 'Pending investment decisions for $200,000 inheritance'
  },

  // Ahmed Hassan (id: 8) - assets
  {
    id: 'asset-26',
    clientId: '8',
    type: 'rrsp',
    name: 'RRSP',
    accountNumber: 'RSP-2211-7780',
    institution: 'TD Direct Investing',
    value: 280000,
    status: 'active',
    startDate: '2021-07-10T00:00:00.000Z',
    beneficiary: 'Fatima Hassan (spouse)'
  },
  {
    id: 'asset-27',
    clientId: '8',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-2211-7781',
    institution: 'TD Direct Investing',
    value: 65000,
    status: 'active',
    startDate: '2021-07-10T00:00:00.000Z',
    beneficiary: 'Fatima Hassan (spouse)',
    alerts: [
      { id: 'alert-5', type: 'action_needed', message: 'Home purchase decision: TFSA withdrawal vs. larger down payment', severity: 'warning' }
    ]
  },
  {
    id: 'asset-28',
    clientId: '8',
    type: 'non_registered',
    name: 'Down Payment Savings',
    accountNumber: 'NR-2211-7782',
    institution: 'TD Direct Investing',
    value: 35000,
    status: 'active',
    startDate: '2023-01-15T00:00:00.000Z',
    notes: 'Earmarked for home down payment'
  },

  // Margaret O'Connor (id: 9) - assets
  {
    id: 'asset-29',
    clientId: '9',
    type: 'rrif',
    name: 'RRIF',
    accountNumber: 'RIF-1122-8890',
    institution: 'Edward Jones',
    value: 980000,
    status: 'active',
    startDate: '2017-04-22T00:00:00.000Z',
    beneficiary: 'Estate',
    notes: 'Conservative income-focused'
  },
  {
    id: 'asset-30',
    clientId: '9',
    type: 'tfsa',
    name: 'TFSA',
    accountNumber: 'TFSA-1122-8891',
    institution: 'Edward Jones',
    value: 95000,
    status: 'active',
    startDate: '2017-04-22T00:00:00.000Z',
    beneficiary: 'Estate'
  },
  {
    id: 'asset-31',
    clientId: '9',
    type: 'non_registered',
    name: 'Non-Registered',
    accountNumber: 'NR-1122-8892',
    institution: 'Edward Jones',
    value: 375000,
    status: 'active',
    startDate: '2013-05-18T00:00:00.000Z',
    beneficiary: 'Estate',
    notes: 'Dividend income portfolio'
  },
  {
    id: 'asset-32',
    clientId: '9',
    type: 'pension',
    name: 'University Pension',
    institution: 'University of Toronto Pension',
    value: 0,
    status: 'active',
    startDate: '1980-09-01T00:00:00.000Z',
    notes: 'Defined benefit, $5,800/month'
  },
  {
    id: 'asset-33',
    clientId: '9',
    type: 'insurance_life',
    name: 'Life Insurance',
    accountNumber: 'POL-8899-3320',
    institution: 'Sun Life',
    value: 250000,
    status: 'active',
    startDate: '1995-01-15T00:00:00.000Z',
    beneficiary: 'Estate (divided among children)',
    notes: 'Whole life, paid up',
    alerts: [
      { id: 'alert-6', type: 'review_due', message: 'Annual insurance review due', severity: 'info', dueDate: '2026-01-15T00:00:00.000Z' }
    ]
  },

  // Kevin and Jennifer Zhang (id: 10) - assets
  {
    id: 'asset-34',
    clientId: '10',
    type: 'resp',
    name: 'RESP - Lily',
    accountNumber: 'RESP-4455-6670',
    institution: 'Questrade',
    value: 42500,
    status: 'active',
    startDate: '2017-09-12T00:00:00.000Z',
    beneficiary: 'Lily Zhang'
  },
  {
    id: 'asset-35',
    clientId: '10',
    type: 'resp',
    name: 'RESP - Oliver',
    accountNumber: 'RESP-4455-6671',
    institution: 'Questrade',
    value: 36200,
    status: 'active',
    startDate: '2019-06-01T00:00:00.000Z',
    beneficiary: 'Oliver Zhang'
  },
  {
    id: 'asset-36',
    clientId: '10',
    type: 'resp',
    name: 'RESP - Sophie',
    accountNumber: 'RESP-4455-6672',
    institution: 'Questrade',
    value: 28800,
    status: 'active',
    startDate: '2021-03-15T00:00:00.000Z',
    beneficiary: 'Sophie Zhang'
  },
  {
    id: 'asset-37',
    clientId: '10',
    type: 'tfsa',
    name: 'Kevin TFSA',
    accountNumber: 'TFSA-4455-6673',
    institution: 'Questrade',
    value: 95000,
    status: 'active',
    startDate: '2017-09-12T00:00:00.000Z'
  },
  {
    id: 'asset-38',
    clientId: '10',
    type: 'tfsa',
    name: 'Jennifer TFSA',
    accountNumber: 'TFSA-4455-6674',
    institution: 'Questrade',
    value: 95000,
    status: 'active',
    startDate: '2017-09-12T00:00:00.000Z'
  },
  {
    id: 'asset-39',
    clientId: '10',
    type: 'rrsp',
    name: 'Kevin RRSP',
    accountNumber: 'RSP-4455-6675',
    institution: 'Questrade',
    value: 215000,
    status: 'active',
    startDate: '2017-09-12T00:00:00.000Z',
    beneficiary: 'Jennifer Zhang (spouse)'
  },
  {
    id: 'asset-40',
    clientId: '10',
    type: 'rrsp',
    name: 'Jennifer RRSP',
    accountNumber: 'RSP-4455-6676',
    institution: 'Questrade',
    value: 212500,
    status: 'active',
    startDate: '2017-09-12T00:00:00.000Z',
    beneficiary: 'Kevin Zhang (spouse)'
  }
];
