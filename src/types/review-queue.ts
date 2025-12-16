// ============================================
// Data Review Queue Types
// ============================================

export type ReviewSourceType = 'file' | 'email' | 'calendar' | 'manual' | 'integration';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ReviewItemStatus = 'pending' | 'approved' | 'rejected' | 'edited' | 'merged';

export type ReviewItemType = 'client_data' | 'contact_info' | 'transaction' | 'document' | 'relationship';

// Extracted field from AI processing
export interface ExtractedField {
  fieldName: string;
  value: string | number | boolean | null;
  confidence: number; // 0-100
  source: string; // Where in the document this was found
}

// Main review queue item
export interface ReviewQueueItem {
  id: string;
  type: ReviewItemType;
  sourceType: ReviewSourceType;
  sourceName: string; // e.g., "contract.pdf", "Email from John"
  sourceId?: string; // Reference to source document/email
  extractedAt: string;
  extractedData: ExtractedField[];
  rawData?: Record<string, unknown>; // Original extracted data
  confidenceScore: number; // 0-100 overall
  confidenceLevel: ConfidenceLevel;
  suggestedClientId?: string;
  suggestedClientName?: string;
  matchReason?: string;
  alternativeMatches?: AlternativeMatch[];
  status: ReviewItemStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  feedback?: ReviewFeedback;
}

// Alternative client matches
export interface AlternativeMatch {
  clientId: string;
  clientName: string;
  matchScore: number;
  matchReason: string;
}

// Feedback for improving AI extraction
export interface ReviewFeedback {
  type: 'incorrect_match' | 'incorrect_extraction' | 'missing_data' | 'other';
  description: string;
  correctClientId?: string;
  corrections?: Record<string, unknown>;
}

// Statistics for the review queue
export interface ReviewQueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  edited: number;
  merged: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  bySource: {
    file: number;
    email: number;
    calendar: number;
    manual: number;
    integration: number;
  };
  byType: {
    client_data: number;
    contact_info: number;
    transaction: number;
    document: number;
    relationship: number;
  };
}

// Filter options for the review queue
export interface ReviewQueueFilters {
  status?: ReviewItemStatus;
  sourceType?: ReviewSourceType;
  type?: ReviewItemType;
  confidenceLevel?: ConfidenceLevel;
  clientId?: string;
  searchTerm?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'date' | 'confidence' | 'source' | 'type';
  sortOrder?: 'asc' | 'desc';
}

// Batch operation types
export type BatchOperation = 'approve' | 'reject' | 'merge';

export interface BatchOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

// Comparison view data
export interface ComparisonData {
  fieldName: string;
  displayName: string;
  extractedValue: string | number | boolean | null;
  existingValue: string | number | boolean | null;
  confidence: number;
  isDifferent: boolean;
  source?: string;
}

// Label constants
export const REVIEW_SOURCE_LABELS: Record<ReviewSourceType, string> = {
  file: 'File Upload',
  email: 'Email',
  calendar: 'Calendar',
  manual: 'Manual Entry',
  integration: 'Integration',
};

export const REVIEW_ITEM_TYPE_LABELS: Record<ReviewItemType, string> = {
  client_data: 'Client Data',
  contact_info: 'Contact Information',
  transaction: 'Transaction',
  document: 'Document',
  relationship: 'Relationship',
};

export const CONFIDENCE_LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
};

export const REVIEW_STATUS_LABELS: Record<ReviewItemStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  edited: 'Edited & Approved',
  merged: 'Merged',
};
