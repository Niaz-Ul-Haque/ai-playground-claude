'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  UploadStep,
  MappingStep,
  ValidationStep,
  ResultsStep,
} from '@/components/import';
import type {
  ImportStep,
  ImportEntityType,
  ParsedFile,
  FieldMapping,
  RowValidation,
  ValidationSummary,
  ImportResults,
  ImportOptions,
} from '@/types/import';
import { IMPORT_STEP_LABELS } from '@/types/import';
import { Upload, ArrowRight, Check } from 'lucide-react';

const STEPS: ImportStep[] = ['upload', 'mapping', 'validation', 'results'];

export default function ImportPage() {
  // State
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [entityType, setEntityType] = useState<ImportEntityType | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [validationResults, setValidationResults] = useState<RowValidation[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);

  const options: ImportOptions = {
    entityType: entityType || 'clients',
    skipDuplicates: true,
    updateExisting: false,
    dryRun: false,
    batchSize: 100,
  };

  // Get current step index
  const currentStepIndex = STEPS.indexOf(currentStep);

  // Navigation
  const goToStep = (step: ImportStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  // Reset wizard
  const resetWizard = useCallback(() => {
    setCurrentStep('upload');
    setFile(null);
    setEntityType(null);
    setMappings([]);
    setValidationResults([]);
    setValidationSummary(null);
    setImportResults(null);
  }, []);

  // Handlers
  const handleFileChange = (newFile: ParsedFile | null) => {
    setFile(newFile);
    // Reset dependent state when file changes
    setMappings([]);
    setValidationResults([]);
    setValidationSummary(null);
    setImportResults(null);
  };

  const handleEntityTypeChange = (type: ImportEntityType) => {
    setEntityType(type);
    // Reset mappings when entity type changes
    setMappings([]);
    setValidationResults([]);
    setValidationSummary(null);
    setImportResults(null);
  };

  const handleMappingsChange = (newMappings: FieldMapping[]) => {
    setMappings(newMappings);
    // Reset validation when mappings change
    setValidationResults([]);
    setValidationSummary(null);
  };

  const handleValidationComplete = (
    results: RowValidation[],
    summary: ValidationSummary
  ) => {
    setValidationResults(results);
    setValidationSummary(summary);
  };

  const handleImport = () => {
    // Results are set within the ResultsStep component
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Import Wizard</h1>
          <p className="text-muted-foreground">
            Import data from CSV, Excel, or JSON files
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = step === currentStep;
              const isClickable = index <= currentStepIndex;

              return (
                <div key={step} className="flex items-center">
                  {/* Step indicator */}
                  <button
                    onClick={() => isClickable && goToStep(step)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-sm hidden sm:inline ${
                        isCurrent
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {IMPORT_STEP_LABELS[step]}
                    </span>
                  </button>

                  {/* Arrow between steps */}
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-2 sm:mx-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <div className="mt-6">
        {currentStep === 'upload' && (
          <UploadStep
            file={file}
            entityType={entityType}
            onFileChange={handleFileChange}
            onEntityTypeChange={handleEntityTypeChange}
            onNext={goNext}
          />
        )}

        {currentStep === 'mapping' && file && entityType && (
          <MappingStep
            file={file}
            entityType={entityType}
            mappings={mappings}
            onMappingsChange={handleMappingsChange}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {currentStep === 'validation' && file && entityType && (
          <ValidationStep
            file={file}
            entityType={entityType}
            mappings={mappings}
            validationResults={validationResults}
            validationSummary={validationSummary}
            onValidationComplete={handleValidationComplete}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {currentStep === 'results' && entityType && validationSummary && (
          <ResultsStep
            entityType={entityType}
            validationSummary={validationSummary}
            options={options}
            results={importResults}
            onImport={handleImport}
            onStartNew={resetWizard}
          />
        )}
      </div>
    </div>
  );
}
