'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import useProjectStore from '@/store/project';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate all stores when app loads
    useProjectStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
