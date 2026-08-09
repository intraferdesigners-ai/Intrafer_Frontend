import { NextResponse } from 'next/server';

const PROTECTED = {
  '/vendor/dashboard': 'vendor',
  '/admin/dashboard':  'admin',
};

const ROLE_DASHBOARDS = {
  vendor: '/vendor/dashboard',
  admin:  '/admin/dashboard',
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
        const url = new URL('/auth/login', request.url);
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

  if (token && role && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const dest = ROLE_DASHBOARDS[role] || '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vendor/:path*', '/admin/:path*', '/auth/:path*'],
};
