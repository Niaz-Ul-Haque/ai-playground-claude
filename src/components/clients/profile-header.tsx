'use client';

import React from 'react';
import Link from 'next/link';
import type { Client, ClientRelationship } from '@/types/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Users,
  Briefcase,
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

interface ProfileHeaderProps {
  client: Client;
  relationships: ClientRelationship[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string) => {
  if (!name) return 'NA';
  return name
    .split(' ')
    .filter(n => n.length > 0)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NA';
};

const getRiskBadgeVariant = (risk: string) => {
  switch (risk) {
    case 'conservative':
      return 'secondary';
    case 'moderate':
      return 'default';
    case 'aggressive':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getRelationshipIcon = (type: string) => {
  switch (type) {
    case 'spouse':
    case 'child':
    case 'parent':
    case 'sibling':
      return Users;
    case 'accountant':
    case 'lawyer':
      return Briefcase;
    default:
      return Users;
  }
};

export function ProfileHeader({ client, relationships }: ProfileHeaderProps) {
  const age = differenceInYears(new Date(), new Date(client.birthDate));
  const familyRelations = relationships.filter((r) =>
    ['spouse', 'child', 'parent', 'sibling'].includes(r.relationshipType)
  );
  const professionalRelations = relationships.filter((r) =>
    ['accountant', 'lawyer'].includes(r.relationshipType)
  );

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link href="/clients">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
      </Link>

      {/* Main Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Name */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{client.name}</h1>
                  <p className="text-muted-foreground">
                    {age} years old · Client since{' '}
                    {format(new Date(client.createdAt), 'MMM yyyy')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getRiskBadgeVariant(client.riskProfile)}>
                    {client.riskProfile} risk
                  </Badge>
                  <Badge variant="outline">{client.accountType}</Badge>
                  {client.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 md:ml-auto">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(client.portfolioValue)}
                </p>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
              </div>
              {client.nextMeeting && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-semibold">
                    {format(new Date(client.nextMeeting), 'MMM d')}
                  </p>
                  <p className="text-xs text-muted-foreground">Next Meeting</p>
                </div>
              )}
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-semibold">
                  {format(new Date(client.lastContact), 'MMM d')}
                </p>
                <p className="text-xs text-muted-foreground">Last Contact</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="hover:underline">
                {client.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="hover:underline">
                {client.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {client.city}, {client.province}
              </span>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relationships Card */}
      {relationships.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Relationships
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Family */}
              {familyRelations.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">Family</p>
                  <div className="space-y-2">
                    {familyRelations.map((rel) => {
                      const Icon = getRelationshipIcon(rel.relationshipType);
                      return (
                        <div
                          key={rel.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{rel.relatedName}</span>
                          <Badge variant="outline" className="text-xs">
                            {rel.relationshipType}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Professionals */}
              {professionalRelations.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">
                    Professional Network
                  </p>
                  <div className="space-y-2">
                    {professionalRelations.map((rel) => {
                      const Icon = getRelationshipIcon(rel.relationshipType);
                      return (
                        <div
                          key={rel.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{rel.relatedName}</span>
                          <Badge variant="outline" className="text-xs">
                            {rel.relationshipType}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
