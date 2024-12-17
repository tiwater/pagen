import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from 'ai'
import { nanoid } from 'nanoid'

interface Chat {
  id: string
  title: string
  messages: Message[]
  logs: string[]
  isNew: boolean
  createdAt: number
  updatedAt: number
}

interface ChatState {
  chats: Record<string, Chat>
  currentChatId: string | null
  createChat: (title: string, initialMessage?: string) => string
  addMessage: (chatId: string, message: Message) => void
  addLog: (chatId: string, log: string) => void
  setCurrentChat: (chatId: string) => void
  markChatInitialized: (chatId: string) => void
}

// Type for the old state structure
interface OldChatState {
  messages: Record<string, Message[]>
  currentChatId: string | null
}

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: null,

      createChat: (title, initialMessage) => {
        const chatId = nanoid(10)
        console.log('Creating new chat:', chatId, 'with title:', title)
        set((state) => ({
          currentChatId: chatId,
          chats: {
            ...state.chats,
            [chatId]: {
              id: chatId,
              title,
              messages: initialMessage
                ? [
                    {
                      id: nanoid(),
                      role: 'user',
                      content: initialMessage,
                      createdAt: new Date()
                    }
                  ]
                : [],
              logs: [],
              isNew: true,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          }
        }))
        console.log('Chat created:', chatId, 'Current store:', get().chats[chatId])
        return chatId
      },

      addMessage: (chatId, message) => 
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: Date.now()
              }
            }
          }
        }),

      addLog: (chatId, log) =>
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) {
            console.warn('No chat found for ID:', chatId)
            return state
          }
          console.log('Adding log:', log, 'to chat:', chatId, 'current logs:', chat.logs)
          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                logs: [...(chat.logs || []), log]
              }
            }
          }
        }),

      markChatInitialized: (chatId) =>
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state

          console.log('Marking chat initialized:', chatId)
          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                isNew: false
              }
            }
          }
        }),

      setCurrentChat: (chatId) => 
        set({ currentChatId: chatId })
    }),
    {
      name: 'chat-store',
      version: 1,
    }
  )
)

export default useChatStore