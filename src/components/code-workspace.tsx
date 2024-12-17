'use client'

import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { CodeBlock } from "@/components/code-block"
import { ConsoleView } from "@/components/console-view"
import { useCallback } from "react"
import { usePageStore } from '@/store/page'

interface CodeWorkspaceProps {
  id: string
  isMobile?: boolean
  setIsPreviewOpen?: (open: boolean) => void
}

export function CodeWorkspace({ id, isMobile, setIsPreviewOpen }: CodeWorkspaceProps) {
  const { theme } = useTheme()
  const { page, ongoingCode, status } = usePageStore()
  const files = page ? [page] : []

  const handleScreenshot = useCallback(async () => {
    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to capture screenshot')
      }

      // Get the image blob
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Filename will be set by Content-Disposition header
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Screenshot error:', error)
    }
  }, [id])

  console.log('files', files)

  return (
    <div className="h-full">
      <Tabs defaultValue="preview" className="h-full w-full">
        <div className="flex items-center justify-between bg-transparent border-b">
          <TabsList className="w-full bg-transparent justify-start">
            <TabsTrigger value="preview"><Icons.window className="mr-2 h-4 w-4" />Preview</TabsTrigger>
            <TabsTrigger value="code"><Icons.code className="mr-2 h-4 w-4" />Code</TabsTrigger>
            <TabsTrigger value="console"><Icons.terminal className="mr-2 h-4 w-4" />Console</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleScreenshot}
              title="Take Screenshot"
            >
              <Icons.camera className="h-4 w-4" />
            </Button>
            {isMobile && setIsPreviewOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
                <Icons.close className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <TabsContent value="preview" className="h-[calc(100vh-48px)] m-0">
          {status === 'complete' && (
            <iframe 
              src={`/preview/${id}`}
              className="w-full h-full border-0"
              title="Page Preview"
            />
          )}
        </TabsContent>
        <TabsContent value="code" className="h-[calc(100vh-48px)] m-0 overflow-auto">
          <div className="">
            {status === 'generating' ? (
              <CodeBlock code={ongoingCode} language="tsx" />
            ) : (
              files.map((file) => (
                <div key={file.path} className="">
                  <CodeBlock code={file.content} language="tsx" />
                </div>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="console" className="h-[calc(100vh-48px)] m-0">
          <ConsoleView chatId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
