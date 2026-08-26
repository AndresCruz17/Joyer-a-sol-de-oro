import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get('cookie') || '';

  const hasSupabaseSession =
    cookieHeader.includes('auth-token') || cookieHeader.includes('sb-');

  const isLoginPage = url.pathname === '/admin/login';
  const isAdminRoute = url.pathname.startsWith('/admin');

  // Si intenta acceder al admin sin sesión -> Redirigir al Login
  if (isAdminRoute && !isLoginPage && !hasSupabaseSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Si ya tiene sesión e intenta ir al Login -> Redirigir al Panel Admin
  if (isLoginPage && hasSupabaseSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};