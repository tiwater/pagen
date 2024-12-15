'use client'

import { codeToHtml } from 'shiki/bundle/web'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import '@/styles/code-block.css'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = useState('')

  useEffect(() => {
    const highlight = async () => {
      const highlighted = await codeToHtml(code, {
        lang: language,
        theme: resolvedTheme === 'dark' ? 'nord' : 'github-light'
      })
      setHtml(highlighted)
    }

    highlight()
  }, [code, language, resolvedTheme])

  return (
    <div 
      className="text-xs border border-muted rounded-md bg-muted/50 p-2"
      dangerouslySetInnerHTML={{ 
        __html: html.replace(
          '<pre class="shiki"',
          '<pre class="shiki p-4"'
        )
      }} 
    />
  )
}
