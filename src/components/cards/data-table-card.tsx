'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, Download, Filter } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/data-table';
import type { DataTableCardData } from '@/types/chat';

interface DataTableCardProps {
  data: DataTableCardData;
}

export function DataTableCard({ data }: DataTableCardProps) {
  const { title, description, columns, rows, sortable, filterable, pageSize, exportable } = data;

  // Convert backend column format to DataTable column format
  const tableColumns: Column<Record<string, unknown>>[] = columns.map(col => ({
    key: col.key,
    header: col.header,
    sortable: col.sortable !== false,
    width: col.width,
    render: col.format ? (value: unknown) => formatValue(value, col.format!) : undefined,
  }));

  const handleExport = () => {
    // Create CSV content
    const headers = columns.map(col => col.header).join(',');
    const csvRows = rows.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Escape commas and quotes
        const strValue = String(value ?? '');
        return strValue.includes(',') || strValue.includes('"') 
          ? `"${strValue.replace(/"/g, '""')}"` 
          : strValue;
      }).join(',')
    );
    const csv = [headers, ...csvRows].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="my-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Table className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{title || 'Data Table'}</CardTitle>
            </div>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {rows.length} rows
            </Badge>
            {exportable !== false && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={tableColumns}
          data={rows}
          sortable={sortable !== false}
          filterable={filterable !== false}
          pageSize={pageSize || 10}
        />
      </CardContent>
    </Card>
  );
}

// Helper function to format values based on column format
function formatValue(value: unknown, format: string): string {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(value));
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value));
    
    case 'percent':
      return `${(Number(value) * 100).toFixed(1)}%`;
    
    case 'date':
      return new Date(String(value)).toLocaleDateString();
    
    case 'status':
      return String(value);
    
    default:
      return String(value);
  }
}
