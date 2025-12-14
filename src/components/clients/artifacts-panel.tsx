'use client';

import React from 'react';
import type { Artifact } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  Eye,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { format } from 'date-fns';

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  onView?: (artifact: Artifact) => void;
  onDownload?: (artifact: Artifact) => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf') || mimeType.includes('document')) {
    return FileText;
  }
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return FileSpreadsheet;
  }
  if (mimeType.includes('image')) {
    return FileImage;
  }
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getTypeColor = (type: Artifact['type']) => {
  switch (type) {
    case 'document':
      return 'bg-blue-500/10 text-blue-500';
    case 'form':
      return 'bg-green-500/10 text-green-500';
    case 'statement':
      return 'bg-purple-500/10 text-purple-500';
    case 'contract':
      return 'bg-indigo-500/10 text-indigo-500';
    case 'id':
      return 'bg-cyan-500/10 text-cyan-500';
    case 'tax_return':
      return 'bg-orange-500/10 text-orange-500';
    case 'correspondence':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function ArtifactsPanel({ artifacts, onView, onDownload }: ArtifactsPanelProps) {
  // Group artifacts by type
  const groupedArtifacts = artifacts.reduce(
    (acc, artifact) => {
      const type = artifact.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(artifact);
      return acc;
    },
    {} as Record<string, Artifact[]>
  );

  if (artifacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No documents uploaded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documents
          </CardTitle>
          <Badge variant="secondary">{artifacts.length} files</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedArtifacts).map(([type, typeArtifacts]) => (
          <div key={type}>
            <h4 className="text-sm font-medium text-muted-foreground uppercase mb-3">
              {type} ({typeArtifacts.length})
            </h4>
            <div className="space-y-2">
              {typeArtifacts.map((artifact) => {
                const FileIcon = getFileIcon(artifact.mimeType);
                return (
                  <div
                    key={artifact.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getTypeColor(artifact.type)}`}>
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{artifact.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(artifact.size)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(artifact.uploadedAt), 'MMM d, yyyy')}
                        </span>
                        {artifact.versions.length > 1 && (
                          <>
                            <span>·</span>
                            <span>v{artifact.versions.length}</span>
                          </>
                        )}
                      </div>
                      {artifact.tags && artifact.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {artifact.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onView(artifact)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onDownload && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDownload(artifact)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
