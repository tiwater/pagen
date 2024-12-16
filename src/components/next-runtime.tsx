'use client'

import { useEffect, useState } from 'react'

interface NextRuntimeProps {
  files: Array<{ path: string; content: string }>
  chatId: string
}

export function NextRuntime({ files, chatId }: NextRuntimeProps) {
  const [runtimeUrl, setRuntimeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const updatePage = async () => {
      try {
        setLoading(true)
        setError(null)

        // Find the page.tsx file
        const pageFile = files.find(f => f.path.endsWith('page.tsx'))
        if (!pageFile) {
          throw new Error('No page.tsx file found')
        }

        // Send the content to our API
        const response = await fetch('/api/page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: pageFile.content
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to update page')
        }

        const { runtimeUrl } = await response.json()
        setRuntimeUrl(runtimeUrl)
      } catch (error) {
        console.error('Update error:', error)
        setError(error instanceof Error ? error.message : 'Failed to update page')
      } finally {
        setLoading(false)
      }
    }

    updatePage()
  }, [files, chatId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    )
  }

  if (!runtimeUrl) {
    return (
      <div className="flex items-center justify-center h-full text-yellow-500">
        Runtime not available
      </div>
    )
  }

  return (
    <iframe
      src={runtimeUrl}
      className="w-full h-full border-none"
      allow="cross-origin-isolated"
    />
  )
}
