'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import type {
  ImportEntityType,
  ValidationSummary,
  ImportResults,
  ImportOptions,
} from '@/types/import';
import { IMPORT_ENTITY_LABELS } from '@/types/import';
import {
  CheckCircle2,
  XCircle,
  SkipForward,
  RefreshCcw,
  Download,
  ArrowRight,
  Clock,
  Users,
  FileSpreadsheet,
} from 'lucide-react';

interface ResultsStepProps {
  entityType: ImportEntityType;
  validationSummary: ValidationSummary;
  options: ImportOptions;
  results: ImportResults | null;
  onImport: () => void;
  onStartNew: () => void;
}

// Simulate import process
function simulateImport(
  validRows: number,
  options: ImportOptions
): Promise<ImportResults> {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();

    // Simulate processing time
    setTimeout(() => {
      const created = Math.floor(validRows * 0.85);
      const updated = options.updateExisting ? Math.floor(validRows * 0.1) : 0;
      const skipped = options.skipDuplicates ? Math.floor(validRows * 0.03) : 0;
      const failed = validRows - created - updated - skipped;

      const errors = [];
      if (failed > 0) {
        for (let i = 0; i < Math.min(failed, 5); i++) {
          errors.push({
            rowIndex: Math.floor(Math.random() * validRows) + 1,
            status: 'failed' as const,
            error: 'Database constraint violation',
          });
        }
      }

      resolve({
        totalProcessed: validRows,
        created,
        updated,
        skipped,
        failed,
        errors,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: 2500 + Math.random() * 1000,
      });
    }, 2500);
  });
}

export function ResultsStep({
  entityType,
  validationSummary,
  options,
  results,
  onImport,
  onStartNew,
}: ResultsStepProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResults | null>(results);

  // Run import
  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    try {
      const results = await simulateImport(validationSummary.validRows, options);
      setImportResults(results);
      setImportProgress(100);
      onImport();
    } finally {
      clearInterval(progressInterval);
      setIsImporting(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Pre-import view
  if (!importResults && !isImporting) {
    return (
      <div className="space-y-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review & Import</CardTitle>
            <CardDescription>
              Confirm import settings and start the import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Import summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Entity Type</div>
                  <div className="font-medium">{IMPORT_ENTITY_LABELS[entityType]}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Rows to Import</div>
                  <div className="font-medium">{validationSummary.validRows}</div>
                </div>
              </div>

              {/* Options summary */}
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Import Options</div>
                <div className="flex flex-wrap gap-2">
                  {options.skipDuplicates && (
                    <Badge variant="secondary">Skip duplicates</Badge>
                  )}
                  {options.updateExisting && (
                    <Badge variant="secondary">Update existing records</Badge>
                  )}
                  {options.dryRun && (
                    <Badge variant="secondary">Dry run (no changes)</Badge>
                  )}
                </div>
              </div>

              {/* Validation reminder */}
              {validationSummary.invalidRows > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700">
                        {validationSummary.invalidRows} rows will be skipped
                      </p>
                      <p className="text-sm text-amber-600">
                        These rows have validation errors and cannot be imported.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Start import button */}
        <div className="flex justify-center">
          <Button size="lg" onClick={handleImport}>
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Start Import
          </Button>
        </div>
      </div>
    );
  }

  // Importing view
  if (isImporting) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
            <FileSpreadsheet className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-medium text-lg">Importing data...</p>
            <p className="text-sm text-muted-foreground">
              Processing {validationSummary.validRows} rows
            </p>
          </div>
          <div className="w-full max-w-md">
            <Progress value={importProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {Math.round(importProgress)}% complete
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Results view
  if (importResults) {
    const successRate = Math.round(
      ((importResults.created + importResults.updated) / importResults.totalProcessed) * 100
    );

    return (
      <div className="space-y-6">
        {/* Success banner */}
        <Card
          className={`${
            importResults.failed === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {importResults.failed === 0 ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-amber-600" />
              )}
              <div>
                <p
                  className={`text-xl font-bold ${
                    importResults.failed === 0 ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {importResults.failed === 0 ? 'Import Complete!' : 'Import Complete with Issues'}
                </p>
                <p
                  className={`${
                    importResults.failed === 0 ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {successRate}% success rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Created</span>
              </div>
              <p className="text-2xl font-bold">{importResults.created}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <RefreshCcw className="h-4 w-4" />
                <span className="text-sm">Updated</span>
              </div>
              <p className="text-2xl font-bold">{importResults.updated}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <SkipForward className="h-4 w-4" />
                <span className="text-sm">Skipped</span>
              </div>
              <p className="text-2xl font-bold">{importResults.skipped}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Failed</span>
              </div>
              <p className="text-2xl font-bold">{importResults.failed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Duration */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Import duration</span>
              </div>
              <span className="font-medium">{formatDuration(importResults.durationMs)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Errors */}
        {importResults.errors.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-600">
                Failed Rows ({importResults.failed})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResults.errors.map((error, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{error.rowIndex}</TableCell>
                        <TableCell className="text-red-600">{error.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download error report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="outline" onClick={onStartNew}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Start New Import
          </Button>

          <div className="flex gap-2">
            {entityType === 'clients' && (
              <Button asChild variant="outline">
                <Link href="/clients">
                  <Users className="h-4 w-4 mr-2" />
                  View Clients
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/">
                Go to Chat
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
