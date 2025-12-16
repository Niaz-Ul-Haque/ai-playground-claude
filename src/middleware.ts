import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (everything except chat and auth pages)
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/settings',
  '/tasks',
  '/opportunities',
  '/automations',
  '/review',
  '/activity',
  '/import',
  '/integrations',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route, check for session
  if (isProtectedRoute) {
    // Get session from cookie (we'll need to set this)
    const sessionCookie = request.cookies.get('ciri_session');
    
    if (!sessionCookie) {
      // No session found, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      
      // Check if session exists and is not a guest
      if (!session || session.type === 'guest') {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Invalid session cookie, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
