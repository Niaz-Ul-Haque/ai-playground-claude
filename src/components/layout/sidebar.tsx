'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/context/session-context';
import { getPreferenceSettings } from '@/lib/mock-data';
import {
  MessageSquare,
  Users,
  Lightbulb,
  CheckSquare,
  Link2,
  Settings2,
  LayoutDashboard,
  Upload,
  Activity,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  healthIndicator?: 'healthy' | 'warning' | 'error';
  navKey?: 'chat' | 'clients' | 'opportunities' | 'tasks' | 'sources' | 'automations' | 'dashboard' | 'import' | 'activity' | 'settings';
}

const mainNavItems: NavItem[] = [
  { label: 'Chat', href: '/', icon: MessageSquare, navKey: 'chat' },
  { label: 'Clients', href: '/clients', icon: Users, navKey: 'clients' },
  { label: 'Opportunities', href: '/opportunities', icon: Lightbulb, badge: 12, navKey: 'opportunities' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, badge: 5, navKey: 'tasks' },
  { label: 'Sources', href: '/integrations', icon: Link2, healthIndicator: 'healthy', navKey: 'sources' },
  { label: 'Automations', href: '/automations', icon: Settings2, badge: 2, navKey: 'automations' },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, navKey: 'dashboard' },
  { label: 'Import', href: '/import', icon: Upload, navKey: 'import' },
  { label: 'Activity', href: '/activity', icon: Activity, navKey: 'activity' },
  { label: 'Settings', href: '/settings', icon: Settings, navKey: 'settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { chatSessions, activeChatSessionId, createChatSession, selectChatSession, deleteChatSession, session } = useSession();
  const [visibleNavItems, setVisibleNavItems] = useState(getPreferenceSettings().visibleNavItems);

  // Reload settings when component mounts or when returning to page
  useEffect(() => {
    const loadSettings = () => {
      const settings = getPreferenceSettings();
      setVisibleNavItems(settings.visibleNavItems);
    };
    
    loadSettings();
    
    // Listen for storage events to update when settings change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preference-settings') {
        loadSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-window updates
    window.addEventListener('settings-updated', loadSettings as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-updated', loadSettings as EventListener);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleNewChat = () => {
    createChatSession();
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteChatSession(id);
  };

  const recentSessions = chatSessions.slice(0, 5);
  
  // Filter main nav items based on visibility settings
  const filteredMainNavItems = mainNavItems.filter((item) => {
    if (!item.navKey) return true;
    return visibleNavItems[item.navKey];
  });

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-muted/30 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo/User Info */}
      <div className="flex items-center justify-between h-14 px-4 border-b">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'G'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm truncate">
                {session?.user?.name || session?.user?.email || 'Guest'}
              </span>
              {session?.user?.name && session?.user?.email && (
                <span className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </span>
              )}
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation Section */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {/* Main Navigation */}
          {filteredMainNavItems.map((item) => (
            <div key={item.href}>
              <Link href={item.href} onClick={onNavigate}>
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.healthIndicator && (
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            item.healthIndicator === 'healthy' && 'bg-green-500',
                            item.healthIndicator === 'warning' && 'bg-yellow-500',
                            item.healthIndicator === 'error' && 'bg-red-500'
                          )}
                        />
                      )}
                    </>
                  )}
                </Button>
              </Link>

              {/* Chat Sessions (shown under Chat nav item) */}
              {item.href === '/' && !isCollapsed && isActive('/') && (
                <div className="ml-4 mt-1 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    New Chat
                  </Button>
                  {recentSessions.length > 0 && (
                    <div className="text-xs text-muted-foreground px-3 py-1">
                      Recent
                    </div>
                  )}
                  {recentSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => selectChatSession(session.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors group',
                        session.id === activeChatSessionId
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      )}
                    >
                      <span className="truncate flex-1 text-left">{session.title}</span>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Secondary Navigation - At Bottom, Only for authenticated users */}
      {session && session.type === 'user' && (
        <div className="border-t">
          <nav className="p-2 space-y-1">
            {secondaryNavItems
              .filter((item) => !item.navKey || visibleNavItems[item.navKey])
              .map((item) => (
                <Link key={item.href} href={item.href} onClick={onNavigate}>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="flex-1 text-left">{item.label}</span>
                    )}
                  </Button>
                </Link>
              ))}
          </nav>
        </div>
      )}
    </aside>
  );
}
