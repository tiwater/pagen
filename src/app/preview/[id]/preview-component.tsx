'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { usePageStore } from '@/store/page'

export function PreviewComponent({ id }: { id: string }) {
  const [retryCount, setRetryCount] = useState(0)
  const { page } = usePageStore()

  const DynamicComponent = dynamic(
    () => import(`@/generated/${id}`)
      .catch(async (error) => {
        // If file not found and we haven't retried too many times
        if (error.code === 'MODULE_NOT_FOUND' && retryCount < 3) {
          try {
            // Get the code from page context
            if (!page?.content) {
              throw new Error('No code available in store')
            }

            // Try to re-render the page
            const response = await fetch('/api/render', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code: page.content, pageId: id }),
            })

            if (!response.ok) {
              throw new Error('Failed to re-render page')
            }

            // Increment retry count
            setRetryCount(prev => prev + 1)
            
            // Re-attempt the import after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000))
            return import(`@/generated/${id}`)
          } catch (renderError) {
            console.error('Failed to re-render:', renderError)
            return () => (
              <div className="p-4 text-red-500">
                Error: {renderError instanceof Error ? renderError.message : 'Failed to load page'}. 
                Please try refreshing or going back to home.
              </div>
            )
          }
        }
        
        // If we've retried too many times or it's a different error
        console.error('Failed to load component:', error)
        return () => (
          <div className="p-4 text-red-500">
            Error: {error instanceof Error ? error.message : 'Failed to load page'}. 
            Please try refreshing or going back to home.
          </div>
        )
      }),
    {
      loading: () => <div className="p-4">Loading preview...</div>,
      ssr: false // Disable SSR for preview to ensure fresh renders
    }
  )

  return <DynamicComponent />
}
