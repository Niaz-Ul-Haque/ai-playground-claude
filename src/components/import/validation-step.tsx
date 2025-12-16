'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type {
  ParsedFile,
  ImportEntityType,
  FieldMapping,
  ValidationSummary,
  RowValidation,
  ValidationError,
} from '@/types/import';
import { TARGET_FIELDS } from '@/types/import';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileWarning,
} from 'lucide-react';

interface ValidationStepProps {
  file: ParsedFile;
  entityType: ImportEntityType;
  mappings: FieldMapping[];
  validationResults: RowValidation[];
  validationSummary: ValidationSummary | null;
  onValidationComplete: (results: RowValidation[], summary: ValidationSummary) => void;
  onBack: () => void;
  onNext: () => void;
}

// Simulate validation
function validateData(
  file: ParsedFile,
  entityType: ImportEntityType,
  mappings: FieldMapping[]
): { results: RowValidation[]; summary: ValidationSummary } {
  const targetFields = TARGET_FIELDS[entityType];
  const results: RowValidation[] = [];
  const errorsByField: Record<string, number> = {};
  const errorsByType: Record<string, number> = {};
  let duplicateCount = 0;

  // Create a map of emails for duplicate detection
  const seenEmails = new Set<string>();

  // Simulate validation for each row in the file
  const rowCount = file.rowCount;
  for (let i = 0; i < Math.min(rowCount, 100); i++) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const data: Record<string, unknown> = {};

    // Check each mapping
    mappings.forEach((mapping) => {
      const targetField = targetFields.find((f) => f.name === mapping.targetField);
      if (!targetField) return;

      // Simulate getting value from row
      const sourceCol = file.columns.find((c) => c.name === mapping.sourceColumn);
      const sampleIdx = i % 3; // Cycle through sample values
      const rawValue = sourceCol?.sampleValues[sampleIdx];
      const value: string | number | null = rawValue !== undefined ? rawValue : null;

      data[mapping.targetField] = value;

      // Check required fields
      if (targetField.required && (value === null || value === undefined || value === '')) {
        // Only mark some rows as having missing required fields
        if (i % 7 === 0) {
          errors.push({
            row: i + 1,
            column: mapping.sourceColumn,
            value,
            field: targetField.displayName,
            rule: 'required',
            message: `${targetField.displayName} is required`,
            severity: 'error',
          });
          errorsByField[mapping.targetField] = (errorsByField[mapping.targetField] || 0) + 1;
          errorsByType['required'] = (errorsByType['required'] || 0) + 1;
        }
      }

      // Check email format
      if (targetField.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          if (i % 11 === 0) {
            errors.push({
              row: i + 1,
              column: mapping.sourceColumn,
              value,
              field: targetField.displayName,
              rule: 'format',
              message: `Invalid email format`,
              severity: 'error',
            });
            errorsByField[mapping.targetField] = (errorsByField[mapping.targetField] || 0) + 1;
            errorsByType['format'] = (errorsByType['format'] || 0) + 1;
          }
        }

        // Check for duplicates
        if (seenEmails.has(String(value).toLowerCase())) {
          if (i % 15 === 0) {
            warnings.push({
              row: i + 1,
              column: mapping.sourceColumn,
              value,
              field: targetField.displayName,
              rule: 'unique',
              message: `Duplicate email address`,
              severity: 'warning',
            });
            duplicateCount++;
          }
        } else {
          seenEmails.add(String(value).toLowerCase());
        }
      }

      // Check phone format
      if (targetField.type === 'phone' && value) {
        const phoneValue = String(value).replace(/\D/g, '');
        if (phoneValue.length < 10) {
          if (i % 13 === 0) {
            warnings.push({
              row: i + 1,
              column: mapping.sourceColumn,
              value,
              field: targetField.displayName,
              rule: 'format',
              message: `Phone number seems incomplete`,
              severity: 'warning',
            });
          }
        }
      }

      // Check number format
      if (targetField.type === 'number' && value !== null && value !== undefined) {
        if (isNaN(Number(value))) {
          if (i % 9 === 0) {
            errors.push({
              row: i + 1,
              column: mapping.sourceColumn,
              value,
              field: targetField.displayName,
              rule: 'format',
              message: `Expected a number`,
              severity: 'error',
            });
            errorsByField[mapping.targetField] = (errorsByField[mapping.targetField] || 0) + 1;
            errorsByType['format'] = (errorsByType['format'] || 0) + 1;
          }
        }
      }
    });

    results.push({
      rowIndex: i + 1,
      isValid: errors.length === 0,
      errors,
      warnings,
      data,
    });
  }

  const validRows = results.filter((r) => r.isValid).length;
  const invalidRows = results.filter((r) => !r.isValid).length;
  const warningRows = results.filter((r) => r.warnings.length > 0).length;

  const summary: ValidationSummary = {
    totalRows: rowCount,
    validRows,
    invalidRows,
    warningRows,
    errorsByField,
    errorsByType,
    duplicateCount,
  };

  return { results, summary };
}

export function ValidationStep({
  file,
  entityType,
  mappings,
  validationResults,
  validationSummary,
  onValidationComplete,
  onBack,
  onNext,
}: ValidationStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);

  // Run validation on mount if not already done
  useEffect(() => {
    if (!validationSummary && !isValidating) {
      setIsValidating(true);
      // Simulate async validation
      setTimeout(() => {
        const { results, summary } = validateData(file, entityType, mappings);
        onValidationComplete(results, summary);
        setIsValidating(false);
      }, 1500);
    }
  }, [file, entityType, mappings, validationSummary, isValidating, onValidationComplete]);

  // Get rows with issues
  const errorRows = useMemo(
    () => validationResults.filter((r) => !r.isValid),
    [validationResults]
  );

  const warningRows = useMemo(
    () => validationResults.filter((r) => r.isValid && r.warnings.length > 0),
    [validationResults]
  );

  if (isValidating || !validationSummary) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
          <div className="text-center">
            <p className="font-medium">Validating data...</p>
            <p className="text-sm text-muted-foreground">
              Checking {file.rowCount} rows for errors
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const validPercentage = Math.round(
    (validationSummary.validRows / validationSummary.totalRows) * 100
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validation Results</CardTitle>
          <CardDescription>
            Review any issues before importing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Valid rows</span>
                <span className="font-medium">
                  {validationSummary.validRows} of {validationSummary.totalRows} ({validPercentage}%)
                </span>
              </div>
              <Progress
                value={validPercentage}
                className={`h-2 ${
                  validPercentage === 100
                    ? '[&>div]:bg-green-500'
                    : validPercentage >= 80
                    ? '[&>div]:bg-amber-500'
                    : '[&>div]:bg-red-500'
                }`}
              />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Valid</span>
                </div>
                <p className="text-xl font-bold text-green-700 mt-1">
                  {validationSummary.validRows}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Errors</span>
                </div>
                <p className="text-xl font-bold text-red-700 mt-1">
                  {validationSummary.invalidRows}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-700">Warnings</span>
                </div>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  {validationSummary.warningRows}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Duplicates</span>
                </div>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  {validationSummary.duplicateCount}
                </p>
              </div>
            </div>

            {/* Error breakdown */}
            {Object.keys(validationSummary.errorsByField).length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Errors by field:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(validationSummary.errorsByField).map(([field, count]) => (
                    <Badge key={field} variant="destructive">
                      {field}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error details */}
      {errorRows.length > 0 && (
        <Collapsible open={showErrors} onOpenChange={setShowErrors}>
          <Card>
            <CardHeader className="pb-0">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <CardTitle className="text-base">
                      Rows with Errors ({errorRows.length})
                    </CardTitle>
                  </div>
                  {showErrors ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorRows.slice(0, 10).flatMap((row) =>
                        row.errors.map((error, idx) => (
                          <TableRow key={`${row.rowIndex}-${idx}`}>
                            <TableCell className="font-mono">{error.row}</TableCell>
                            <TableCell>{error.field}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[150px] truncate">
                              {error.value !== null ? String(error.value) : <em>empty</em>}
                            </TableCell>
                            <TableCell className="text-red-600">{error.message}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {errorRows.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Showing first 10 of {errorRows.length} rows with errors
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Warning details */}
      {warningRows.length > 0 && (
        <Collapsible open={showWarnings} onOpenChange={setShowWarnings}>
          <Card>
            <CardHeader className="pb-0">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-base">
                      Rows with Warnings ({warningRows.length})
                    </CardTitle>
                  </div>
                  {showWarnings ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Warning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warningRows.slice(0, 10).flatMap((row) =>
                        row.warnings.map((warning, idx) => (
                          <TableRow key={`${row.rowIndex}-${idx}`}>
                            <TableCell className="font-mono">{warning.row}</TableCell>
                            <TableCell>{warning.field}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[150px] truncate">
                              {warning.value !== null ? String(warning.value) : <em>empty</em>}
                            </TableCell>
                            <TableCell className="text-amber-600">{warning.message}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {warningRows.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Showing first 10 of {warningRows.length} rows with warnings
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* All valid message */}
      {validationSummary.invalidRows === 0 && validationSummary.warningRows === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-700">All rows are valid!</p>
                <p className="text-sm text-green-600">
                  Your data is ready to import without any issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          {validationSummary.invalidRows > 0
            ? `Import ${validationSummary.validRows} Valid Rows`
            : 'Continue to Import'}
        </Button>
      </div>
    </div>
  );
}
