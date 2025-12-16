'use client';

import { useState } from 'react';
import { User, Shield, Bell, Sliders, Package, Users, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ProfileSection,
  SecuritySection,
  NotificationsSection,
  PreferencesSection,
} from '@/components/settings';
import {
  mockUserProfile,
  mockSecuritySettings,
  mockNotificationSettings,
  mockPreferenceSettings,
  mockProductSettings,
  mockTeamSettings,
  mockBillingSettings,
} from '@/lib/mock-data/settings';
import { updatePreferenceSettings } from '@/lib/mock-data';
import type {
  UserProfile,
  SecuritySettings,
  NotificationSettings,
  PreferenceSettings,
} from '@/types/settings';

// ============================================================================
// Products Section (placeholder)
// ============================================================================

function ProductsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Products & Markets
        </CardTitle>
        <CardDescription>
          Configure products and market conditions for opportunity detection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Active Products ({mockProductSettings.products.length})</h3>
            <div className="space-y-2">
              {mockProductSettings.products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{product.category.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Market Conditions ({mockProductSettings.marketConditions.length})</h3>
            <div className="space-y-2">
              {mockProductSettings.marketConditions.map((condition) => (
                <div key={condition.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{condition.name}</p>
                    <p className="text-xs text-muted-foreground">{condition.description}</p>
                  </div>
                  <Badge variant={condition.isActive ? 'default' : 'secondary'}>
                    {condition.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Team Section (placeholder)
// ============================================================================

function TeamSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Management
        </CardTitle>
        <CardDescription>
          Manage team members and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Team Members ({mockTeamSettings.members.length})</h3>
            <div className="space-y-2">
              {mockTeamSettings.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{member.role}</Badge>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {mockTeamSettings.invitations.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Pending Invitations ({mockTeamSettings.invitations.length})</h3>
              <div className="space-y-2">
                {mockTeamSettings.invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <p className="text-sm">{invite.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">Role: {invite.role}</p>
                    </div>
                    <Badge variant="secondary">{invite.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Billing Section (placeholder)
// ============================================================================

function BillingSection() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{mockBillingSettings.planName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(mockBillingSettings.amount || 0)} / {mockBillingSettings.billingCycle}
              </p>
            </div>
            <Badge className="capitalize">{mockBillingSettings.plan}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current usage across your plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(mockBillingSettings.usage).map(([key, usage]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>
                    {usage.used} / {usage.limit}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {mockBillingSettings.paymentMethod && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium capitalize">
                  {mockBillingSettings.paymentMethod.brand} •••• {mockBillingSettings.paymentMethod.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {mockBillingSettings.paymentMethod.expiryMonth}/{mockBillingSettings.paymentMethod.expiryYear}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockBillingSettings.billingHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(entry.amount)}</span>
                  <Badge variant={entry.status === 'paid' ? 'default' : 'secondary'}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Settings Page
// ============================================================================

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [security, setSecurity] = useState<SecuritySettings>(mockSecuritySettings);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotificationSettings);
  const [preferences, setPreferences] = useState<PreferenceSettings>(mockPreferenceSettings);

  const handlePreferencesSave = (newPreferences: PreferenceSettings) => {
    setPreferences(newPreferences);
    updatePreferenceSettings(newPreferences);
    
    // Dispatch custom event to notify sidebar about settings change
    window.dispatchEvent(new CustomEvent('settings-updated'));
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Sliders className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection profile={profile} onSave={setProfile} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySection settings={security} onUpdate={setSecurity} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSection settings={notifications} onSave={setNotifications} />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesSection settings={preferences} onSave={handlePreferencesSave} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsSection />
        </TabsContent>

        <TabsContent value="team">
          <TeamSection />
        </TabsContent>

        <TabsContent value="billing">
          <BillingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
