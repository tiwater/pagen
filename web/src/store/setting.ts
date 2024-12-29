import { Rule } from '@/types/rules';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  rules: Rule[];
  addRule: (rule: Rule) => void;
  deleteRule: (id: string) => void;
  updateRule: (rule: Rule) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rules: [],
      addRule: (rule: Rule) =>
        set((state) => {
          const updatedRules = [...state.rules, rule];
          return { rules: updatedRules };
        }),
      deleteRule: (id) =>
        set((state) => {
          const updatedRules = state.rules.filter((r) => r.id !== id);
          return { rules: updatedRules };
        }),
      updateRule: (rule: Rule) =>
        set((state) => {
          const updatedRules = state.rules.map((r) => r.id === rule.id ? rule : r);
          return { rules: updatedRules };
        }),
    }),
    {
      name: 'pages-settings-storage',
    }
  ),
); 