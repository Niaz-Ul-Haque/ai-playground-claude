'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  FolderOpen,
  Mail,
  Calendar,
  CheckCircle2,
  Loader2,
  Star,
  Lock,
} from 'lucide-react';
import type {
  AvailableIntegration,
  IntegrationProvider,
  IntegrationCategory,
} from '@/types/integration';
import {
  INTEGRATION_CATEGORY_LABELS,
  PROVIDER_COLORS,
} from '@/types/integration';

interface ConnectionFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableIntegrations: AvailableIntegration[];
  onConnect: (provider: IntegrationProvider) => Promise<void>;
}

const categoryIcons: Record<IntegrationCategory, React.ReactNode> = {
  file_storage: <FolderOpen className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
};

type FlowStep = 'select' | 'connecting' | 'success';

export function ConnectionFlowDialog({
  open,
  onOpenChange,
  availableIntegrations,
  onConnect,
}: ConnectionFlowDialogProps) {
  const [step, setStep] = useState<FlowStep>('select');
  const [selectedProvider, setSelectedProvider] = useState<AvailableIntegration | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');

  const handleConnect = async (integration: AvailableIntegration) => {
    setSelectedProvider(integration);
    setStep('connecting');

    try {
      // Simulate OAuth delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await onConnect(integration.provider);
      setStep('success');
    } catch (error) {
      console.error('Connection failed:', error);
      setStep('select');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setStep('select');
      setSelectedProvider(null);
      setSelectedCategory('all');
    }, 200);
  };

  const filteredIntegrations =
    selectedCategory === 'all'
      ? availableIntegrations
      : availableIntegrations.filter((i) => i.category === selectedCategory);

  // Group by category
  const groupedIntegrations = filteredIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<IntegrationCategory, AvailableIntegration[]>);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>Connect a Data Source</DialogTitle>
              <DialogDescription>
                Connect your accounts to automatically sync client data, documents, and communications.
              </DialogDescription>
            </DialogHeader>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 my-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {(['file_storage', 'email', 'calendar'] as IntegrationCategory[]).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {categoryIcons[cat]}
                  <span className="ml-1">{INTEGRATION_CATEGORY_LABELS[cat]}</span>
                </Button>
              ))}
            </div>

            {/* Integration Grid */}
            <div className="space-y-6">
              {Object.entries(groupedIntegrations).map(([category, integrations]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    {categoryIcons[category as IntegrationCategory]}
                    {INTEGRATION_CATEGORY_LABELS[category as IntegrationCategory]}
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {integrations.map((integration) => (
                      <Card
                        key={integration.provider}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleConnect(integration)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{
                                  backgroundColor: `${PROVIDER_COLORS[integration.provider]}15`,
                                }}
                              >
                                <div style={{ color: PROVIDER_COLORS[integration.provider] }}>
                                  {categoryIcons[integration.category]}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium">{integration.name}</h5>
                                  {integration.isPopular && (
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  )}
                                  {integration.isPremium && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Lock className="h-2 w-2 mr-1" />
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {integration.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {integration.features.slice(0, 3).map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                All integrations in this category are already connected.
              </div>
            )}
          </>
        )}

        {step === 'connecting' && selectedProvider && (
          <div className="py-12 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${PROVIDER_COLORS[selectedProvider.provider]}15` }}
            >
              <div style={{ color: PROVIDER_COLORS[selectedProvider.provider] }}>
                {categoryIcons[selectedProvider.category]}
              </div>
            </div>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Connecting to {selectedProvider.name}</h3>
            <p className="text-sm text-muted-foreground">
              Please authorize Ciri in the popup window...
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              (In production, this would open an OAuth popup)
            </p>
          </div>
        )}

        {step === 'success' && selectedProvider && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connected Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedProvider.name} is now connected and syncing.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ConnectButtonProps {
  onClick: () => void;
}

export function ConnectButton({ onClick }: ConnectButtonProps) {
  return (
    <Button onClick={onClick}>
      <FolderOpen className="mr-2 h-4 w-4" />
      Connect Source
    </Button>
  );
}
