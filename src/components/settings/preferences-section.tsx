'use client';

import { useState } from 'react';
import { Palette, Clock, Globe, Save, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PreferenceSettings } from '@/types/settings';
import {
  THEME_LABELS,
  DATE_FORMAT_LABELS,
  TIME_FORMAT_LABELS,
  CURRENCY_LABELS,
} from '@/types/settings';

interface PreferencesSectionProps {
  settings: PreferenceSettings;
  onSave: (settings: PreferenceSettings) => void;
}

export function PreferencesSection({ settings, onSave }: PreferencesSectionProps) {
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof PreferenceSettings>(
    field: K,
    value: PreferenceSettings[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select
              value={formData.theme}
              onValueChange={(value) => handleChange('theme', value as PreferenceSettings['theme'])}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(THEME_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Show smooth transitions and animations
              </p>
            </div>
            <Switch
              checked={formData.enableAnimations}
              onCheckedChange={(checked) => handleChange('enableAnimations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more content on screen
              </p>
            </div>
            <Switch
              checked={formData.compactMode}
              onCheckedChange={(checked) => handleChange('compactMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sidebar Collapsed</Label>
              <p className="text-sm text-muted-foreground">
                Start with the sidebar collapsed by default
              </p>
            </div>
            <Switch
              checked={formData.sidebarCollapsed}
              onCheckedChange={(checked) => handleChange('sidebarCollapsed', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Configure date, time, and currency formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={formData.dateFormat}
                onValueChange={(value) => handleChange('dateFormat', value as PreferenceSettings['dateFormat'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATE_FORMAT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select
                value={formData.timeFormat}
                onValueChange={(value) => handleChange('timeFormat', value as PreferenceSettings['timeFormat'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_FORMAT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value as PreferenceSettings['currency'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start of Week</Label>
              <Select
                value={formData.startOfWeek}
                onValueChange={(value) => handleChange('startOfWeek', value as PreferenceSettings['startOfWeek'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Views */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Default Views
          </CardTitle>
          <CardDescription>
            Configure default views and sort orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Start Page</Label>
            <Select
              value={formData.defaultView}
              onValueChange={(value) => handleChange('defaultView', value as PreferenceSettings['defaultView'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Task Sort Order</Label>
              <Select
                value={formData.taskSortOrder}
                onValueChange={(value) => handleChange('taskSortOrder', value as PreferenceSettings['taskSortOrder'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client Sort Order</Label>
              <Select
                value={formData.clientSortOrder}
                onValueChange={(value) => handleChange('clientSortOrder', value as PreferenceSettings['clientSortOrder'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="value">Portfolio Value</SelectItem>
                  <SelectItem value="last_contact">Last Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Completed Tasks</Label>
              <p className="text-sm text-muted-foreground">
                Display completed tasks in task lists
              </p>
            </div>
            <Switch
              checked={formData.showCompletedTasks}
              onCheckedChange={(checked) => handleChange('showCompletedTasks', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Navigation Visibility
          </CardTitle>
          <CardDescription>
            Choose which items appear in the sidebar navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Chat</Label>
              <p className="text-sm text-muted-foreground">
                Chat is always visible (cannot be disabled)
              </p>
            </div>
            <Switch
              checked={true}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Clients</Label>
              <p className="text-sm text-muted-foreground">
                Show Clients in sidebar
              </p>
            </div>
            <Switch
              checked={formData.visibleNavItems.clients}
              onCheckedChange={(checked) => 
                handleChange('visibleNavItems', { ...formData.visibleNavItems, clients: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Opportunities</Label>
              <p className="text-sm text-muted-foreground">
                Show Opportunities in sidebar
              </p>
            </div>
            <Switch
              checked={formData.visibleNavItems.opportunities}
              onCheckedChange={(checked) => 
                handleChange('visibleNavItems', { ...formData.visibleNavItems, opportunities: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Tasks</Label>
              <p className="text-sm text-muted-foreground">
                Show Tasks in sidebar
              </p>
            </div>
            <Switch
              checked={formData.visibleNavItems.tasks}
              onCheckedChange={(checked) => 
                handleChange('visibleNavItems', { ...formData.visibleNavItems, tasks: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sources</Label>
              <p className="text-sm text-muted-foreground">
                Show Sources in sidebar
              </p>
            </div>
            <Switch
              checked={formData.visibleNavItems.sources}
              onCheckedChange={(checked) => 
                handleChange('visibleNavItems', { ...formData.visibleNavItems, sources: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Automations</Label>
              <p className="text-sm text-muted-foreground">
                Show Automations in sidebar
              </p>
            </div>
            <Switch
              checked={formData.visibleNavItems.automations}
              onCheckedChange={(checked) => 
                handleChange('visibleNavItems', { ...formData.visibleNavItems, automations: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
}
