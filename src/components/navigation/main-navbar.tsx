'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { UserMenu } from './user-menu';
import { useSession } from 'next-auth/react';

export function MainNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userFullName = session?.user?.firstName && session?.user?.lastName
    ? `${session.user.firstName} ${session.user.lastName}`
    : session?.user?.email?.split('@')[0] || 'User';

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-[#1F1F1F] flex items-center justify-between px-6 z-50">
      <div className="flex items-center">
        <Link href="/" className="text-lg font-semibold text-white">
          promptaat
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-white hover:bg-zinc-800"
          >
            {mounted ? (
              theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )
            ) : null}
          </Button>
          <LanguageSelector />
        </div>

        {status === 'loading' ? (
          <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
        ) : session?.user ? (
          <UserMenu 
            user={{
              name: userFullName,
              email: session.user.email || '',
              image: session.user.image,
            }} 
          />
        ) : (
          <>
            <Button
              variant="outline"
              className="text-white border-zinc-800 hover:bg-zinc-800 hover:text-white"
              asChild
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            
            <Button
              className="bg-white text-zinc-900 hover:bg-zinc-200"
              asChild
            >
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
