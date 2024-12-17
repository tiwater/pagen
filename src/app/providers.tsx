'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import useChatStore from '@/store/chat'
import { PageProvider } from '@/contexts/page-context'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate the store
    useChatStore.persist.rehydrate()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PageProvider>
        {children}
      </PageProvider>
    </ThemeProvider>
  )
}
