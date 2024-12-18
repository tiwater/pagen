'use client'

import { use, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPreview() {
      try {
        // Get code from API
        const res = await fetch(`/api/preview?id=${id}`)
        if (!res.ok) {
          throw new Error('Failed to load preview')
        }
        const { code } = await res.json()

        console.log('Code from API:', code)

        // Send code to preview server for rendering
        const renderRes = await fetch('http://localhost:3001/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!renderRes.ok) {
          const errorText = await renderRes.text()
          console.error('Preview server error:', errorText)
          throw new Error('Failed to render preview')
        }

        const html = await renderRes.text()
        setHtml(html)
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadPreview()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-amber-500 mb-2">Preview Error</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    )
  }

  return (
    <iframe
      srcDoc={html}
      className="w-full h-screen border-0"
      title="Component Preview"
    />
  )
}
