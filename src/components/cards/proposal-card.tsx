'use client';

import { useState } from 'react';
import type { ProposalCardData } from '@/types/chat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Send,
  Download,
  Edit,
  Check,
  Star,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface ProposalCardProps {
  data: ProposalCardData;
}

export function ProposalCard({ data }: ProposalCardProps) {
  const { handleExecuteAction } = useChatContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getStatusBadge = (status: ProposalCardData['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'sent':
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><Send className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-400"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSelectOption = async (productId: string) => {
    setSelectedOption(productId);
    setActionLoading('select');
    try {
      await handleExecuteAction('select_option', 'proposal', data.proposal_id, { product_id: productId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendToClient = async () => {
    setActionLoading('send');
    try {
      await handleExecuteAction('send_to_client', 'proposal', data.proposal_id, { 
        client_id: data.client_id,
        selected_product: selectedOption 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    setActionLoading('download');
    try {
      await handleExecuteAction('download_pdf', 'proposal', data.proposal_id, {});
    } finally {
      setActionLoading(null);
    }
  };

  const actions = data.available_actions || ['select_option', 'send_to_client', 'download_pdf'];

  return (
    <Card className="my-4 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </div>
          {getStatusBadge(data.status)}
        </div>
        {data.client_name && (
          <CardDescription>Prepared for {data.client_name}</CardDescription>
        )}
        {data.expiry_date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Valid until {new Date(data.expiry_date).toLocaleDateString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Products Section */}
        {data.products.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Products</h4>
            <div className="grid gap-2">
              {data.products.map((product) => (
                <div
                  key={product.product_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOption === product.product_id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  } ${product.recommended ? 'ring-1 ring-amber-400' : ''}`}
                  onClick={() => actions.includes('select_option') && handleSelectOption(product.product_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedOption === product.product_id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-medium">{product.name}</span>
                      {product.recommended && (
                        <Badge variant="outline" className="border-amber-400 text-amber-600 text-xs">
                          <Star className="w-3 h-3 mr-1" />Recommended
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{product.type}</span>
                  </div>
                  {product.carrier && (
                    <p className="text-xs text-muted-foreground mt-1">Carrier: {product.carrier}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Table */}
        {data.pricing_table.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Pricing Options</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium">Coverage</th>
                    <th className="text-right p-2 font-medium">Monthly</th>
                    <th className="text-right p-2 font-medium">Annual</th>
                    {data.pricing_table.some(p => p.term) && (
                      <th className="text-center p-2 font-medium">Term</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.pricing_table.map((pricing, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{pricing.coverage}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(pricing.monthly_premium)}</td>
                      <td className="p-2 text-right">{formatCurrency(pricing.annual_premium)}</td>
                      {data.pricing_table.some(p => p.term) && (
                        <td className="p-2 text-center text-muted-foreground">{pricing.term || '-'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Benefits */}
        {data.benefits && data.benefits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Key Benefits</h4>
            <ul className="space-y-1">
              {data.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terms */}
        {data.terms && data.terms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Terms & Conditions</h4>
            <ul className="space-y-1">
              {data.terms.map((term, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap pt-4 border-t">
        {actions.includes('send_to_client') && data.status === 'draft' && (
          <Button 
            onClick={handleSendToClient}
            disabled={actionLoading === 'send'}
          >
            <Send className="w-4 h-4 mr-2" />
            {actionLoading === 'send' ? 'Sending...' : 'Send to Client'}
          </Button>
        )}
        {actions.includes('download_pdf') && (
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf}
            disabled={actionLoading === 'download'}
          >
            <Download className="w-4 h-4 mr-2" />
            {actionLoading === 'download' ? 'Generating...' : 'Download PDF'}
          </Button>
        )}
        {actions.includes('edit') && data.status === 'draft' && (
          <Button variant="ghost">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
