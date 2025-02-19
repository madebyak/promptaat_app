'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { GradientButton } from '@/components/ui/gradient-button';

export function Navbar() {
  const { language } = useTheme();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-black_main">
      <div className="flex h-14 items-center px-6">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-white">Promptaat</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>

          <div className="flex items-center space-x-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image || undefined}
                        alt={session.user?.name || ''}
                      />
                      <AvatarFallback>
                        {session.user?.name
                          ? session.user.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-dark_grey border-mid_grey"
                  align="end"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium text-white">
                          {session.user.name}
                        </p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-light_grey">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-mid_grey" />
                  <DropdownMenuItem
                    className="text-white focus:bg-mid_grey focus:text-white"
                    asChild
                  >
                    <Link href="/account" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-white focus:bg-mid_grey focus:text-white"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <Link href="/auth/login">
                    {language === 'en' ? 'Sign In' : 'تسجيل الدخول'}
                  </Link>
                </Button>
                <GradientButton
                  size="sm"
                  asChild
                >
                  <Link href="/auth/signup">
                    {language === 'en' ? 'Get Started' : 'ابدأ الآن'}
                  </Link>
                </GradientButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
