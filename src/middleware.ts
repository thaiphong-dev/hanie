import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

const SUPPORTED_LOCALES = ['vi', 'en', 'ko'] as const;

const intlMiddleware = createIntlMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: 'vi',
  localePrefix: 'always',
});

// ── Page route patterns ──────────────────────────────────────────────────────

// Public page routes — no auth required
const PUBLIC_PAGE_PATTERNS = [
  /^\/[^/]+$/, // home: /vi, /en, /ko
  /^\/[^/]+\/(services|gallery|location|booking|login|register)(\/.*)?$/,
];

// Admin/Staff-only page routes
const ADMIN_PAGE_PATTERNS = [/^\/[^/]+\/admin(\/.*)?$/];

// ── API route patterns ───────────────────────────────────────────────────────

// Public API routes — no auth required
// Theo PLANNING.md: login, register, refresh, availability, services, gallery, staff đều public
const PUBLIC_API_PATTERNS = [
  /^\/api\/v1\/availability(\/.*)?$/,
  /^\/api\/v1\/services(\/.*)?$/,
  /^\/api\/v1\/gallery(\/.*)?$/,
  /^\/api\/v1\/categories(\/.*)?$/,
  /^\/api\/v1\/booking-categories(\/.*)?$/,
  /^\/api\/v1\/staff$/, // public staff listing for booking flow
  /^\/api\/v1\/auth\/login$/,
  /^\/api\/v1\/auth\/register$/,
  /^\/api\/v1\/auth\/refresh$/,
];

// Admin/Staff-only API routes
const ADMIN_API_PATTERNS = [/^\/api\/v1\/admin(\/.*)?$/];

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)/);
  const locale = match?.[1] ?? 'vi';
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? locale : 'vi';
}

function getToken(req: NextRequest): string | undefined {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return req.cookies.get('access_token')?.value;
}

// ── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API routes: handle separately (no intl redirect) ──────────────────────
  if (pathname.startsWith('/api/')) {
    // Public API routes
    if (PUBLIC_API_PATTERNS.some((p) => p.test(pathname))) {
      return NextResponse.next();
    }

    // POST /api/v1/bookings — public for guest booking
    if (pathname === '/api/v1/bookings' && req.method === 'POST') {
      return NextResponse.next();
    }

    // All other API routes require auth
    const token = getToken(req);
    if (!token) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { data: null, error: { code: 'TOKEN_EXPIRED', message: 'Token expired or invalid' } },
        { status: 401 },
      );
    }

    // Admin-only API
    if (ADMIN_API_PATTERNS.some((p) => p.test(pathname)) && payload.role === 'customer') {
      return NextResponse.json(
        { data: null, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 },
      );
    }

    // Inject user headers for Route Handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-phone', payload.phone);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Page routes: run intl middleware first ───────────────────────────────
  const intlResponse = intlMiddleware(req);

  // If intl is redirecting (e.g., adding locale prefix), let it through
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // Public page routes — no auth needed
  if (PUBLIC_PAGE_PATTERNS.some((p) => p.test(pathname))) {
    return intlResponse;
  }

  // Protected routes: verify token
  const token = getToken(req);
  const locale = extractLocale(pathname);

  if (!token) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin page routes — admin/staff only (redirect customer to home)
  if (ADMIN_PAGE_PATTERNS.some((p) => p.test(pathname))) {
    if (payload.role === 'customer') {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }

    // Role-based access within admin: Staff only allowed in bookings, pos, invoices, and leave
    if (payload.role === 'staff') {
      const allowedPatterns = [
        /^\/[^/]+\/admin\/bookings(\/.*)?$/,
        /^\/[^/]+\/admin\/pos(\/.*)?$/,
        /^\/[^/]+\/admin\/invoices(\/.*)?$/,
        /^\/[^/]+\/admin\/staff\/leave(\/.*)?$/,
      ];

      const isAllowed = allowedPatterns.some((p) => p.test(pathname));
      if (!isAllowed) {
        return NextResponse.redirect(new URL(`/${locale}/admin/bookings`, req.url));
      }
    }
  }

  // Auth passed — inject user headers and propagate intl state
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.sub);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-phone', payload.phone);

  // next-intl's requestLocale reads 'x-next-intl-locale' from request headers.
  // When we create a new NextResponse.next() for protected routes, the intlResponse
  // headers are not automatically propagated. Inject the locale directly from the URL.
  requestHeaders.set('x-next-intl-locale', locale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // Propagate locale cookie that intl middleware may have set
  intlResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}

export const config = {
  // Matches all routes except Next.js internals and static files
  // API routes are now included (removed 'api' exclusion)
  matcher: ['/((?!_next|_vercel|.*\\..*).*)', '/api/v1/:path*'],
};
