import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PageBlock {
  path: string
  content: string
}

interface PageState {
  page: PageBlock | null
  ongoingCode: string
  status: 'idle' | 'generating' | 'complete' | 'error'
  error?: string
  setOngoingCode: (code: string) => void
  updatePage: (page: PageBlock) => void
  setStatus: (status: 'idle' | 'generating' | 'complete' | 'error') => void
  setError: (error?: string) => void
  saveGeneratedCode: (pageId: string, code: string) => Promise<void>
}

export const usePageStore = create<PageState>()(
  persist(
    (set, get) => ({
      page: null,
      ongoingCode: '',
      status: 'idle',
      error: undefined,

      setOngoingCode: (code) => set({ ongoingCode: code }),
      
      updatePage: (page) => set({ page }),
      
      setStatus: (status) => set({ status }),
      
      setError: (error) => set({ error }),

      saveGeneratedCode: async (pageId: string, code: string) => {
        try {
          const response = await fetch('/api/render', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, pageId }),
          })

          if (!response.ok) {
            throw new Error('Failed to save generated code')
          }

          const { previewUrl } = await response.json()
          const newPage = {
            path: previewUrl,
            content: code
          }
          
          set({ 
            page: newPage,
            status: 'complete'
          })
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'Failed to save code',
            status: 'error'
          })
        }
      }
    }),
    {
      name: 'page-storage',
      skipHydration: true // Important for Next.js to avoid hydration mismatch
    }
  )
)
