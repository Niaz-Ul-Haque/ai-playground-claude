'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Edit,
  Plus,
  User,
  Building,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { ClientProfileBlockData } from '@/types/chat-blocks';
import { formatCurrency, formatRelativeDate, formatDueDate, getInitials } from '@/lib/utils/format';
import { useChatContext } from '@/context/chat-context';

interface ClientProfileBlockProps {
  data: ClientProfileBlockData;
}

const RISK_PROFILE_COLORS: Record<string, string> = {
  aggressive: 'bg-red-100 text-red-800 border-red-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  conservative: 'bg-green-100 text-green-800 border-green-200',
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  rrsp: 'RRSP',
  tfsa: 'TFSA',
  resp: 'RESP',
  rrif: 'RRIF',
  non_registered: 'Non-Registered',
  insurance_life: 'Life Insurance',
  insurance_disability: 'Disability Insurance',
  insurance_critical: 'Critical Illness',
  pension: 'Pension',
  property: 'Property',
  gic: 'GIC',
};

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  task_completed: Clock,
  system: AlertCircle,
};

export function ClientProfileBlock({ data }: ClientProfileBlockProps) {
  const { sendMessage } = useChatContext();
  const {
    client,
    recentActivity = [],
    assets = [],
    showEditAction = true,
    showCreateTaskAction = true,
  } = data;

  const handleEdit = async () => {
    await sendMessage(`Edit client ${client.name}`);
  };

  const handleCreateTask = async () => {
    await sendMessage(`Create a task for ${client.name}`);
  };

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <Card className="my-4">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">{client.name}</CardTitle>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={RISK_PROFILE_COLORS[client.riskProfile]}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {client.riskProfile} risk
                  </Badge>
                  <Badge variant="secondary">{client.accountType}</Badge>
                  {client.status && (
                    <Badge
                      variant={client.status === 'active' ? 'default' : 'outline'}
                    >
                      {client.status}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showEditAction && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {showCreateTaskAction && (
                  <Button variant="default" size="sm" onClick={handleCreateTask}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Task
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Portfolio Value Card */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Portfolio Value
                </span>
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(client.portfolioValue)}
              </p>
            </div>
            {assets.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Assets Value</p>
                <p className="text-xl font-semibold">{formatCurrency(totalAssetValue)}</p>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="assets">Assets ({assets.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{client.address}</p>
                      <p>{client.city}, {client.province} {client.postalCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Professional Details</h4>
                <div className="space-y-2">
                  {client.occupation && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{client.occupation}</span>
                    </div>
                  )}
                  {client.employer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{client.employer}</span>
                    </div>
                  )}
                  {client.annualIncome && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(client.annualIncome)} annual income</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Important Dates</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Born: {formatDueDate(client.birthDate)}</span>
                  </div>
                  {client.nextMeeting && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Calendar className="h-4 w-4" />
                      <span>Next meeting: {formatDueDate(client.nextMeeting)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last contact: {formatRelativeDate(client.lastContact)}</span>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Notes</h4>
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </div>

            {client.tags && client.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  {client.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assets" className="mt-4">
            {assets.length > 0 ? (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {ASSET_TYPE_LABELS[asset.type] || asset.type}
                        </Badge>
                        {asset.institution && <span>{asset.institution}</span>}
                        {asset.accountNumber && <span>•</span>}
                        {asset.accountNumber && <span>#{asset.accountNumber}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(asset.value)}</p>
                      <Badge
                        variant={asset.status === 'active' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {asset.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No assets on file</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((event) => {
                  const Icon = TIMELINE_ICONS[event.type] || Clock;
                  return (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeDate(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No recent activity</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relationships" className="mt-4">
            {client.relationships && client.relationships.length > 0 ? (
              <div className="space-y-3">
                {client.relationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(rel.relatedName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{rel.relatedName}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {rel.relationshipType}
                        </Badge>
                      </div>
                    </div>
                    {rel.isPrimary && (
                      <Badge variant="secondary">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No relationships on file</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
