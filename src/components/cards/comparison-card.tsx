'use client';

import { useState } from 'react';
import type { ComparisonCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  Check,
  X,
  Star,
  Trophy,
  Info,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface ComparisonCardProps {
  data: ComparisonCardData;
}

export function ComparisonCard({ data }: ComparisonCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const items = data.items || [];
  const attributes = data.attributes || [];

  const handleSelect = async (itemId: string) => {
    setSelectedItem(itemId);
    setActionLoading(true);
    try {
      await handleExecuteAction('select_comparison_option', 'comparison', itemId, {});
    } finally {
      setActionLoading(false);
    }
  };

  const formatValue = (value: unknown, format?: string): React.ReactNode => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-400 mx-auto" />
      );
    }

    if (format === 'currency' && typeof value === 'number') {
      return formatCurrency(value);
    }

    if (format === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  };

  const actions = data.available_actions || ['select'];

  return (
    <Card className="my-4 border-l-4 border-l-indigo-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-lg">{data.title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* Comparison Table */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium border-r min-w-[140px]">Feature</th>
                {items.map((item) => (
                  <th key={item.id} className="p-3 font-medium text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <span>{item.name}</span>
                      {item.recommended && (
                        <Badge variant="outline" className="border-amber-400 text-amber-600 text-xs">
                          <Star className="w-3 h-3 mr-1" />Recommended
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, idx) => (
                <tr key={attr.key} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                  <td className="p-3 font-medium border-r">{attr.label}</td>
                  {items.map((item) => {
                    const value = attr.values[item.id];
                    const isWinner = attr.winner === item.id;
                    
                    return (
                      <td 
                        key={item.id} 
                        className={`p-3 text-center ${isWinner ? 'bg-green-50 dark:bg-green-950/30' : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {formatValue(value, attr.format)}
                          {isWinner && (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Recommendation */}
        {data.recommendation && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">AI Recommendation</h4>
                <p className="text-sm text-muted-foreground">{data.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {actions.includes('select') && items.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap pt-4 border-t">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={selectedItem === item.id ? 'default' : 'outline'}
              onClick={() => handleSelect(item.id)}
              disabled={actionLoading}
            >
              {selectedItem === item.id && <Check className="w-4 h-4 mr-2" />}
              Select {item.name}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
