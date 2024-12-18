import { create } from "zustand";

interface PageStore {
  pages: Record<string, string>;
  getPage: (id: string) => string | undefined;
  setPage: (id: string, code: string) => void;
}

// Server-side store instance
const memoryStore: Record<string, string> = {};

export const usePageStore = create<PageStore>()((set, get) => ({
  pages: memoryStore,
  getPage: (id) => get().pages[id],
  setPage: (id, code) => {
    memoryStore[id] = code; // Update memory store
    set((state) => ({
      pages: { ...memoryStore }, // Use the memory store as source of truth
    }));
  },
}));
