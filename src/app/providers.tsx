'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/lib/store'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrate the store
    useChatStore.persist.rehydrate()
  }, [])

  return children
}
