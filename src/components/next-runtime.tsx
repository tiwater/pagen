'use client'

import { useEffect, useRef, useState } from 'react'
import { WebContainer, FileSystemTree } from '@webcontainer/api'

// Singleton instance and state
let webcontainerInstance: WebContainer | null = null
let isBooting = false
let currentChatId: string | null = null
let tearingDown = false
let setupStartedChats = new Set<string>()

interface NextRuntimeProps {
  files: Array<{ path: string; content: string }>
  chatId: string
}

export function NextRuntime({ files, chatId }: NextRuntimeProps) {
  console.log('NextRuntime mounted with:', { files, chatId })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const chatIdRef = useRef(chatId)
  const serverReadyRef = useRef(false)
  const [serverUrl, setServerUrl] = useState<string>('')

  // Mount state management
  useEffect(() => {
    mountedRef.current = true
    return () => {
      console.log('Component unmounting:', { chatId, serverReady: serverReadyRef.current })
      mountedRef.current = false
    }
  }, [])

  // Update chatIdRef when chatId prop changes
  useEffect(() => {
    console.log('ChatId changed:', { from: chatIdRef.current, to: chatId })
    chatIdRef.current = chatId
  }, [chatId])

  // Cleanup effect
  useEffect(() => {
    console.log('Setting up cleanup for chat:', chatId)
    currentChatId = chatId
    
    return () => {
      console.log('Running cleanup for chat:', { 
        chatId,
        currentChatId,
        mounted: mountedRef.current,
        serverReady: serverReadyRef.current,
        currentChatIdRef: chatIdRef.current
      })
      
      if (currentChatId === chatId) {
        currentChatId = null
        setupStartedChats.delete(chatId)
        
        const cleanup = async () => {
          if (webcontainerInstance && !tearingDown) {
            tearingDown = true
            try {
              console.log('Tearing down WebContainer...')
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
  }, [chatId])

  // Setup effect
  useEffect(() => {
    console.log('Setup effect running, container:', containerRef.current)
    
    // Wait for container to be mounted
    if (!containerRef.current) {
      console.log('Container not yet mounted, waiting...')
      return
    }

    // Check if setup is needed
    if (!chatId || !mountedRef.current) {
      console.log('Setup not needed:', {
        noChatId: !chatId,
        notMounted: !mountedRef.current
      })
      return
    }

    // Check if already set up
    if (setupStartedChats.has(chatId)) {
      console.log('Setup already started for chat:', chatId)
      return
    }

    setupStartedChats.add(chatId)
    console.log('Starting setup for chat:', chatId)
    
    const setupContainer = async () => {
      try {
        if (!webcontainerInstance && !isBooting) {
          isBooting = true
          console.log('Booting new WebContainer instance...')
          webcontainerInstance = await WebContainer.boot()
          isBooting = false
          console.log('WebContainer booted successfully')
        }

        if (!webcontainerInstance) {
          console.error('WebContainer instance not available')
          setupStartedChats.delete(chatId) // Allow retry on failure
          return
        }

        console.log('Mounting files:', files)
        
        // Define types for the file system structure
        const fileSystem: FileSystemTree = {
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: 'next-app',
                private: true,
                scripts: {
                  dev: 'next dev',
                  build: 'next build',
                  start: 'next start'
                },
                dependencies: {
                  'next': '^14.0.0',
                  'react': '^18.2.0',
                  'react-dom': '^18.2.0'
                }
              }, null, 2)
            }
          },
          'next.config.js': {
            file: {
              contents: 'module.exports = {}'
            }
          }
        }

        // Create directories and add files
        for (const { path, content } of files) {
          const parts = path.split('/')
          let currentPath = ''
          let currentObj: FileSystemTree = fileSystem

          // Create directory structure
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath += (currentPath ? '/' : '') + parts[i]
            if (!currentObj[parts[i]]) {
              console.log('Creating directory:', currentPath)
              currentObj[parts[i]] = {
                directory: {} as FileSystemTree
              }
            }
            currentObj = currentObj[parts[i]] as { directory: FileSystemTree }
          }

          // Add file
          const fileName = parts[parts.length - 1]
          currentObj[fileName] = {
            file: {
              contents: content
            }
          }
        }

        console.log('File system structure:', fileSystem)
        await webcontainerInstance.mount(fileSystem)
        console.log('Files mounted successfully')

        console.log('Installing dependencies...')
        const installProcess = await webcontainerInstance.spawn('npm', ['install'])
        
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[npm install]', data)
          }
        }))

        const installExitCode = await installProcess.exit
        if (installExitCode !== 0) {
          console.error('npm install failed with code:', installExitCode)
          setupStartedChats.delete(chatId) // Allow retry on failure
          return
        }
        console.log('Dependencies installed successfully')

        console.log('Starting development server...')
        const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'dev'])
        
        serverProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[Server]', data)
          }
        }))

        webcontainerInstance.on('server-ready', (port, url) => {
          console.log('Server ready event:', {
            url,
            mounted: mountedRef.current,
            currentChatId,
            componentChatId: chatIdRef.current
          })
          
          serverReadyRef.current = true
          
          if (mountedRef.current && chatIdRef.current === chatId) {
            console.log('Setting server URL:', url)
            setServerUrl(url)
          } else {
            console.log('Server ready but component state invalid:', {
              mounted: mountedRef.current,
              currentChatId,
              componentChatId: chatIdRef.current,
              expectedChatId: chatId,
              serverReady: serverReadyRef.current
            })
          }
        })

      } catch (error) {
        console.error('Container setup error:', error)
        setupStartedChats.delete(chatId) // Allow retry on failure
      }
    }

    setupContainer()
  }, [chatId, files])

  return (
    <div className="w-full h-full" ref={containerRef}>
      {!serverUrl ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <iframe
          src={serverUrl}
          className="w-full h-full border-none"
          allow="cross-origin-isolated"
        />
      )}
    </div>
  )
}
