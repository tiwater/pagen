'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import useProjectStore from '@/store/project';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate all stores when app loads
    useProjectStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
