'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { ExportDownloadBlockData } from '@/types/chat-blocks';
import { formatRelativeDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface ExportDownloadBlockProps {
  data: ExportDownloadBlockData;
}

const FORMAT_ICONS: Record<string, React.ElementType> = {
  csv: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

const FORMAT_COLORS: Record<string, string> = {
  csv: 'bg-green-100 text-green-800 border-green-200',
  json: 'bg-blue-100 text-blue-800 border-blue-200',
  pdf: 'bg-red-100 text-red-800 border-red-200',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  task: 'Tasks',
  client: 'Clients',
  opportunity: 'Opportunities',
  automation: 'Automations',
  workflow: 'Workflows',
  integration: 'Integrations',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function ExportDownloadBlock({ data }: ExportDownloadBlockProps) {
  const {
    fileName,
    format,
    downloadUrl,
    fileSize,
    recordCount,
    generatedAt,
    expiresAt,
    entityType,
  } = data;

  const [hasDownloaded, setHasDownloaded] = useState(false);

  const FormatIcon = FORMAT_ICONS[format] || FileText;
  const isExpired = Boolean(expiresAt && new Date(expiresAt) < new Date());
  const isExpiringSoon = Boolean(
    expiresAt &&
    !isExpired &&
    new Date(expiresAt).getTime() - Date.now() < 60000 * 5 // 5 minutes
  );

  const handleDownload = () => {
    if (isExpired) return;

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setHasDownloaded(true);
  };

  return (
    <Card className={cn(
      'my-4',
      isExpired && 'opacity-60',
      hasDownloaded && 'border-green-200 bg-green-50/50'
    )}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className={cn(
            'h-14 w-14 rounded-lg flex items-center justify-center',
            FORMAT_COLORS[format] || 'bg-gray-100'
          )}>
            <FormatIcon className="h-7 w-7" />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{fileName}</h3>
              <Badge variant="outline" className={FORMAT_COLORS[format]}>
                {format.toUpperCase()}
              </Badge>
              {hasDownloaded && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Downloaded
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{formatFileSize(fileSize)}</span>
              <span>•</span>
              <span>{recordCount.toLocaleString()} {ENTITY_TYPE_LABELS[entityType] || 'records'}</span>
              <span>•</span>
              <span>Generated {formatRelativeDate(generatedAt)}</span>
            </div>

            {/* Expiry Warning */}
            {expiresAt && (
              <div className={cn(
                'flex items-center gap-2 text-sm',
                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-muted-foreground'
              )}>
                {isExpired ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>This download link has expired. Please generate a new export.</span>
                  </>
                ) : isExpiringSoon ? (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Download link expires soon</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Expires {formatRelativeDate(expiresAt)}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={isExpired}
            variant={hasDownloaded ? 'outline' : 'default'}
            className="shrink-0"
          >
            <Download className="h-4 w-4 mr-2" />
            {hasDownloaded ? 'Download Again' : 'Download'}
          </Button>
        </div>

        {/* Preview hint for CSV/JSON */}
        {(format === 'csv' || format === 'json') && !isExpired && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Tip: {format === 'csv'
                ? 'You can open this file in Excel, Google Sheets, or any spreadsheet application.'
                : 'You can view this file in any text editor or import it into other applications.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
