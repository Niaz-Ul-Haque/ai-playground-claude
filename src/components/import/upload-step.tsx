'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ParsedFile, ImportEntityType, SourceColumn } from '@/types/import';
import { IMPORT_ENTITY_LABELS, IMPORT_FILE_TYPE_LABELS, TARGET_FIELDS } from '@/types/import';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface UploadStepProps {
  file: ParsedFile | null;
  entityType: ImportEntityType | null;
  onFileChange: (file: ParsedFile | null) => void;
  onEntityTypeChange: (type: ImportEntityType) => void;
  onNext: () => void;
}

// Mock function to simulate file parsing
function parseFile(file: File): Promise<ParsedFile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock columns and data based on file name
      const isClientFile = file.name.toLowerCase().includes('client');

      const columns: SourceColumn[] = isClientFile
        ? [
            { name: 'Name', index: 0, sampleValues: ['John Smith', 'Jane Doe', 'Bob Wilson'], detectedType: 'string', nonEmptyCount: 100 },
            { name: 'Email', index: 1, sampleValues: ['john@example.com', 'jane@example.com', 'bob@example.com'], detectedType: 'email', nonEmptyCount: 98 },
            { name: 'Phone', index: 2, sampleValues: ['416-555-1234', '647-555-5678', '905-555-9012'], detectedType: 'phone', nonEmptyCount: 85 },
            { name: 'Date of Birth', index: 3, sampleValues: ['1980-05-15', '1975-10-22', '1990-03-08'], detectedType: 'date', nonEmptyCount: 92 },
            { name: 'Address', index: 4, sampleValues: ['123 Main St', '456 Oak Ave', '789 Pine Rd'], detectedType: 'string', nonEmptyCount: 88 },
            { name: 'City', index: 5, sampleValues: ['Toronto', 'Mississauga', 'Brampton'], detectedType: 'string', nonEmptyCount: 90 },
            { name: 'Risk Profile', index: 6, sampleValues: ['Moderate', 'Conservative', 'Aggressive'], detectedType: 'string', nonEmptyCount: 75 },
            { name: 'Portfolio Value', index: 7, sampleValues: ['250000', '500000', '750000'], detectedType: 'number', nonEmptyCount: 70 },
          ]
        : [
            { name: 'First Name', index: 0, sampleValues: ['John', 'Jane', 'Bob'], detectedType: 'string', nonEmptyCount: 50 },
            { name: 'Last Name', index: 1, sampleValues: ['Smith', 'Doe', 'Wilson'], detectedType: 'string', nonEmptyCount: 50 },
            { name: 'Email Address', index: 2, sampleValues: ['john@example.com', 'jane@example.com', null], detectedType: 'email', nonEmptyCount: 45 },
            { name: 'Company', index: 3, sampleValues: ['Acme Inc', 'Tech Corp', null], detectedType: 'string', nonEmptyCount: 40 },
            { name: 'Title', index: 4, sampleValues: ['Manager', 'Director', 'VP'], detectedType: 'string', nonEmptyCount: 35 },
          ];

      const previewData = columns[0].sampleValues.map((_, rowIdx) => {
        const row: Record<string, string | number | null> = {};
        columns.forEach((col) => {
          row[col.name] = col.sampleValues[rowIdx];
        });
        return row;
      });

      resolve({
        fileName: file.name,
        fileType: file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.xlsx') ? 'xlsx' : 'csv',
        fileSize: file.size,
        rowCount: Math.floor(Math.random() * 200) + 50,
        columns,
        previewData,
        uploadedAt: new Date().toISOString(),
      });
    }, 1500);
  });
}

export function UploadStep({
  file,
  entityType,
  onFileChange,
  onEntityTypeChange,
  onNext,
}: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  }, []);

  const processFile = async (rawFile: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = '.' + rawFile.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      setError('Invalid file type. Please upload a CSV, Excel, or JSON file.');
      return;
    }

    // Validate file size (max 10MB)
    if (rawFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum file size is 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const parsed = await parseFile(rawFile);
      onFileChange(parsed);
    } catch (err) {
      setError('Failed to parse file. Please check the format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canProceed = file !== null && entityType !== null;

  return (
    <div className="space-y-6">
      {/* Entity type selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What are you importing?</CardTitle>
          <CardDescription>
            Select the type of data you want to import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={entityType || ''}
            onValueChange={(value) => onEntityTypeChange(value as ImportEntityType)}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(IMPORT_ENTITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {entityType && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Required fields:</p>
              <div className="flex flex-wrap gap-1">
                {TARGET_FIELDS[entityType]
                  .filter((f) => f.required)
                  .map((field) => (
                    <Badge key={field.name} variant="secondary">
                      {field.displayName}
                    </Badge>
                  ))}
              </div>
              <p className="text-sm font-medium mt-3 mb-2">Optional fields:</p>
              <div className="flex flex-wrap gap-1">
                {TARGET_FIELDS[entityType]
                  .filter((f) => !f.required)
                  .map((field) => (
                    <Badge key={field.name} variant="outline">
                      {field.displayName}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File</CardTitle>
          <CardDescription>
            Drag and drop or click to upload your file
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <p className="text-sm font-medium mb-1">
                    {isUploading ? 'Parsing file...' : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports CSV, Excel (.xlsx, .xls), and JSON files up to 10MB
                  </p>
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Sample template */}
              <div className="mt-4 flex items-center justify-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Download sample template
                </Button>
              </div>
            </>
          ) : (
            /* File preview */
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {IMPORT_FILE_TYPE_LABELS[file.fileType]} • {formatFileSize(file.fileSize)} • {file.rowCount} rows
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Column preview */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Detected {file.columns.length} columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {file.columns.map((col) => (
                    <Badge
                      key={col.index}
                      variant="outline"
                      className="text-xs"
                    >
                      {col.name}
                      <span className="ml-1 text-muted-foreground">
                        ({col.detectedType})
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Data preview */}
              <div>
                <p className="text-sm font-medium mb-2">Preview (first 3 rows):</p>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {file.columns.map((col) => (
                          <th
                            key={col.index}
                            className="px-3 py-2 text-left font-medium whitespace-nowrap"
                          >
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {file.previewData.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {file.columns.map((col) => (
                            <td
                              key={col.index}
                              className="px-3 py-2 whitespace-nowrap"
                            >
                              {row[col.name] !== null ? String(row[col.name]) : (
                                <span className="text-muted-foreground italic">empty</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          Continue to Mapping
        </Button>
      </div>
    </div>
  );
}
