'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, Moon, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NotificationSettings, NotificationPreference } from '@/types/settings';
import { NOTIFICATION_CATEGORY_LABELS } from '@/types/settings';

interface NotificationsSectionProps {
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

export function NotificationsSection({ settings, onSave }: NotificationsSectionProps) {
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (prefId: string, field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.map(p =>
        p.id === prefId
          ? {
              ...p,
              ...(field === 'enabled'
                ? { enabled: value }
                : { channels: { ...p.channels, [field]: value } }),
            }
          : p
      ),
    }));
    setHasChanges(true);
  };

  const handleQuietHoursChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  // Group preferences by category
  const groupedPreferences = formData.preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <div className="space-y-6">
      {/* Notification Preferences by Category */}
      {Object.entries(groupedPreferences).map(([category, prefs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">
              {NOTIFICATION_CATEGORY_LABELS[category as keyof typeof NOTIFICATION_CATEGORY_LABELS]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prefs.map((pref) => (
              <div key={pref.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{pref.label}</p>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    checked={pref.enabled}
                    onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'enabled', checked)}
                  />
                </div>
                {pref.enabled && (
                  <div className="flex flex-wrap gap-4 pl-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${pref.id}-email`}
                        checked={pref.channels.email}
                        onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'email', checked as boolean)}
                      />
                      <Label htmlFor={`${pref.id}-email`} className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${pref.id}-push`}
                        checked={pref.channels.push}
                        onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'push', checked as boolean)}
                      />
                      <Label htmlFor={`${pref.id}-push`} className="text-sm flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        Push
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${pref.id}-in_app`}
                        checked={pref.channels.in_app}
                        onCheckedChange={(checked) => handlePreferenceChange(pref.id, 'in_app', checked as boolean)}
                      />
                      <Label htmlFor={`${pref.id}-in_app`} className="text-sm flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        In-App
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Quiet Hours</p>
              <p className="text-sm text-muted-foreground">
                No notifications during specified times
              </p>
            </div>
            <Switch
              checked={formData.quietHoursEnabled}
              onCheckedChange={(checked) => handleQuietHoursChange('quietHoursEnabled', checked)}
            />
          </div>

          {formData.quietHoursEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.quietHoursStart || '22:00'}
                    onChange={(e) => handleQuietHoursChange('quietHoursStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.quietHoursEnd || '07:00'}
                    onChange={(e) => handleQuietHoursChange('quietHoursEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Active Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Button
                      key={day}
                      variant={formData.quietHoursDays?.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                      onClick={() => {
                        const currentDays = formData.quietHoursDays || [];
                        const newDays = currentDays.includes(day)
                          ? currentDays.filter(d => d !== day)
                          : [...currentDays, day];
                        handleQuietHoursChange('quietHoursDays', newDays);
                      }}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card>
        <CardHeader>
          <CardTitle>Email Digest</CardTitle>
          <CardDescription>
            Receive a summary of activity instead of individual notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Digest</p>
              <p className="text-sm text-muted-foreground">
                Receive consolidated activity summaries
              </p>
            </div>
            <Switch
              checked={formData.digestEnabled}
              onCheckedChange={(checked) => handleQuietHoursChange('digestEnabled', checked)}
            />
          </div>

          {formData.digestEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={formData.digestFrequency}
                  onValueChange={(value) => handleQuietHoursChange('digestFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Input
                  type="time"
                  value={formData.digestTime || '08:00'}
                  onChange={(e) => handleQuietHoursChange('digestTime', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
        </div>
      )}
    </div>
  );
}
