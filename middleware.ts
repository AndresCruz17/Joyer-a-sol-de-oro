import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();

  // Detecta si existe la cookie de autenticación que genera Supabase (prefijo sb-)
  const hasSupabaseSession = allCookies.some((cookie) =>
    cookie.name.includes('auth-token') || cookie.name.startsWith('sb-')
  );

  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

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
  matcher: ['/admin/:path*'],
};