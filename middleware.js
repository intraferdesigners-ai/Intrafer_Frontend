import { NextResponse } from 'next/server';

const PROTECTED = {
  '/user/dashboard':   'user',
  '/vendor/dashboard': 'vendor',
  '/admin/dashboard':  'admin',
};

const ROLE_DASHBOARDS = {
  user:   '/user/dashboard',
  vendor: '/vendor/dashboard',
  admin:  '/admin/dashboard',
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('intrafer_token')?.value;
  const role  = request.cookies.get('intrafer_role')?.value;

  for (const [path, requiredRole] of Object.entries(PROTECTED)) {
    if (pathname.startsWith(path)) {
      if (!token) {
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
  matcher: ['/user/:path*', '/vendor/:path*', '/admin/:path*', '/auth/:path*'],
};
