import type { ClientRelationship } from '@/types/client';

export const MOCK_RELATIONSHIPS: ClientRelationship[] = [
  // Michael Johnson (id: 1) - relationships
  {
    id: 'rel-1',
    clientId: '1',
    relatedName: 'Susan Johnson',
    relationshipType: 'spouse',
    isPrimary: false,
    notes: 'Not a client, stay-at-home spouse'
  },
  {
    id: 'rel-2',
    clientId: '1',
    relatedName: 'Mark Johnson',
    relationshipType: 'child',
    notes: 'Adult son, lives in Vancouver'
  },
  {
    id: 'rel-3',
    clientId: '1',
    relatedName: 'Jennifer Lee, CPA',
    relationshipType: 'accountant',
    notes: 'Personal accountant for 10+ years'
  },

  // Sarah Chen (id: 2) - relationships
  {
    id: 'rel-4',
    clientId: '2',
    relatedName: 'David Chen',
    relationshipType: 'parent',
    notes: 'Father, retired professor'
  },
  {
    id: 'rel-5',
    clientId: '2',
    relatedName: 'Lisa Chen',
    relationshipType: 'sibling',
    notes: 'Sister, potential referral'
  },

  // David and Emily Williams (id: 3) - relationships
  {
    id: 'rel-6',
    clientId: '3',
    relatedName: 'Emily Williams',
    relationshipType: 'spouse',
    isPrimary: false,
    notes: 'Joint account holder'
  },
  {
    id: 'rel-7',
    clientId: '3',
    relatedName: 'Matthew Williams',
    relationshipType: 'child',
    notes: 'Adult son, age 32, married'
  },
  {
    id: 'rel-8',
    clientId: '3',
    relatedName: 'Sarah Williams-Park',
    relationshipType: 'child',
    notes: 'Adult daughter, age 29, potential client'
  },
  {
    id: 'rel-9',
    clientId: '3',
    relatedName: 'Robert Graham, LLB',
    relationshipType: 'lawyer',
    notes: 'Estate planning lawyer'
  },

  // Robert Thompson (id: 4) - relationships
  {
    id: 'rel-10',
    clientId: '4',
    relatedName: 'Margaret Thompson',
    relationshipType: 'spouse',
    notes: 'Deceased (2021)'
  },
  {
    id: 'rel-11',
    clientId: '4',
    relatedName: 'Karen Thompson',
    relationshipType: 'child',
    isPrimary: true,
    notes: 'Primary contact, power of attorney'
  },

  // Priya Patel (id: 5) - relationships
  {
    id: 'rel-12',
    clientId: '5',
    relatedName: 'Raj Patel',
    relationshipType: 'spouse',
    notes: 'Also runs the consulting firm'
  },
  {
    id: 'rel-13',
    clientId: '5',
    relatedName: 'Anaya Patel',
    relationshipType: 'child',
    notes: 'Daughter, age 11, RESP beneficiary'
  },
  {
    id: 'rel-14',
    clientId: '5',
    relatedName: 'Dev Patel',
    relationshipType: 'child',
    notes: 'Son, age 8, RESP beneficiary'
  },
  {
    id: 'rel-15',
    clientId: '5',
    relatedName: 'Sandra Mills, CPA',
    relationshipType: 'accountant',
    notes: 'Business and personal accountant'
  },

  // James Morrison (id: 6) - relationships
  {
    id: 'rel-16',
    clientId: '6',
    relatedName: 'Christina Morrison',
    relationshipType: 'spouse',
    notes: 'Not involved in investments'
  },
  {
    id: 'rel-17',
    clientId: '6',
    relatedName: 'Morrison Properties Inc.',
    relationshipType: 'other',
    notes: 'Holding company for real estate'
  },

  // Lisa Rodriguez (id: 7) - relationships
  {
    id: 'rel-18',
    clientId: '7',
    relatedName: 'Maria Rodriguez',
    relationshipType: 'parent',
    notes: 'Mother, source of inheritance'
  },
  {
    id: 'rel-19',
    clientId: '7',
    relatedName: 'Carlos Rodriguez',
    relationshipType: 'sibling',
    notes: 'Brother, executor of mother\'s estate'
  },

  // Ahmed Hassan (id: 8) - relationships
  {
    id: 'rel-20',
    clientId: '8',
    relatedName: 'Fatima Hassan',
    relationshipType: 'spouse',
    notes: 'Recently married, also a physician'
  },

  // Margaret O'Connor (id: 9) - relationships
  {
    id: 'rel-21',
    clientId: '9',
    relatedName: 'Patrick O\'Connor',
    relationshipType: 'spouse',
    notes: 'Deceased (2019)'
  },
  {
    id: 'rel-22',
    clientId: '9',
    relatedName: 'Sean O\'Connor',
    relationshipType: 'child',
    notes: 'Son, lives in Ottawa'
  },
  {
    id: 'rel-23',
    clientId: '9',
    relatedName: 'Bridget O\'Connor-Murphy',
    relationshipType: 'child',
    notes: 'Daughter, lives in Toronto'
  },
  {
    id: 'rel-24',
    clientId: '9',
    relatedName: 'Colleen O\'Connor',
    relationshipType: 'child',
    notes: 'Daughter, lives in Montreal'
  },
  {
    id: 'rel-25',
    clientId: '9',
    relatedName: 'Timothy Murphy (4), Emma Murphy (2)',
    relationshipType: 'other',
    notes: 'Grandchildren from Bridget'
  },

  // Kevin and Jennifer Zhang (id: 10) - relationships
  {
    id: 'rel-26',
    clientId: '10',
    relatedName: 'Jennifer Zhang',
    relationshipType: 'spouse',
    isPrimary: false,
    notes: 'Joint account holder, CPA'
  },
  {
    id: 'rel-27',
    clientId: '10',
    relatedName: 'Lily Zhang',
    relationshipType: 'child',
    notes: 'Daughter, age 9, RESP beneficiary'
  },
  {
    id: 'rel-28',
    clientId: '10',
    relatedName: 'Oliver Zhang',
    relationshipType: 'child',
    notes: 'Son, age 7, RESP beneficiary'
  },
  {
    id: 'rel-29',
    clientId: '10',
    relatedName: 'Sophie Zhang',
    relationshipType: 'child',
    notes: 'Daughter, age 4, RESP beneficiary'
  }
];
