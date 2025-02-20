'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/admin/sidebar';
import { Navbar } from '@/components/admin/navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Check authentication on mount and route change
  useEffect(() => {
    console.log('Admin Layout - Path:', pathname); // Debug log
    console.log('Admin Layout - Session:', session); // Debug log
    console.log('Admin Layout - Status:', status); // Debug log

    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return;
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      console.log('Admin Layout - Not authenticated, redirecting to login'); // Debug log
      router.replace('/admin/login');
      return;
    }

    // Redirect non-admin users to home
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      console.log('Admin Layout - Not admin, redirecting to home'); // Debug log
      router.replace('/');
      return;
    }
  }, [pathname, router, session, status]);

  // Show login page without admin layout
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151521]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show admin layout only if authenticated as admin
  if (status === 'authenticated' && session?.user?.role === 'admin') {
    return (
      <div className="flex min-h-screen bg-[#151521]">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    );
  }

  // Show loading state for any other case
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#151521]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}
