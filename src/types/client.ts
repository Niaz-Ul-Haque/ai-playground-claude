export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  riskProfile: RiskProfile;
  portfolioValue: number; // In CAD
  accountType: string;
  birthDate: string; // ISO string
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  nextMeeting?: string; // ISO string
  lastContact: string; // ISO string
  tags: string[];
  createdAt: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  email: string;
  riskProfile: RiskProfile;
  portfolioValue: number;
  nextMeeting?: string;
}
