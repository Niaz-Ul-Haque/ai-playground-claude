'use client';

import { useState } from 'react';
import { Shield, Key, Smartphone, Monitor, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SecuritySettings, ActiveSession } from '@/types/settings';

interface SecuritySectionProps {
  settings: SecuritySettings;
  onUpdate: (settings: SecuritySettings) => void;
}

export function SecuritySection({ settings, onUpdate }: SecuritySectionProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 5) return 'Active now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return formatDate(dateString);
  };

  const handle2FAToggle = (enabled: boolean) => {
    if (enabled) {
      setShow2FADialog(true);
    } else {
      onUpdate({ ...settings, twoFactorEnabled: false, twoFactorMethod: undefined });
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    const updatedSessions = settings.activeSessions.filter(s => s.id !== sessionId);
    onUpdate({ ...settings, activeSessions: updatedSessions });
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Manage your password and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Last changed: {formatDate(settings.passwordLastChanged)}
              </p>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input id="confirm" type="password" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowPasswordDialog(false)}>
                    Update Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                settings.twoFactorEnabled ? 'bg-green-100' : 'bg-muted'
              )}>
                {settings.twoFactorEnabled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Shield className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {settings.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.twoFactorEnabled
                    ? `Using ${settings.twoFactorMethod === 'app' ? 'authenticator app' : settings.twoFactorMethod}`
                    : 'Enable for enhanced security'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={handle2FAToggle}
            />
          </div>

          {/* 2FA Setup Dialog */}
          <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Choose how you want to receive verification codes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    onUpdate({ ...settings, twoFactorEnabled: true, twoFactorMethod: 'app' });
                    setShow2FADialog(false);
                  }}
                >
                  <Smartphone className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Use Google Authenticator or similar
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    onUpdate({ ...settings, twoFactorEnabled: true, twoFactorMethod: 'sms' });
                    setShow2FADialog(false);
                  }}
                >
                  <Smartphone className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Receive codes via text message
                    </p>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage devices where you&apos;re currently signed in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{session.device}</p>
                    {session.isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatLastActive(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login History</CardTitle>
          <CardDescription>
            Review recent sign-in activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {settings.loginHistory.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  {entry.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{entry.device}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{entry.location}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
