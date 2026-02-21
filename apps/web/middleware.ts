import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/callback', '/auth/logout'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === pathname) return true;
    // Allow all /auth/* routes
    if (pathname.startsWith('/auth/')) return true;
    return false;
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public routes don't need auth check
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for auth cookie presence on protected routes
  // The guild-api sets httpOnly cookies — we check for their existence
  // The cookie name may vary; check common JWT cookie names
  const hasAccessToken =
    request.cookies.has('access_token') ||
    request.cookies.has('access_token_cookie') ||
    request.cookies.has('jwt') ||
    request.cookies.has('session');

  const hasRefreshToken =
    request.cookies.has('refresh_token') ||
    request.cookies.has('refresh_token_cookie');

  // If NOT authenticated, block access to protected routes
  if (!hasAccessToken && !hasRefreshToken) {
    // If they are trying to access the root, just let them. The root page handles its own redirect to /auth/login.
    if (pathname === '/') {
        return NextResponse.next();
    }
    
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If AUTHENTICATED, redirect legacy routes to the new roster
  if (pathname === '/' || pathname === '/guilds' || pathname === '/guilds/') {
    return NextResponse.redirect(new URL('/roster', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
