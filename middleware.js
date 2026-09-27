import { NextResponse } from 'next/server';

const PROTECTED = {
  '/vendor/dashboard': 'vendor',
  '/admin/dashboard':  'admin',
};

// Step 14 of the SEO restructuring project: trailing slash is now the
// canonical URL form site-wide (next.config.js's trailingSlash: true).
// Middleware runs at the Edge before Next's own router applies that
// redirect, so a destination built without one here would 307 to the
// non-canonical path and then take a second, avoidable 308 hop to reach
// the real page — this constructs the canonical form directly.
const ROLE_DASHBOARDS = {
  vendor: '/vendor/dashboard/',
  admin:  '/admin/dashboard/',
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('intrafer_token')?.value;
  const role  = request.cookies.get('intrafer_role')?.value;

  for (const [path, requiredRole] of Object.entries(PROTECTED)) {
    if (pathname.startsWith(path)) {
      if (!token || !role) {
        // A token with no role cookie is a desynced/incomplete session (e.g.
        // the role cookie expired or was never re-synced by a silent token
        // refresh) rather than a legitimate "wrong role" — sending it through
        // login forces a clean re-auth instead of silently bouncing an
        // apparently-logged-in user to '/' with no way back into their portal.
        const url = new URL('/auth/login/', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      if (role !== requiredRole) {
        const dest = ROLE_DASHBOARDS[role] || '/';
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return NextResponse.next();
    }
  }

  // Matches both forms: middleware runs before Next's own trailingSlash
  // redirect resolves, so pathname could still be the non-canonical
  // no-slash form here depending on what the client actually requested.
  if (token && role && (
    pathname === '/auth/login' || pathname === '/auth/login/' ||
    pathname === '/auth/register' || pathname === '/auth/register/'
  )) {
    const dest = ROLE_DASHBOARDS[role] || '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vendor/:path*', '/admin/:path*', '/auth/:path*'],
};
