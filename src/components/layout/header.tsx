'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/context/session-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Crown, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton }: HeaderProps) {
  const { session, signOut } = useSession();

  const isGuest = session?.type === 'guest';
  const userEmail = session?.user?.email;
  const userName = session?.user?.name || 'Guest';
  const userInitials = isGuest
    ? 'G'
    : (userName || 'Guest')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

  return (
    <header className="h-14 border-b bg-background px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isGuest && (
          <Link href="/auth/login">
            <Button size="sm" variant="outline" className="gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Claim Workspace</span>
              <span className="sm:hidden">Sign In</span>
            </Button>
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={
                    isGuest
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary text-primary-foreground'
                  }
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                {isGuest ? (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    Guest
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {userEmail}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{userName}</span>
                {isGuest ? (
                  <Badge variant="secondary" className="w-fit mt-1">
                    Guest Session
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground font-normal">
                    {userEmail}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isGuest && (
              <>
                <DropdownMenuItem asChild>

                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isGuest ? (
              <DropdownMenuItem asChild>
                <Link href="/auth/login" className="cursor-pointer">
                  <Crown className="mr-2 h-4 w-4" />
                  Sign In / Claim Workspace
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
