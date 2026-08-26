export function middleware(request: Request) {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get('cookie') || '';

  // Detecta si existe la cookie de sesión de Supabase
  const hasSupabaseSession =
    cookieHeader.includes('auth-token') || cookieHeader.includes('sb-');

  const isLoginPage = url.pathname === '/admin/login';
  const isAdminRoute = url.pathname.startsWith('/admin');

  // Si intenta acceder al admin sin sesión -> Redirigir al Login
  if (isAdminRoute && !isLoginPage && !hasSupabaseSession) {
    return Response.redirect(new URL('/admin/login', request.url));
  }

  // Si ya tiene sesión e intenta ir al Login -> Redirigir al Panel Admin
  if (isLoginPage && hasSupabaseSession) {
    return Response.redirect(new URL('/admin', request.url));
  }

  return;
}

export const config = {
  matcher: ['/admin/:path*'],
};