'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import useChatStore from '@/store/chat'
import { usePageStore } from '@/store/page'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate all stores when app loads
    useChatStore.persist.rehydrate()
    usePageStore.persist.rehydrate()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
