import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  rules: string[];
  addRule: (rule: string) => void;
  deleteRule: (index: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rules: JSON.parse(localStorage.getItem('rules') || '[]'),
      addRule: (rule) =>
        set((state) => {
      const updatedRules = [...state.rules, rule];
      localStorage.setItem('rules', JSON.stringify(updatedRules));
      return { rules: updatedRules };
    }),
  deleteRule: (index) =>
    set((state) => {
      const updatedRules = state.rules.filter((_, i) => i !== index);
      localStorage.setItem('rules', JSON.stringify(updatedRules));
      return { rules: updatedRules };
    }),
    }),
    {
      name: 'pages-settings-storage',
    }
  ),
); 