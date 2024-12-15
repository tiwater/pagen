'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { WebContainer } from '@webcontainer/api'
import useChatStore from '@/store/chat'

// Singleton instance and state
let webcontainerInstance: WebContainer | null = null
let isBooting = false
let currentChatId: string | null = null
let tearingDown = false

// Simple event emitter for logs
const logEmitter = {
  listeners: new Set<(chatId: string, message: string) => void>(),
  emit(chatId: string, message: string) {
    this.listeners.forEach(listener => listener(chatId, message))
  },
  subscribe(listener: (chatId: string, message: string) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

interface NextRuntimeProps {
  files: Array<{ path: string; content: string }>
  chatId: string
}

export function NextRuntime({ files, chatId }: NextRuntimeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const [serverUrl, setServerUrl] = useState<string>('')
  const addLog = useChatStore(state => state.addLog)

  // Subscribe to log events
  useEffect(() => {
    const unsubscribe = logEmitter.subscribe((id, message) => {
      if (id === chatId) {
        addLog(id, message)
      }
    })
    return () => { unsubscribe() }
  }, [chatId, addLog])

  const log = useCallback((message: string) => {
    if (!mountedRef.current) return
    console.log(message)
    logEmitter.emit(chatId, message)
  }, [chatId])

  // Cleanup effect
  useEffect(() => {
    currentChatId = chatId
    return () => {
      if (currentChatId === chatId) {
        currentChatId = null
        mountedRef.current = false
        
        const cleanup = async () => {
          if (webcontainerInstance && !tearingDown) {
            tearingDown = true
            try {
              log('Tearing down WebContainer...')
              await webcontainerInstance.teardown()
              webcontainerInstance = null
            } catch (error) {
              console.error('Error tearing down WebContainer:', error)
            } finally {
              tearingDown = false
            }
          }
        }
        cleanup()
      }
    }
  }, [chatId, log])

  // Setup effect
  useEffect(() => {
    if (!containerRef.current || !chatId || !mountedRef.current) return
    
    const setupContainer = async () => {
      try {
        // Only initialize if we don't have an instance and aren't already booting
        if (!webcontainerInstance && !isBooting && !tearingDown) {
          isBooting = true
          try {
            log('Booting WebContainer...')
            webcontainerInstance = await WebContainer.boot()
            log('WebContainer booted successfully')
          } catch (error) {
            log(`Error booting WebContainer: ${error}`)
            throw error
          } finally {
            isBooting = false
          }
        }

        // Wait for any ongoing teardown to complete
        while (tearingDown) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (!webcontainerInstance || !mountedRef.current || currentChatId !== chatId) {
          return
        }

        log('Mounting project files...')
        await webcontainerInstance.mount(files.reduce((acc, file) => ({
          ...acc,
          [file.path]: {
            file: { contents: file.content }
          }
        }), {}))

        // Install dependencies
        const installProcess = await webcontainerInstance.spawn('npm', ['install'])
        const installExitCode = await installProcess.exit
        
        if (installExitCode !== 0) {
          throw new Error('Failed to install dependencies')
        }

        // Start the Next.js dev server
        const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'dev'])
        
        // Wait for the URL to be ready
        webcontainerInstance.on('server-ready', (port, url) => {
          if (mountedRef.current && currentChatId === chatId) {
            setServerUrl(url)
            log(`Server started at ${url}`)
          }
        })

      } catch (error) {
        log(`Error setting up container: ${error}`)
        console.error('Container setup error:', error)
      }
    }

    setupContainer()
  }, [chatId, files, log])

  if (!serverUrl) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full h-full" ref={containerRef}>
      <iframe
        src={serverUrl}
        className="w-full h-full border-none"
        allow="cross-origin-isolated"
      />
    </div>
  )
}
