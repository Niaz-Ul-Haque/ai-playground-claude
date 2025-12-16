'use client';

import { useState, useEffect, useMemo } from 'react';
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
import type {
  ParsedFile,
  ImportEntityType,
  FieldMapping,
  TargetField,
} from '@/types/import';
import { TARGET_FIELDS } from '@/types/import';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Link2,
  Unlink,
} from 'lucide-react';

interface MappingStepProps {
  file: ParsedFile;
  entityType: ImportEntityType;
  mappings: FieldMapping[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
  onBack: () => void;
  onNext: () => void;
}

// Find best match for a source column
function findBestMatch(
  sourceName: string,
  sourceType: string,
  targetFields: TargetField[]
): { field: TargetField; confidence: number } | null {
  let bestMatch: { field: TargetField; confidence: number } | null = null;

  for (const targetField of targetFields) {
    const targetName = targetField.name.toLowerCase();
    const targetDisplay = targetField.displayName.toLowerCase().replace(/[_\s-]/g, '');

    // Check for exact match
    if (sourceName === targetName || sourceName === targetDisplay) {
      return { field: targetField, confidence: 100 };
    }

    // Check for partial match
    if (
      sourceName.includes(targetName) ||
      targetName.includes(sourceName) ||
      sourceName.includes(targetDisplay) ||
      targetDisplay.includes(sourceName)
    ) {
      const confidence = 80;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { field: targetField, confidence };
      }
    }

    // Check for type match
    if (sourceType === targetField.type) {
      const confidence = 50;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { field: targetField, confidence };
      }
    }
  }

  return bestMatch;
}

// Auto-map source columns to target fields
function autoMapColumns(
  sourceColumns: ParsedFile['columns'],
  targetFields: TargetField[]
): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  for (const sourceCol of sourceColumns) {
    const sourceName = sourceCol.name.toLowerCase().replace(/[_\s-]/g, '');
    const match = findBestMatch(sourceName, sourceCol.detectedType, targetFields);

    if (match && match.confidence >= 50) {
      // Check if this target is already mapped
      const existingMapping = mappings.find(
        (m) => m.targetField === match.field.name
      );

      if (!existingMapping || match.confidence > (existingMapping.confidence || 0)) {
        // Remove existing mapping if this is better
        const filteredMappings = mappings.filter(
          (m) => m.targetField !== match.field.name
        );
        filteredMappings.push({
          sourceColumn: sourceCol.name,
          targetField: match.field.name,
          isAutoMapped: true,
          confidence: match.confidence,
        });
        mappings.length = 0;
        mappings.push(...filteredMappings);
      }
    }
  }

  return mappings;
}

export function MappingStep({
  file,
  entityType,
  mappings,
  onMappingsChange,
  onBack,
  onNext,
}: MappingStepProps) {
  const [hasAutoMapped, setHasAutoMapped] = useState(false);

  const targetFields = useMemo(() => TARGET_FIELDS[entityType], [entityType]);

  // Auto-map on first load
  useEffect(() => {
    if (!hasAutoMapped && mappings.length === 0) {
      const autoMappings = autoMapColumns(file.columns, targetFields);
      onMappingsChange(autoMappings);
      setHasAutoMapped(true);
    }
  }, [file.columns, targetFields, mappings.length, hasAutoMapped, onMappingsChange]);

  // Get mapping for a target field
  const getMappingForTarget = (targetName: string) => {
    return mappings.find((m) => m.targetField === targetName);
  };

  // Get mapping for a source column
  const getMappingForSource = (sourceName: string) => {
    return mappings.find((m) => m.sourceColumn === sourceName);
  };

  // Update mapping for a target field
  const updateMapping = (targetName: string, sourceColumn: string | null) => {
    const newMappings = mappings.filter((m) => m.targetField !== targetName);

    if (sourceColumn) {
      // Remove any existing mapping for this source column
      const filtered = newMappings.filter((m) => m.sourceColumn !== sourceColumn);
      filtered.push({
        sourceColumn,
        targetField: targetName,
        isAutoMapped: false,
      });
      onMappingsChange(filtered);
    } else {
      onMappingsChange(newMappings);
    }
  };

  // Clear all mappings
  const clearMappings = () => {
    onMappingsChange([]);
  };

  // Re-run auto-mapping
  const runAutoMap = () => {
    const autoMappings = autoMapColumns(file.columns, targetFields);
    onMappingsChange(autoMappings);
  };

  // Check if required fields are mapped
  const requiredFields = targetFields.filter((f) => f.required);
  const mappedRequiredFields = requiredFields.filter((f) =>
    getMappingForTarget(f.name)
  );
  const allRequiredMapped = mappedRequiredFields.length === requiredFields.length;

  // Get unmapped source columns
  const unmappedSourceColumns = file.columns.filter(
    (col) => !getMappingForSource(col.name)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Map Columns</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearMappings}>
                <Unlink className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={runAutoMap}>
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-map
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Match your file columns to the system fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={
                allRequiredMapped
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }
            >
              {allRequiredMapped ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {mappedRequiredFields.length}/{requiredFields.length} required fields
            </Badge>
            <Badge variant="outline">
              <Link2 className="h-3 w-3 mr-1" />
              {mappings.length} mappings
            </Badge>
            {unmappedSourceColumns.length > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {unmappedSourceColumns.length} unmapped columns
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mapping grid */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Required fields first */}
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Required Fields
            </div>
            {targetFields
              .filter((f) => f.required)
              .map((targetField) => (
                <MappingRow
                  key={targetField.name}
                  targetField={targetField}
                  sourceColumns={file.columns}
                  mapping={getMappingForTarget(targetField.name)}
                  onMappingChange={(source) =>
                    updateMapping(targetField.name, source)
                  }
                />
              ))}

            {/* Optional fields */}
            <div className="text-sm font-medium text-muted-foreground mt-6 mb-2">
              Optional Fields
            </div>
            {targetFields
              .filter((f) => !f.required)
              .map((targetField) => (
                <MappingRow
                  key={targetField.name}
                  targetField={targetField}
                  sourceColumns={file.columns}
                  mapping={getMappingForTarget(targetField.name)}
                  onMappingChange={(source) =>
                    updateMapping(targetField.name, source)
                  }
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Unmapped columns */}
      {unmappedSourceColumns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unmapped Columns ({unmappedSourceColumns.length})
            </CardTitle>
            <CardDescription>
              These columns from your file will not be imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unmappedSourceColumns.map((col) => (
                <Badge key={col.index} variant="outline" className="text-muted-foreground">
                  {col.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!allRequiredMapped}>
          Continue to Validation
        </Button>
      </div>
    </div>
  );
}

interface MappingRowProps {
  targetField: TargetField;
  sourceColumns: ParsedFile['columns'];
  mapping: FieldMapping | undefined;
  onMappingChange: (sourceColumn: string | null) => void;
}

function MappingRow({
  targetField,
  sourceColumns,
  mapping,
  onMappingChange,
}: MappingRowProps) {
  const sourceColumn = mapping
    ? sourceColumns.find((c) => c.name === mapping.sourceColumn)
    : null;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
      {/* Target field */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{targetField.displayName}</span>
          {targetField.required && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              Required
            </Badge>
          )}
        </div>
        {targetField.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {targetField.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* Source column selector */}
      <div className="flex-1 min-w-0">
        <Select
          value={mapping?.sourceColumn || 'none'}
          onValueChange={(value) =>
            onMappingChange(value === 'none' ? null : value)
          }
        >
          <SelectTrigger
            className={`w-full ${
              mapping?.isAutoMapped ? 'border-green-300 bg-green-50' : ''
            }`}
          >
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">-- Not mapped --</span>
            </SelectItem>
            {sourceColumns.map((col) => (
              <SelectItem key={col.index} value={col.name}>
                <div className="flex items-center gap-2">
                  <span>{col.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({col.detectedType})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sample values */}
        {sourceColumn && (
          <div className="mt-1 text-xs text-muted-foreground">
            Sample: {sourceColumn.sampleValues.filter(Boolean).slice(0, 2).join(', ')}
          </div>
        )}
      </div>

      {/* Auto-map indicator */}
      {mapping?.isAutoMapped && (
        <Badge variant="outline" className="shrink-0 text-xs bg-green-50 text-green-700">
          <Sparkles className="h-3 w-3 mr-1" />
          Auto
        </Badge>
      )}
    </div>
  );
}
