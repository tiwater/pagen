'use client'

import { useCallback } from 'react'
import { useChatStore } from '@/lib/store'
import { useCompletion } from 'ai/react'

export function useChat(chatId: string) {
  const messages = useChatStore((state) => state.messages[chatId])
  const addMessage = useChatStore((state) => state.addMessage)

  const { complete } = useCompletion({
    api: '/api/generate',
    body: {
      messages: messages || [],
      model: 'gpt-4o-mini'
    }
  })

  const sendMessage = useCallback(async (content: string) => {
    addMessage(chatId, { role: 'user', content })
    const response = await complete(content)
    if (response) {
      addMessage(chatId, { role: 'assistant', content: response })
    }
  }, [chatId, addMessage, complete])

  return { messages: messages || [], sendMessage }
}
