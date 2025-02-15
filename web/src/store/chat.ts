import { Chat, ProjectFile, ProjectType } from '@/types/chat';
import { Message } from 'ai';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  createChat: (title: string, userId: string, initialMessage?: string) => string;
  addMessage: (chatId: string, message: Message) => void;
  setCurrentChat: (chatId: string) => void;
  markChatInitialized: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  activeChat: string | null;
  addChat: (chat: Chat) => void;
  updateChatProjectType: (chatId: string, projectType: ProjectType) => void;
  updateChatFile: (chatId: string, file: ProjectFile) => void;
  setActiveFile: (chatId: string, fileId: string) => void;
  getChats: () => Chat[];
}

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      activeChat: null,

      getChats: () => {
        const state = get();
        return Array.isArray(state.chats) ? state.chats : [];
      },

      createChat: (title, userId, initialMessage) => {
        const chatId = nanoid(10);
        set(state => ({
          currentChatId: chatId,
          chats: Array.isArray(state.chats) ? [
            ...state.chats,
            {
              id: chatId,
              userId,
              title,
              messages: initialMessage
                ? [{
                    id: nanoid(10),
                    role: 'user',
                    content: initialMessage,
                    createdAt: new Date(),
                  }]
                : [],
              isNew: true,
              createdAt: new Date().toISOString(),
              projectType: 'page',
              files: [],
            },
          ] : [],
        }));
        return chatId;
      },

      addMessage: (chatId, message) =>
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: new Date().toISOString(),
                }
              : chat
          ),
        })),

      setCurrentChat: (chatId: string) => set({ currentChatId: chatId }),

      markChatInitialized: chatId =>
        set(state => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, isNew: false } : chat
          ),
        })),

      deleteChat: chatId =>
        set(state => ({
          chats: state.chats.filter(c => c.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        })),

      addChat: (chat) =>
        set((state) => ({
          chats: [...state.chats, { ...chat, projectType: chat.projectType || 'page' }],
          activeChat: chat.id,
        })),

      updateChatProjectType: (chatId, projectType) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  projectType,
                  files:
                    projectType === 'site'
                      ? [
                          {
                            id: nanoid(),
                            path: 'app/page.tsx',
                            content: '',
                            type: 'page',
                            metadata: {
                              title: 'Home Page',
                            },
                          },
                          {
                            id: nanoid(),
                            path: 'app/layout.tsx',
                            content: '',
                            type: 'layout',
                            metadata: {
                              title: 'Root Layout',
                            },
                          },
                        ]
                      : undefined,
                  activeFileId:
                    projectType === 'site'
                      ? chat.files?.[0]?.id
                      : undefined,
                }
              : chat
          ),
        })),

      updateChatFile: (chatId, file) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  files: chat.files?.map((f) =>
                    f.id === file.id ? { ...f, ...file } : f
                  ) || [file],
                }
              : chat
          ),
        })),

      setActiveFile: (chatId, fileId) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  activeFileId: fileId,
                }
              : chat
          ),
        })),
    }),
    {
      name: 'chat-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.chats)) {
          state.chats = [];
        }
      },
    }
  )
);

export default useChatStore;
