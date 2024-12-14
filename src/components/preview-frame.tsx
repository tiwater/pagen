'use client'

import { useEffect, useRef } from 'react'
import { type FileContent } from '@/types/project'

interface PreviewFrameProps {
  files: FileContent[]
}

export function PreviewFrame({ files }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Create a virtual filesystem for the preview
    const virtualFs = new Map<string, string>()
    files.forEach(file => {
      virtualFs.set(file.path, file.content)
    })

    // Initialize preview environment
    const previewDoc = iframe.contentDocument
    if (!previewDoc) return

    // Add base styles and scripts
    previewDoc.head.innerHTML = `
      <style>
        @import 'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css';
      </style>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    `

    // Inject the page content
    const pageContent = virtualFs.get('app/page.tsx')
    if (pageContent) {
      previewDoc.body.innerHTML = `<div id="root">${pageContent}</div>`
    }
  }, [files])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
