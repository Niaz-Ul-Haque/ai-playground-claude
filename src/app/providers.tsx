'use client';

import { SessionProvider } from '@/context/session-context';
import { AppShell } from '@/components/layout';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
