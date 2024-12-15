'use client'

import { useEffect, useRef, useState } from 'react'
import { type FileContent } from '@/types/project'
import { WebContainer } from '@webcontainer/api'

interface PreviewFrameProps {
  files: FileContent[]
}

export function PreviewFrame({ files }: PreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  useEffect(() => {
    if (!containerRef.current) return
    
    let webcontainerInstance: WebContainer

    const initWebContainer = async () => {
      // Boot WebContainer
      webcontainerInstance = await WebContainer.boot()
      
      // Mount files
      await webcontainerInstance.mount({
        'index.html': {
          file: {
            contents: `
              <!DOCTYPE html>
              <html>
                <head>
                  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                  <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body>
                  <div id="root"></div>
                </body>
              </html>
            `
          }
        },
        'index.js': {
          file: {
            contents: `
              ${files.find(f => f.path === 'app/page.tsx')?.content || ''}
            `
          }
        }
      })

      // Capture console output
      webcontainerInstance.on('error', (log) => {
        setLogs(prev => [...prev, log.message])
      })

      // Start dev server
      const devServer = await webcontainerInstance.spawn('npx', ['serve'])
      devServer.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data)
        }
      }))
    }

    initWebContainer()
    
    return () => {
      webcontainerInstance?.teardown()
    }
  }, [files])

  return (
    <div className="grid grid-rows-[1fr,auto]">
      <div ref={containerRef} className="w-full h-full" />
      {logs.length > 0 && (
        <div className="h-32 bg-muted overflow-auto p-2 text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}
    </div>
  )
}
