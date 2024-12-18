import { Message } from 'ai'

export interface Chat {
  id: string
  userId: string
  path: string
  title: string
  messages: Message[]
  logs: string[]
  isNew: boolean
  createdAt: number
  updatedAt: number
  sharePath?: string
  latestCode?: string
}
