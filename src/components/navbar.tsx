'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Sun, Moon, Settings, LogOut, User, ChevronDown, Bookmark } from 'lucide-react';

export function Navbar() {
  const { data: session, status } = useSession();
  const { setTheme, theme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-zinc-800 bg-black/50 backdrop-blur-none transform-none supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-16 items-center px-4">
        <div className="flex w-72 items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">Promptaat</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="mr-6"
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-10 bg-[#262626] border-[#161616] hover:bg-[#262626]/90 hover:border-[#161616] relative"
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={session.user.image || ''} alt={session.user.firstName || ''} />
                    <AvatarFallback>
                      {session.user.firstName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {session.user.firstName} {session.user.lastName}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#262626] border-[#161616] z-[200]">
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/prompts" className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    My Prompts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#161616]" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-[#0051ff] to-[#7100fc] hover:opacity-90"
                asChild
              >
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
