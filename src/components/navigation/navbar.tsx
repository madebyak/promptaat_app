'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from './language-selector';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background">
        <div className="flex h-full items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/Promptaat_logo_white.svg"
              alt="Promptaat"
              width={120}
              height={32}
              priority
            />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8" />
            <div className="h-8 w-8" />
            <div className="h-4 w-px bg-border" />
            <div className="h-8 w-20" />
            <div className="h-8 w-20" />
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src={theme === 'light' ? "/Promptaat_logo_black.svg" : "/Promptaat_logo_white.svg"}
            alt="Promptaat"
            width={120}
            height={32}
            priority
          />
        </Link>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <LanguageSelector />
          <div className="h-4 w-px bg-border" />
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              "border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors",
              "border-opacity-20 hover:border-opacity-100"
            )}
          >
            {language === 'en' ? 'Login' : 'تسجيل الدخول'}
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {language === 'en' ? 'Sign up' : 'إنشاء حساب'}
          </Button>
        </div>
      </div>
    </nav>
  );
}
