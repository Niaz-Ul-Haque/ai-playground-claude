import type { Artifact } from '@/types/client';

export const MOCK_ARTIFACTS: Artifact[] = [
  // Michael Johnson (id: 1) - documents
  {
    id: 'art-1',
    clientId: '1',
    name: 'Investment Policy Statement',
    type: 'document',
    mimeType: 'application/pdf',
    size: 245000,
    uploadedAt: '2024-03-15T10:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2023-03-15T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 220000, notes: 'Initial IPS' },
      { id: 'v2', version: 2, uploadedAt: '2024-03-15T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 245000, notes: 'Updated risk tolerance' }
    ],
    tags: ['compliance', 'risk-profile'],
    description: 'Client investment policy statement documenting risk tolerance and investment objectives.'
  },
  {
    id: 'art-2',
    clientId: '1',
    name: 'Know Your Client Form',
    type: 'form',
    mimeType: 'application/pdf',
    size: 180000,
    uploadedAt: '2024-03-15T10:30:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2024-03-15T10:30:00.000Z', uploadedBy: 'advisor', fileSize: 180000, notes: 'Annual KYC update' }
    ],
    tags: ['compliance', 'kyc'],
    description: 'Annual Know Your Client form update.'
  },
  {
    id: 'art-3',
    clientId: '1',
    name: 'Q4 2025 Portfolio Statement',
    type: 'statement',
    mimeType: 'application/pdf',
    size: 520000,
    uploadedAt: '2025-12-04T08:30:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2025-12-04T08:30:00.000Z', uploadedBy: 'system', fileSize: 520000, notes: 'Auto-generated' }
    ],
    tags: ['statement', 'quarterly'],
    description: 'Quarterly portfolio performance statement.'
  },

  // Sarah Chen (id: 2) - documents
  {
    id: 'art-4',
    clientId: '2',
    name: 'RRSP Beneficiary Designation',
    type: 'form',
    mimeType: 'application/pdf',
    size: 95000,
    uploadedAt: '2023-06-20T14:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2023-06-20T14:00:00.000Z', uploadedBy: 'advisor', fileSize: 95000, notes: 'Parents as beneficiaries' }
    ],
    tags: ['beneficiary', 'rrsp'],
    description: 'RRSP beneficiary designation form.'
  },
  {
    id: 'art-5',
    clientId: '2',
    name: '2024 Tax Return Summary',
    type: 'tax_return',
    mimeType: 'application/pdf',
    size: 380000,
    uploadedAt: '2025-04-30T16:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2025-04-30T16:00:00.000Z', uploadedBy: 'client', fileSize: 380000, notes: 'Uploaded by client' }
    ],
    tags: ['tax', '2024'],
    description: '2024 tax return summary for contribution room calculation.'
  },

  // David and Emily Williams (id: 3) - documents
  {
    id: 'art-6',
    clientId: '3',
    name: 'Joint Account Agreement',
    type: 'contract',
    mimeType: 'application/pdf',
    size: 340000,
    uploadedAt: '2020-09-15T11:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2020-09-15T11:00:00.000Z', uploadedBy: 'advisor', fileSize: 340000, notes: 'Original agreement' }
    ],
    tags: ['contract', 'joint-account'],
    description: 'Joint investment account agreement.'
  },
  {
    id: 'art-7',
    clientId: '3',
    name: 'Power of Attorney',
    type: 'document',
    mimeType: 'application/pdf',
    size: 280000,
    uploadedAt: '2022-11-01T09:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2022-11-01T09:00:00.000Z', uploadedBy: 'advisor', fileSize: 280000, notes: 'Mutual POA' }
    ],
    tags: ['legal', 'estate-planning'],
    description: 'Mutual power of attorney documents.'
  },
  {
    id: 'art-8',
    clientId: '3',
    name: 'Retirement Income Projection',
    type: 'document',
    mimeType: 'application/pdf',
    size: 450000,
    uploadedAt: '2025-12-03T17:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2025-12-03T17:00:00.000Z', uploadedBy: 'system', fileSize: 450000, notes: 'Generated after meeting' }
    ],
    tags: ['retirement', 'projection'],
    description: 'Retirement income projection analysis.'
  },

  // Robert Thompson (id: 4) - documents
  {
    id: 'art-9',
    clientId: '4',
    name: 'RRIF Application',
    type: 'form',
    mimeType: 'application/pdf',
    size: 120000,
    uploadedAt: '2020-12-01T10:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2020-12-01T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 120000, notes: 'RRSP to RRIF conversion' }
    ],
    tags: ['rrif', 'conversion'],
    description: 'RRIF conversion application from RRSP.'
  },
  {
    id: 'art-10',
    clientId: '4',
    name: 'GIC Certificate',
    type: 'contract',
    mimeType: 'application/pdf',
    size: 85000,
    uploadedAt: '2021-01-10T11:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2021-01-10T11:00:00.000Z', uploadedBy: 'advisor', fileSize: 85000, notes: '5-year GIC purchase' }
    ],
    tags: ['gic', 'fixed-income'],
    description: '5-year GIC certificate, matures January 2026.'
  },

  // Priya Patel (id: 5) - documents
  {
    id: 'art-11',
    clientId: '5',
    name: 'RESP Application - Anaya',
    type: 'form',
    mimeType: 'application/pdf',
    size: 145000,
    uploadedAt: '2019-04-08T14:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2019-04-08T14:00:00.000Z', uploadedBy: 'advisor', fileSize: 145000, notes: 'Family RESP for Anaya' }
    ],
    tags: ['resp', 'education'],
    description: 'RESP application for Anaya Patel.'
  },
  {
    id: 'art-12',
    clientId: '5',
    name: 'RESP Application - Dev',
    type: 'form',
    mimeType: 'application/pdf',
    size: 145000,
    uploadedAt: '2022-06-15T10:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2022-06-15T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 145000, notes: 'Family RESP for Dev' }
    ],
    tags: ['resp', 'education'],
    description: 'RESP application for Dev Patel.'
  },
  {
    id: 'art-13',
    clientId: '5',
    name: 'Business Registration',
    type: 'document',
    mimeType: 'application/pdf',
    size: 210000,
    uploadedAt: '2019-04-08T14:30:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2019-04-08T14:30:00.000Z', uploadedBy: 'client', fileSize: 210000, notes: 'Corporate registration docs' }
    ],
    tags: ['business', 'corporate'],
    description: 'Consulting firm business registration documents.'
  },

  // James Morrison (id: 6) - documents
  {
    id: 'art-14',
    clientId: '6',
    name: 'Risk Tolerance Questionnaire',
    type: 'form',
    mimeType: 'application/pdf',
    size: 175000,
    uploadedAt: '2025-12-05T12:30:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2023-11-20T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 160000, notes: 'Initial assessment' },
      { id: 'v2', version: 2, uploadedAt: '2025-12-05T12:30:00.000Z', uploadedBy: 'advisor', fileSize: 175000, notes: 'Updated - increased risk tolerance' }
    ],
    tags: ['compliance', 'risk-profile'],
    description: 'Risk tolerance assessment questionnaire.'
  },

  // Lisa Rodriguez (id: 7) - documents
  {
    id: 'art-15',
    clientId: '7',
    name: 'ESG Investment Proposal',
    type: 'document',
    mimeType: 'application/pdf',
    size: 620000,
    uploadedAt: '2025-12-13T14:20:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2025-12-13T14:20:00.000Z', uploadedBy: 'system', fileSize: 620000, notes: 'Ciri-generated proposal' }
    ],
    tags: ['esg', 'proposal', 'inheritance'],
    description: 'ESG investment proposal for inheritance allocation.'
  },
  {
    id: 'art-16',
    clientId: '7',
    name: 'Divorce Settlement',
    type: 'document',
    mimeType: 'application/pdf',
    size: 480000,
    uploadedAt: '2020-02-14T16:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2020-02-14T16:00:00.000Z', uploadedBy: 'client', fileSize: 480000, notes: 'Final settlement' }
    ],
    tags: ['legal', 'personal'],
    description: 'Divorce settlement documentation for asset records.'
  },

  // Ahmed Hassan (id: 8) - documents
  {
    id: 'art-17',
    clientId: '8',
    name: 'TFSA Application',
    type: 'form',
    mimeType: 'application/pdf',
    size: 110000,
    uploadedAt: '2021-07-10T11:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2021-07-10T11:00:00.000Z', uploadedBy: 'advisor', fileSize: 110000, notes: 'Initial TFSA account' }
    ],
    tags: ['tfsa', 'account-opening'],
    description: 'TFSA account application.'
  },
  {
    id: 'art-18',
    clientId: '8',
    name: 'Down Payment Analysis',
    type: 'document',
    mimeType: 'application/pdf',
    size: 350000,
    uploadedAt: '2025-12-14T09:30:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2025-12-14T09:30:00.000Z', uploadedBy: 'system', fileSize: 350000, notes: 'Ciri-generated analysis' }
    ],
    tags: ['analysis', 'home-purchase'],
    description: 'TFSA vs down payment allocation analysis.'
  },

  // Margaret O'Connor (id: 9) - documents
  {
    id: 'art-19',
    clientId: '9',
    name: 'Will and Testament',
    type: 'document',
    mimeType: 'application/pdf',
    size: 420000,
    uploadedAt: '2023-05-18T10:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2020-05-18T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 380000, notes: 'Original will' },
      { id: 'v2', version: 2, uploadedAt: '2023-05-18T10:00:00.000Z', uploadedBy: 'advisor', fileSize: 420000, notes: 'Updated after husband\'s passing' }
    ],
    tags: ['estate-planning', 'legal'],
    description: 'Last will and testament.'
  },
  {
    id: 'art-20',
    clientId: '9',
    name: 'Healthcare Directive',
    type: 'document',
    mimeType: 'application/pdf',
    size: 180000,
    uploadedAt: '2023-05-18T10:30:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2023-05-18T10:30:00.000Z', uploadedBy: 'advisor', fileSize: 180000, notes: 'Healthcare wishes documented' }
    ],
    tags: ['estate-planning', 'healthcare'],
    description: 'Advance healthcare directive.'
  },

  // Kevin and Jennifer Zhang (id: 10) - documents
  {
    id: 'art-21',
    clientId: '10',
    name: 'RESP Annual Report 2025',
    type: 'statement',
    mimeType: 'application/pdf',
    size: 380000,
    uploadedAt: '2025-12-13T16:45:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2025-12-13T16:45:00.000Z', uploadedBy: 'system', fileSize: 380000, notes: 'Ciri-generated report' }
    ],
    tags: ['resp', 'annual-report'],
    description: 'RESP annual performance report for all children.'
  },
  {
    id: 'art-22',
    clientId: '10',
    name: 'Mortgage Documentation',
    type: 'document',
    mimeType: 'application/pdf',
    size: 890000,
    uploadedAt: '2024-08-01T14:00:00.000Z',
    versions: [
      { id: 'v1', version: 1, uploadedAt: '2024-08-01T14:00:00.000Z', uploadedBy: 'client', fileSize: 890000, notes: 'Home upgrade mortgage' }
    ],
    tags: ['mortgage', 'property'],
    description: 'Mortgage documentation for home upgrade.'
  }
];
