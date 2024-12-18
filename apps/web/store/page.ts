import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { renderPreview } from '@/lib/preview-server'

interface PageBlock {
  path: string
  content: string
  styles?: string
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
  previewPage: (pageId: string, code: string, styles?: string) => Promise<void>
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

      previewPage: async (pageId: string, code: string, styles?: string) => {
        try {
          set({ status: 'generating' })
          
          // Send to preview server
          const html = await renderPreview(code, styles)
          
          // Update local state
          set({ 
            page: { 
              path: `/preview/${pageId}`,
              content: html,
              styles 
            },
            status: 'complete'
          })
        } catch (error) {
          set({ 
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to generate preview'
          })
        }
      }
    }),
    {
      name: 'page-storage',
      skipHydration: true
    }
  )
)
