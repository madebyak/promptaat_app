'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';
import { useSession } from 'next-auth/react';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav 
      style={{ 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }} 
      className="fixed top-0 w-full z-50 bg-black/25"
    >
      <div className="container flex h-16 items-center justify-between border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Promptaat"
            width={32}
            height={32}
            className="dark:invert"
          />
          <span className="font-bold text-xl">Promptaat</span>
        </Link>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <UserMenu 
              user={{
                name: `${session.user.firstName} ${session.user.lastName}`,
                email: session.user.email,
                image: session.user.image,
                firstName: session.user.firstName,
                lastName: session.user.lastName
              }} 
            />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
