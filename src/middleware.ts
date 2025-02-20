import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public paths
  if (
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/'
  ) {
    console.log('Middleware - Skipping public path:', pathname); // Debug log
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('Middleware - Current path:', pathname); // Debug log
  console.log('Middleware - Token:', token); // Debug log

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token) {
      console.log('Middleware - No token found, redirecting to admin login'); // Debug log
      if (pathname.startsWith('/api/admin')) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }

    // Check if user has admin role
    if (token.role !== 'admin') {
      console.log('Middleware - User is not admin, redirecting to home'); // Debug log
      if (pathname.startsWith('/api/admin')) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect account routes
  if (pathname.startsWith('/account')) {
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
