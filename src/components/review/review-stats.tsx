'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReviewQueueStats } from '@/types/review-queue';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  Upload,
  Link2
} from 'lucide-react';

interface ReviewStatsDisplayProps {
  stats: ReviewQueueStats;
}

export function ReviewStatsDisplay({ stats }: ReviewStatsDisplayProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">items waiting</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">items processed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-amber-600">{stats.lowConfidence}</p>
          <p className="text-xs text-muted-foreground">need attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Total Processed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">all time</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReviewBreakdownProps {
  stats: ReviewQueueStats;
}

export function ReviewBreakdown({ stats }: ReviewBreakdownProps) {
  const sourceIcons = {
    file: Upload,
    email: Mail,
    calendar: Calendar,
    manual: FileText,
    integration: Link2,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* By Confidence */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Confidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">High</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {stats.highConfidence}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Medium</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {stats.mediumConfidence}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Low</span>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {stats.lowConfidence}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* By Source */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(stats.bySource).map(([source, count]) => {
            const Icon = sourceIcons[source as keyof typeof sourceIcons] || FileText;
            return (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </span>
                <Badge variant="outline">{count}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* By Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Client Data</span>
            <Badge variant="outline">{stats.byType.client_data}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Contact Info</span>
            <Badge variant="outline">{stats.byType.contact_info}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Transaction</span>
            <Badge variant="outline">{stats.byType.transaction}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Document</span>
            <Badge variant="outline">{stats.byType.document}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Relationship</span>
            <Badge variant="outline">{stats.byType.relationship}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
