'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ar';

interface ThemeStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'theme-store',
    }
  )
);

export const useTheme = () => {
  const { resolvedTheme: theme, setTheme } = useNextTheme();
  const { language, setLanguage } = useThemeStore();

  return { theme, setTheme, language, setLanguage };
};
