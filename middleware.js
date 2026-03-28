import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
        '/channel-selection',

    
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/register',
    '/api/webhooks/instagram',
  ];

  // Define semi-protected routes (need authentication but not token)
  const semiProtectedRoutes = ['/instagram', '/whatsapp-connect'];

  // Define protected routes
  const protectedApiRoutes = [
    '/api/comments',
    '/api/generate-signature',
    '/api/instagram/analytics',
    '/api/instagram/user-details',
    '/api/user/instagram-status',
  ];

  const protectedDashboardRoutes = [
    "/dashboard",
    "/dashboard/auto-dm-comment-link",
    "/dashboard/connect-instagram",
    "/dashboard/connect-instagram/analytics",
    "/dashboard/media-insights",
    "/dashboard/publish-content",
    "/dashboard/connect-channel",
    "/dashboard/contact-list",
    "/dashboard/instagram-automation/connect-instagram",
    "/dashboard/instagram-automation/media-insights",
    "/dashboard/instagram-automation/auto-dm-comment-link",
    "/dashboard/instagram-automation/auto-dm-comment-link/automation",
    "/dashboard/instagram-automation/respond-to-all-your-dm",
    "/dashboard/instagram-automation/respond-to-all-your-dm/automation",
    "/dashboard/instagram-automation/publish-content",
    "/dashboard/whatsapp-automation/info",
    "/dashboard/whatsapp-automation/create-template",
    "/dashboard/whatsapp-automation/manage-template",
    "/dashboard/whatsapp-automation/keyword-automation",
    "/dashboard/whatsapp-automation/business-details",
    "/dashboard/contact-list",
    "/dashboard/whatsapp-automation/automatic-reply",
    "/dashboard/whatsapp-automation/automatic-reply/automation",
    "/dashboard/whatsapp-automation/auto-reply-to-request",
    "/dashboard/whatsapp-automation/auto-reply-to-request/automation",
    "/dashboard/telegram-automation/redirect-your-website",
    "/dashboard/telegram-automation/redirect-your-website/automation",
    "/dashboard/telegram-automation/keyword-to-lead-flow",
    "/dashboard/telegram-automation/keyword-to-lead-flow/automation",
    "/dashboard/telegram-automation/session-reminder-automation",
    "/dashboard/telegram-automation/session-reminder-automation/automation",
  ];

  // Helper function to check if route matches any pattern
  const matchesRoute = (path, routes) =>
    routes.some(route => {
      if (route.includes('[') && route.includes(']')) {
        const pattern = route.replace(/\[.*?\]/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(path);
      }
      return path.startsWith(route);
    });

  // Check if current path is public
  const isPublicRoute = matchesRoute(pathname, publicRoutes);
  const isSemiProtectedRoute = semiProtectedRoutes.includes(pathname);
  const isProtectedApiRoute = matchesRoute(pathname, protectedApiRoutes);
  const isProtectedDashboardRoute = matchesRoute(pathname, protectedDashboardRoutes);

  // 🚫 Block switching between /instagram and /whatsapp-connect
  if (pathname === '/instagram' && request.headers.get('referer')?.includes('/whatsapp-connect')) {
    return NextResponse.redirect(new URL('/whatsapp-connect', request.url));
  }
  if (pathname === '/whatsapp-connect' && request.headers.get('referer')?.includes('/instagram')) {
    return NextResponse.redirect(new URL('/instagram', request.url));
  }

  // If user is not authenticated and trying to access semi-protected routes, redirect to login
  if (!token && isSemiProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent access to /dashboard if user doesn't have any token (Instagram OR WhatsApp)
  if (token && !token.instagramToken && !token.whatsappToken && isProtectedDashboardRoute) {
    return NextResponse.redirect(new URL('/instagram', request.url));
  }

  // If user has Instagram token and is on /instagram page, redirect to dashboard
  if (token?.instagramToken && pathname === '/instagram') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user has WhatsApp token and is on /whatsapp-connect page, redirect to dashboard
  if (token?.whatsappToken && pathname === '/whatsapp-connect') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is authenticated and trying to access login/register/root
  if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    if (token.instagramToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (token.whatsappToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/instagram', request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!token && (isProtectedApiRoute || isProtectedDashboardRoute)) {
    if (isProtectedApiRoute) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};