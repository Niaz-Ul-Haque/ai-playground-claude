'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSession } from '@/context/session-context';
import { getPreferenceSettings } from '@/lib/mock-data';
import type { ChatSession } from '@/types/session';
import {
  MessageSquare,
  MessageSquarePlus,
  Users,
  Lightbulb,
  CheckSquare,
  Link2,
  Settings2,
  LayoutDashboard,
  Upload,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  MoreHorizontal,
  X,
  Check,
} from 'lucide-react';

// ============================================================================
// Chat Section Components (integrated from ChatSidebar)
// ============================================================================

interface SectionHeaderProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectionHeader({ title, count, isExpanded, onToggle }: SectionHeaderProps) {
  return (
    <button
      className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      onClick={onToggle}
    >
      <span>
        {title} ({count})
      </span>
      {isExpanded ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
    </button>
  );
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onSelect: () => void;
  onPin: () => void;
  onStartRename: () => void;
  onDeleteRequest: () => void;
  onEditingTitleChange: (value: string) => void;
  onSubmitRename: () => void;
  onCancelRename: () => void;
  formatDate: (dateStr: string) => string;
}

function SessionItem({
  session,
  isActive,
  isEditing,
  editingTitle,
  onSelect,
  onPin,
  onStartRename,
  onDeleteRequest,
  onEditingTitleChange,
  onSubmitRename,
  onCancelRename,
  formatDate,
}: SessionItemProps) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors w-full',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      )}
      onClick={() => !isEditing && onSelect()}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              className="h-6 text-sm px-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmitRename();
                if (e.key === 'Escape') onCancelRename();
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onSubmitRename();
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onCancelRename();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap" title={session.title}>
              {session.title}
            </p>
            <p 
              className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap" 
              title={session.lastMessage || 'No messages'}
            >
              {session.lastMessage || 'No messages'}
            </p>
          </>
        )}
      </div>

      {!isEditing && (
        <div className={cn(
          "absolute right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-4 rounded-r-lg",
          isActive ? "bg-gradient-to-l from-primary/10 via-primary/10 to-transparent" : "bg-gradient-to-l from-muted/50 via-muted/50 to-transparent group-hover:from-muted/80 group-hover:via-muted/80"
        )}>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDate(session.updatedAt)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onStartRename();
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
              >
                {session.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest();
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {session.isPinned && !isEditing && (
        <Pin className="absolute right-2 h-3 w-3 text-muted-foreground shrink-0 group-hover:hidden" />
      )}
    </div>
  );
}

// ============================================================================
// Main Sidebar Component
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  healthIndicator?: 'healthy' | 'warning' | 'error';
  navKey?: 'chat' | 'clients' | 'opportunities' | 'tasks' | 'sources' | 'automations' | 'dashboard' | 'import' | 'activity' | 'settings';
}

// Remove Chat from main nav - it now has its own section
const mainNavItems: NavItem[] = [
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
  const router = useRouter();
  const { 
    chatSessions, 
    activeChatSessionId, 
    createChatSession, 
    selectChatSession, 
    deleteChatSession, 
    updateChatSessionTitle,
    togglePinChatSession,
    session 
  } = useSession();
  const [visibleNavItems, setVisibleNavItems] = useState(getPreferenceSettings().visibleNavItems);
  
  // Chat section state
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true);
  const [isRecentExpanded, setIsRecentExpanded] = useState(true);

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default w-64 = 256px
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Handle resize
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      // Clamp width between 200px and 400px
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Separate pinned and unpinned sessions, filtered by search
  const { pinnedSessions, recentSessions, filteredSessions } = useMemo(() => {
    const sessions = Array.isArray(chatSessions) ? chatSessions : [];
    const filtered = searchQuery
      ? sessions.filter((s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sessions;
    const pinned = filtered.filter((s) => s.isPinned);
    const recent = filtered.filter((s) => !s.isPinned);
    return { pinnedSessions: pinned, recentSessions: recent, filteredSessions: filtered };
  }, [chatSessions, searchQuery]);

  // Handle rename
  const startRename = useCallback((chatSession: ChatSession) => {
    setEditingId(chatSession.id);
    setEditingTitle(chatSession.title);
  }, []);

  const submitRename = useCallback(() => {
    if (editingId && editingTitle.trim()) {
      updateChatSessionTitle(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  }, [editingId, editingTitle, updateChatSessionTitle]);

  const cancelRename = useCallback(() => {
    setEditingId(null);
    setEditingTitle('');
  }, []);

  // Handle pin toggle
  const handlePinSession = useCallback((id: string) => {
    togglePinChatSession(id);
  }, [togglePinChatSession]);

  // Format date for display
  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

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

  const handleNewChat = useCallback(() => {
    createChatSession();
    // Navigate to chat page if not already there
    if (pathname !== '/') {
      router.push('/');
    }
    onNavigate?.();
  }, [createChatSession, pathname, router, onNavigate]);

  // Handle selecting a chat session - also navigates to chat page
  const handleSelectSession = useCallback((sessionId: string) => {
    selectChatSession(sessionId);
    // Navigate to chat page if not already there
    if (pathname !== '/') {
      router.push('/');
    }
    onNavigate?.();
  }, [selectChatSession, pathname, router, onNavigate]);
  
  // Filter main nav items based on visibility settings
  const filteredMainNavItems = mainNavItems.filter((item) => {
    if (!item.navKey) return true;
    return visibleNavItems[item.navKey];
  });

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        'relative flex flex-col border-r bg-muted/30 h-screen overflow-hidden',
        isCollapsed ? 'w-16 transition-all duration-300' : ''
      )}
      style={isCollapsed ? undefined : { width: sidebarWidth }}
    >
      {/* Resize handle */}
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary/30 z-10"
          onMouseDown={startResizing}
        />
      )}
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

      {/* Chat Section - Integrated from ChatSidebar */}
      {isCollapsed ? (
        // Collapsed view - show Chat icon link and New Chat icon
        <div className="flex flex-col items-center py-2 border-b gap-1">
          <Link href="/" onClick={onNavigate}>
            <Button
              variant={pathname === '/' ? 'secondary' : 'ghost'}
              size="icon"
              title="Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            title="New chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Expanded view - full chat section
        <div className="flex flex-col border-b min-h-0 max-h-[50vh] overflow-hidden">
          {/* Chat Header - clickable to go to chat page */}
          <div className="p-3 border-b shrink-0">
            <div className="flex items-center justify-between mb-3">
              <Link href="/" onClick={onNavigate}>
                <h2 className="text-sm font-semibold hover:text-primary cursor-pointer transition-colors">Chat History</h2>
              </Link>
            </div>
            <Button
              className="w-full justify-start gap-2"
              onClick={handleNewChat}
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Session List - scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden w-full">
            <ScrollArea className="h-full w-full">
              <div className="p-2 w-full" style={{ maxWidth: '100%' }}>
              {/* Pinned Sessions */}
              {pinnedSessions.length > 0 && (
                <div className="mb-2 w-full">
                  <SectionHeader
                    title="Pinned"
                    count={pinnedSessions.length}
                    isExpanded={isPinnedExpanded}
                    onToggle={() => setIsPinnedExpanded(!isPinnedExpanded)}
                  />
                  {isPinnedExpanded && (
                    <div className="space-y-1 overflow-hidden">
                      {pinnedSessions.map((chatSession) => (
                        <SessionItem
                          key={chatSession.id}
                          session={chatSession}
                          isActive={chatSession.id === activeChatSessionId}
                          isEditing={chatSession.id === editingId}
                          editingTitle={editingTitle}
                          onSelect={() => handleSelectSession(chatSession.id)}
                          onPin={() => handlePinSession(chatSession.id)}
                          onStartRename={() => startRename(chatSession)}
                          onDeleteRequest={() => setDeleteConfirmId(chatSession.id)}
                          onEditingTitleChange={setEditingTitle}
                          onSubmitRename={submitRename}
                          onCancelRename={cancelRename}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Sessions */}
              {recentSessions.length > 0 && (
                <div className="overflow-hidden">
                  <SectionHeader
                    title="Recent"
                    count={recentSessions.length}
                    isExpanded={isRecentExpanded}
                    onToggle={() => setIsRecentExpanded(!isRecentExpanded)}
                  />
                  {isRecentExpanded && (
                    <div className="space-y-1 overflow-hidden">
                      {recentSessions.map((chatSession) => (
                        <SessionItem
                          key={chatSession.id}
                          session={chatSession}
                          isActive={chatSession.id === activeChatSessionId}
                          isEditing={chatSession.id === editingId}
                          editingTitle={editingTitle}
                          onSelect={() => handleSelectSession(chatSession.id)}
                          onPin={() => handlePinSession(chatSession.id)}
                          onStartRename={() => startRename(chatSession)}
                          onDeleteRequest={() => setDeleteConfirmId(chatSession.id)}
                          onEditingTitleChange={setEditingTitle}
                          onSubmitRename={submitRename}
                          onCancelRename={cancelRename}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {filteredSessions.length === 0 && (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'No chats match your search'
                      : 'No chat history yet'}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="link"
                      className="text-sm mt-2"
                      onClick={handleNewChat}
                    >
                      Start a new chat
                    </Button>
                  )}
                </div>
              )}
            </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Main Navigation Section */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {/* Main Navigation */}
          {filteredMainNavItems.map((item) => (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmId) {
                  deleteChatSession(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
