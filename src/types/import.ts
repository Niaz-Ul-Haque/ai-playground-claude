// ============================================
// Import Wizard Types
// ============================================

export type ImportStep = 'upload' | 'mapping' | 'validation' | 'review' | 'results';

export type ImportFileType = 'csv' | 'xlsx' | 'xls' | 'json';

export type ImportEntityType = 'clients' | 'contacts' | 'transactions' | 'policies' | 'notes';

export type ImportStatus = 'idle' | 'uploading' | 'parsing' | 'mapping' | 'validating' | 'importing' | 'completed' | 'error';

// Parsed file information
export interface ParsedFile {
  fileName: string;
  fileType: ImportFileType;
  fileSize: number;
  rowCount: number;
  columns: SourceColumn[];
  previewData: Record<string, string | number | null>[];
  uploadedAt: string;
}

// Source column from uploaded file
export interface SourceColumn {
  name: string;
  index: number;
  sampleValues: (string | number | null)[];
  detectedType: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'unknown';
  nonEmptyCount: number;
}

// Target field in the system
export interface TargetField {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  required: boolean;
  description?: string;
  validationRules?: ValidationRule[];
}

// Field mapping between source and target
export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  transform?: DataTransform;
  isAutoMapped: boolean;
  confidence?: number;
}

// Data transformation options
export interface DataTransform {
  type: 'none' | 'uppercase' | 'lowercase' | 'trim' | 'date_format' | 'number_format' | 'custom';
  config?: Record<string, unknown>;
}

// Validation rule
export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'unique' | 'reference' | 'custom';
  config?: Record<string, unknown>;
  message: string;
}

// Validation error
export interface ValidationError {
  row: number;
  column: string;
  value: string | number | null;
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

// Row validation result
export interface RowValidation {
  rowIndex: number;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data: Record<string, unknown>;
}

// Validation results summary
export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  errorsByField: Record<string, number>;
  errorsByType: Record<string, number>;
  duplicateCount: number;
}

// Import options
export interface ImportOptions {
  entityType: ImportEntityType;
  skipDuplicates: boolean;
  updateExisting: boolean;
  dryRun: boolean;
  batchSize: number;
}

// Import result per row
export interface ImportRowResult {
  rowIndex: number;
  status: 'created' | 'updated' | 'skipped' | 'failed';
  entityId?: string;
  error?: string;
}

// Import results summary
export interface ImportResults {
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportRowResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

// Complete import session state
export interface ImportSession {
  id: string;
  currentStep: ImportStep;
  status: ImportStatus;
  file?: ParsedFile;
  entityType?: ImportEntityType;
  mappings: FieldMapping[];
  validationResults?: RowValidation[];
  validationSummary?: ValidationSummary;
  options: ImportOptions;
  results?: ImportResults;
  createdAt: string;
  updatedAt: string;
}

// Available target fields by entity type
export const TARGET_FIELDS: Record<ImportEntityType, TargetField[]> = {
  clients: [
    { name: 'name', displayName: 'Full Name', type: 'string', required: true },
    { name: 'email', displayName: 'Email Address', type: 'email', required: true },
    { name: 'phone', displayName: 'Phone Number', type: 'phone', required: false },
    { name: 'dateOfBirth', displayName: 'Date of Birth', type: 'date', required: false },
    { name: 'address', displayName: 'Street Address', type: 'string', required: false },
    { name: 'city', displayName: 'City', type: 'string', required: false },
    { name: 'province', displayName: 'Province', type: 'string', required: false },
    { name: 'postalCode', displayName: 'Postal Code', type: 'string', required: false },
    { name: 'riskProfile', displayName: 'Risk Profile', type: 'string', required: false, description: 'conservative, moderate, or aggressive' },
    { name: 'portfolioValue', displayName: 'Portfolio Value', type: 'number', required: false },
    { name: 'notes', displayName: 'Notes', type: 'string', required: false },
  ],
  contacts: [
    { name: 'firstName', displayName: 'First Name', type: 'string', required: true },
    { name: 'lastName', displayName: 'Last Name', type: 'string', required: true },
    { name: 'email', displayName: 'Email Address', type: 'email', required: false },
    { name: 'phone', displayName: 'Phone Number', type: 'phone', required: false },
    { name: 'company', displayName: 'Company', type: 'string', required: false },
    { name: 'title', displayName: 'Job Title', type: 'string', required: false },
    { name: 'relationship', displayName: 'Relationship Type', type: 'string', required: false },
  ],
  transactions: [
    { name: 'date', displayName: 'Transaction Date', type: 'date', required: true },
    { name: 'type', displayName: 'Transaction Type', type: 'string', required: true },
    { name: 'amount', displayName: 'Amount', type: 'number', required: true },
    { name: 'description', displayName: 'Description', type: 'string', required: false },
    { name: 'account', displayName: 'Account', type: 'string', required: false },
    { name: 'clientEmail', displayName: 'Client Email', type: 'email', required: true, description: 'Used to link transaction to client' },
  ],
  policies: [
    { name: 'policyNumber', displayName: 'Policy Number', type: 'string', required: true },
    { name: 'type', displayName: 'Policy Type', type: 'string', required: true },
    { name: 'provider', displayName: 'Provider/Institution', type: 'string', required: false },
    { name: 'value', displayName: 'Current Value', type: 'number', required: false },
    { name: 'premium', displayName: 'Premium', type: 'number', required: false },
    { name: 'startDate', displayName: 'Start Date', type: 'date', required: false },
    { name: 'renewalDate', displayName: 'Renewal Date', type: 'date', required: false },
    { name: 'clientEmail', displayName: 'Client Email', type: 'email', required: true, description: 'Used to link policy to client' },
  ],
  notes: [
    { name: 'date', displayName: 'Note Date', type: 'date', required: true },
    { name: 'content', displayName: 'Note Content', type: 'string', required: true },
    { name: 'category', displayName: 'Category', type: 'string', required: false },
    { name: 'clientEmail', displayName: 'Client Email', type: 'email', required: true, description: 'Used to link note to client' },
  ],
};

// Label constants
export const IMPORT_STEP_LABELS: Record<ImportStep, string> = {
  upload: 'Upload File',
  mapping: 'Map Columns',
  validation: 'Validate Data',
  review: 'Review & Import',
  results: 'Results',
};

export const IMPORT_ENTITY_LABELS: Record<ImportEntityType, string> = {
  clients: 'Clients',
  contacts: 'Contacts',
  transactions: 'Transactions',
  policies: 'Policies/Accounts',
  notes: 'Notes',
};

export const IMPORT_FILE_TYPE_LABELS: Record<ImportFileType, string> = {
  csv: 'CSV File',
  xlsx: 'Excel Workbook',
  xls: 'Excel 97-2003',
  json: 'JSON File',
};
