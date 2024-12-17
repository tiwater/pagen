'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageBlock {
  path: string;
  content: string;
}

interface PageContextType {
  page: PageBlock | null;
  ongoingCode: string;
  status: 'idle' | 'generating' | 'complete' | 'error';
  setOngoingCode: (code: string) => void;
  updatePage: (page: PageBlock) => void;
  setStatus: (status: 'idle' | 'generating' | 'complete' | 'error') => void;
  error?: string;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageBlock | null>(null);
  const [ongoingCode, setOngoingCode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | undefined>(undefined);

  const updatePage = useCallback((newPage: PageBlock) => {
    setPage(newPage);
    // Only send to API when generation is complete
    if (status === 'complete') {
      fetch('/api/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPage),
      }).catch((err) => {
        setError(err.message);
        setStatus('error');
      });
    }
  }, [status]);

  return (
    <PageContext.Provider
      value={{
        page,
        ongoingCode,
        status,
        setOngoingCode,
        updatePage,
        setStatus,
        error,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
}
