'use client'

import { useEffect, useState } from 'react'

export function Preview({ code }: { code: string }) {
  const [html, setHtml] = useState<string>('')
  
  useEffect(() => {
    async function renderPreview() {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      
      const html = await res.text()
      setHtml(html)
    }
    
    renderPreview()
  }, [code])
  
  return (
    <div 
      className="preview-container"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  )
}
