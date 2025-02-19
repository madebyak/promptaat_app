'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';

export function LanguageSelector() {
  const { language, setLanguage } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <Languages className="h-4 w-4" />
    </Button>
  );
}
