'use client'

import { useEffect, useState } from 'react'

interface NextRuntimeProps {
  files: Array<{ path: string; content: string }>
  chatId: string
}

const NEXT_RUNTIME_URL = '/api/page'

export function NextRuntime({ files, chatId }: NextRuntimeProps) {
  const [runtimeUrl, setRuntimeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const updatePage = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: files,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update page')
        }

        const data = await response.json()
        // Use relative URL to ensure same origin
        setRuntimeUrl('/api/page')
      } catch (err) {
        console.error('Failed to update page:', err)
        setError(err instanceof Error ? err.message : 'Failed to update page')
      } finally {
        setLoading(false)
      }
    }

    if (files) {
      updatePage()
    }
  }, [files, chatId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Loading preview...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error: {error}
      </div>
    )
  }

  if (!runtimeUrl) {
    return (
      <div className="flex items-center justify-center h-full text-yellow-500">
        No preview available
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        key={runtimeUrl} // Force iframe reload when URL changes
        src={window.location.origin + runtimeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        referrerPolicy="same-origin"
        onLoad={() => {
          console.log('Runtime frame loaded');
        }}
        onError={(e) => {
          console.error('Failed to load runtime frame');
          setError('Failed to load runtime frame');
        }}
      />
    </div>
  )
}
