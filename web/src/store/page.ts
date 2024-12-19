import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Page {
  path: string;
  content: string;
  status: 'generating' | 'complete';
  messageId: string;
  metadata: {
    title: string;
    version?: string;
    description?: string;
  };
}

interface PageState {
  // State
  pages: Record<string, Page>;
  activePage: string | null;

  // Actions
  updatePage: (updates: Partial<Page> & Pick<Page, 'messageId'>) => void;
  setActivePage: (messageId: string) => void;
  getPagesByMessageId: (messageId: string) => Page[];
}

export const usePageStore = create<PageState>()(
  persist(
    (set, get) => ({
      // Initial State
      pages: {},
      activePage: null,

      // Synchronous Actions
      getPagesByMessageId: messageId => {
        const state = get();
        return Object.values(state.pages).filter(page => page.messageId === messageId);
      },
      updatePage: updates => {
        set(state => {
          const currentPage = state.pages[updates.messageId];
          const newPage = {
            path: currentPage?.path || '',
            messageId: updates.messageId,
            content: updates.content || currentPage?.content || '',
            status: updates.status || currentPage?.status || 'generating',
            metadata: {
              ...(currentPage?.metadata || {}),
              ...(updates.metadata || {}),
              title: updates.metadata?.title || currentPage?.metadata?.title || 'Generated Page',
            },
          };

          return {
            pages: {
              ...state.pages,
              [updates.messageId]: newPage,
            },
          };
        });
      },
      setActivePage: messageId => {
        set({ activePage: messageId });
      },
    }),
    {
      name: 'page-storage',
    }
  )
);
