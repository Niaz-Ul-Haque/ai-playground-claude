'use client';

import { useState } from 'react';
import type { DocumentPreviewCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Share2,
  Trash2,
  Upload,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FilePlus,
  X,
} from 'lucide-react';
import { useChatContext } from '@/context/chat-context';

interface DocumentPreviewCardProps {
  data: DocumentPreviewCardData;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-8 h-8 text-red-500" />,
  doc: <FileText className="w-8 h-8 text-blue-500" />,
  docx: <FileText className="w-8 h-8 text-blue-500" />,
  xls: <FileSpreadsheet className="w-8 h-8 text-green-500" />,
  xlsx: <FileSpreadsheet className="w-8 h-8 text-green-500" />,
  csv: <FileSpreadsheet className="w-8 h-8 text-green-600" />,
  jpg: <FileImage className="w-8 h-8 text-purple-500" />,
  jpeg: <FileImage className="w-8 h-8 text-purple-500" />,
  png: <FileImage className="w-8 h-8 text-purple-500" />,
  default: <File className="w-8 h-8 text-gray-500" />,
};

export function DocumentPreviewCard({ data }: DocumentPreviewCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(data.selected_document_id || null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const selectedDoc = data.documents.find(d => d.id === selectedDocId);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string): React.ReactNode => {
    const ext = type.toLowerCase().replace('.', '');
    return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default;
  };

  const handleView = async (docId: string) => {
    setSelectedDocId(docId);
    await handleExecuteAction('view_document', 'document', docId, {});
  };

  const handleDownload = async (docId: string) => {
    setActionLoading(`download-${docId}`);
    try {
      const doc = data.documents.find(d => d.id === docId);
      if (doc?.url) {
        window.open(doc.url, '_blank');
      } else {
        await handleExecuteAction('download_document', 'document', docId, {});
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async (docId: string) => {
    setActionLoading(`share-${docId}`);
    try {
      await handleExecuteAction('share_document', 'document', docId, {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (docId: string) => {
    setActionLoading(`delete-${docId}`);
    try {
      await handleExecuteAction('delete_document', 'document', docId, {});
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpload = async () => {
    await handleExecuteAction('upload_document', 'document', 'new', {
      client_id: data.client_id,
      policy_id: data.policy_id,
    });
  };

  const actions = data.available_actions || ['view', 'download', 'share'];

  return (
    <Card className="my-4 border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-lg">{data.title || 'Documents'}</CardTitle>
          </div>
          <Badge variant="outline">{data.documents.length} file{data.documents.length !== 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Preview (if selected) */}
        {selectedDoc && (
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedDoc.type)}
                <div>
                  <h4 className="font-medium">{selectedDoc.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoc.type.toUpperCase()} • {formatFileSize(selectedDoc.size)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDocId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Thumbnail/Preview */}
            {selectedDoc.thumbnail_url ? (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedDoc.thumbnail_url}
                  alt={selectedDoc.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {getFileIcon(selectedDoc.type)}
                <span className="ml-2 text-muted-foreground">Preview not available</span>
              </div>
            )}

            {/* Document Actions */}
            <div className="flex gap-2 mt-3">
              {actions.includes('download') && (
                <Button
                  size="sm"
                  onClick={() => handleDownload(selectedDoc.id)}
                  disabled={actionLoading === `download-${selectedDoc.id}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              {actions.includes('share') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(selectedDoc.id)}
                  disabled={actionLoading === `share-${selectedDoc.id}`}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Document Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.documents.map(doc => (
            <div
              key={doc.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedDocId === doc.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedDocId(doc.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-muted rounded flex items-center justify-center mb-2">
                {doc.thumbnail_url ? (
                  <img
                    src={doc.thumbnail_url}
                    alt={doc.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  getFileIcon(doc.type)
                )}
              </div>
              
              {/* File Info */}
              <p className="text-sm font-medium truncate" title={doc.name}>
                {doc.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(doc.size)}
              </p>

              {/* Quick Actions */}
              <div className="flex gap-1 mt-2">
                {actions.includes('view') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); handleView(doc.id); }}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
                {actions.includes('download') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); handleDownload(doc.id); }}
                    disabled={actionLoading === `download-${doc.id}`}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
                {actions.includes('delete') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    disabled={actionLoading === `delete-${doc.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {actions.includes('upload') && (
        <CardFooter className="pt-4 border-t">
          <Button variant="outline" onClick={handleUpload}>
            <FilePlus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
