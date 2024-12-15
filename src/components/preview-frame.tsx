'use client'

import { useEffect, useRef, useState } from 'react'
import { type FileContent } from '@/types/project'
import { WebContainer } from '@webcontainer/api'

// Singleton instance
let webcontainerInstance: WebContainer | null = null
let isBooting = false

interface PreviewFrameProps {
  files: FileContent[]
}

export function PreviewFrame({ files }: PreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<string[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      webcontainerInstance?.teardown()
    }
  }, [])
  
  useEffect(() => {
    if (!containerRef.current) return

    const initWebContainer = async () => {
      try {
        // Only boot if no instance exists and not currently booting
        if (!webcontainerInstance && !isBooting) {
          isBooting = true
          webcontainerInstance = await WebContainer.boot()
          isBooting = false
        }

        if (!webcontainerInstance || !mountedRef.current) return

        // Mount files
        await webcontainerInstance.mount({
          'package.json': {
            file: {
              contents: `{
                "name": "preview",
                "type": "module",
                "dependencies": {
                  "react": "^18.2.0",
                  "react-dom": "^18.2.0"
                },
                "devDependencies": {
                  "@babel/core": "^7.23.7",
                  "@babel/preset-react": "^7.23.7",
                  "@babel/preset-typescript": "^7.23.7",
                  "typescript": "^5.3.3"
                }
              }`
            }
          },
          'index.html': {
            file: {
              contents: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                  </head>
                  <body>
                    <div id="root"></div>
                    <script>
                      const root = document.getElementById('root');
                      root.innerHTML = \`${files.find(f => f.path === 'app/page.tsx')?.content || ''}\`;
                    </script>
                  </body>
                </html>
              `
            }
          },
          'tsconfig.json': {
            file: {
              contents: `{
                "compilerOptions": {
                  "target": "ESNext",
                  "module": "ESNext",
                  "moduleResolution": "bundler",
                  "jsx": "react",
                  "strict": true,
                  "outDir": "dist"
                }
              }`
            }
          },
          'src/index.tsx': {
            file: {
              contents: `
                import React from 'react';
                import { createRoot } from 'react-dom/client';
                import { App } from './App';

                const root = createRoot(document.getElementById('root')!);
                root.render(<App />);
              `
            }
          },
          'src/App.tsx': {
            file: {
              contents: files.find(f => f.path === 'app/page.tsx')?.content || ''
            }
          }
        })

        if (!mountedRef.current) return

        // Install dependencies
        const installProcess = await webcontainerInstance.spawn('npm', ['install'])
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            if (mountedRef.current) {
              setLogs(prev => [...prev, data])
            }
          }
        }))

        // Compile TypeScript
        const buildProcess = await webcontainerInstance.spawn('npx', ['tsc'])
        buildProcess.output.pipeTo(new WritableStream({
          write(data) {
            if (mountedRef.current) {
              setLogs(prev => [...prev, data])
            }
          }
        }))

        // Start dev server
        const devServer = await webcontainerInstance.spawn('npx', ['serve', 'dist'])
        devServer.output.pipeTo(new WritableStream({
          write(data) {
            if (mountedRef.current) {
              console.log(data)
            }
          }
        }))

        // Capture console output
        webcontainerInstance.on('error', (log) => {
          if (mountedRef.current) {
            setLogs(prev => [...prev, log.message])
          }
        })
      } catch (error) {
        if (mountedRef.current) {
          console.error('WebContainer error:', error)
          setLogs(prev => [...prev, String(error)])
        }
      }
    }

    initWebContainer()
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
