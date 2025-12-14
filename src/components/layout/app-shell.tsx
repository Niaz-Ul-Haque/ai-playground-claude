'use client';

import React, { useState, useSyncExternalStore, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'ciri_sidebar_collapsed';

function getCollapsedState(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  return stored === 'true';
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isCollapsed = useSyncExternalStore(subscribeToStorage, getCollapsedState, () => false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle navigation - close mobile sidebar
  const handleNavigation = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Save collapsed state to localStorage
  const handleToggleCollapse = useCallback(() => {
    const newValue = !isCollapsed;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new StorageEvent('storage', { key: SIDEBAR_COLLAPSED_KEY }));
  }, [isCollapsed]);

  // Check if we're on an auth page (don't show sidebar)
  const isAuthPage = pathname.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 md:relative md:z-0',
          'transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onNavigate={handleNavigation}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onMenuClick={() => setIsMobileOpen(true)}
          showMenuButton={!isMobileOpen}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
