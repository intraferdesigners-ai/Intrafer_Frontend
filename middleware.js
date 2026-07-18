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
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // V2: designer subdomain rewrite (public marketing pages)
  const isDesignerSubdomain =
    hostname.startsWith('designers.') ||
    hostname.startsWith('designers-') ||
    url.searchParams.get('site') === 'designers'; // for local testing

  if (isDesignerSubdomain && !pathname.startsWith('/designers')) {
    url.pathname = '/designers' + pathname;
    return NextResponse.rewrite(url);
  }

  // V1: auth/role protection — unchanged
  const token = request.cookies.get('intrafer_token')?.value;
  const role  = request.cookies.get('intrafer_role')?.value;

  for (const [path, requiredRole] of Object.entries(PROTECTED)) {
    if (pathname.startsWith(path)) {
      if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
};
