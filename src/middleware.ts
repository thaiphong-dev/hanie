import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

const intlMiddleware = createIntlMiddleware({
  locales: ['vi', 'en', 'ko'],
  defaultLocale: 'vi',
  localePrefix: 'always',
});

// Routes công khai — không cần auth
const PUBLIC_PATTERNS = [
  /^\/[^/]+$/, // /vi, /en, /ko (home)
  /^\/[^/]+\/(services|gallery|location|booking|login|register)(\/.*)?$/,
];

// Routes chỉ admin/staff
const ADMIN_PATTERNS = [/^\/[^/]+\/admin(\/.*)?$/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // i18n redirect trước
  const intlResponse = intlMiddleware(req);

  // Check public routes
  const isPublic = PUBLIC_PATTERNS.some((p) => p.test(pathname));
  if (isPublic) return intlResponse;

  // Lấy access token từ header hoặc cookie
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies.get('access_token')?.value;

  if (!token) {
    const locale = req.nextUrl.locale ?? 'vi';
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    const locale = req.nextUrl.locale ?? 'vi';
    const loginUrl = new URL(`/${locale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin only routes — customer không được vào
  const isAdminRoute = ADMIN_PATTERNS.some((p) => p.test(pathname));
  if (isAdminRoute && payload.role === 'customer') {
    const locale = req.nextUrl.locale ?? 'vi';
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  // Inject user info vào headers để Route Handlers đọc
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', payload.sub);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-phone', payload.phone);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
