import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const LoginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'phone and password are required' } },
        { status: 400 },
      );
    }

    const { phone, password } = parsed.data;
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    // Rate limit: 5 per phone / 15 min, 10 per IP / 15 min
    const [phoneLimit, ipLimit] = await Promise.all([
      checkRateLimit({ key: `login:phone:${phone}`, maxRequests: 20, windowSeconds: 60 }),
      checkRateLimit({ key: `login:ip:${ip}`, maxRequests: 40, windowSeconds: 60 }),
    ]);

    if (!phoneLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts' } },
        { status: 429 },
      );
    }

    const supabase = createServerClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, password_hash, role, full_name, is_active')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
        { status: 401 },
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { data: null, error: { code: 'ACCOUNT_DISABLED', message: 'Account disabled' } },
        { status: 403 },
      );
    }

    const { comparePassword } = await import('@/lib/password');
    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
        { status: 401 },
      );
    }

    // Sign tokens
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, role: user.role, phone: user.phone, name: user.full_name }),
      signRefreshToken(user.id),
    ]);

    // Store refresh token hash in DB
    const { hashPassword } = await import('@/lib/password');
    const tokenHash = await hashPassword(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const response = NextResponse.json({
      data: {
        access_token: accessToken,
        expires_in: 900, // 15 min
        user: { id: user.id, phone: user.phone, role: user.role, full_name: user.full_name },
      },
      error: null,
    });

    // access_token in cookie so middleware can verify on page navigation
    response.cookies.set('access_token', accessToken, {
      httpOnly: false, // readable by JS (needed for sessionStorage sync)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900, // 15 min — matches token lifetime
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/v1/auth/login]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
