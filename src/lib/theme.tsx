'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  direction: Direction;
  setDirection: (direction: Direction) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  language: 'en',
  setLanguage: () => {},
  direction: 'ltr',
  setDirection: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [direction, setDirection] = useState<Direction>('ltr');

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setDirection(newLanguage === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <ThemeContext.Provider
      value={{
        language,
        setLanguage: handleLanguageChange,
        direction,
        setDirection,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
