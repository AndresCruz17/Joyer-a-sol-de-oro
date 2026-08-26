import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();

  const hasSupabaseSession = allCookies.some((cookie) =>
    cookie.name.includes('auth-token') || cookie.name.startsWith('sb-')
  );

  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !isLoginPage && !hasSupabaseSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && hasSupabaseSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};