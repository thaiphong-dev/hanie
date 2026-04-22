import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const PHONE_REGEX = /^(0[35789])+([0-9]{8})$/;

const RegisterSchema = z.object({
  phone: z.string().regex(PHONE_REGEX, 'INVALID_PHONE'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      const code =
        firstError.message === 'INVALID_PHONE' ? 'INVALID_PHONE' : 'VALIDATION_ERROR';
      return NextResponse.json(
        { data: null, error: { code, message: firstError.message } },
        { status: 400 },
      );
    }

    const { phone, password, full_name } = parsed.data;
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

    // Rate limit: 3 registers per IP per hour
    const ipLimit = await checkRateLimit({
      key: `register:ip:${ip}`,
      maxRequests: 3,
      windowSeconds: 3600,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts' } },
        { status: 429 },
      );
    }

    const supabase = createServerClient();

    // Check phone exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { data: null, error: { code: 'PHONE_ALREADY_EXISTS', message: 'Phone already registered' } },
        { status: 409 },
      );
    }

    const { hashPassword } = await import('@/lib/password');
    const passwordHash = await hashPassword(password);

    const { data: user, error: createErr } = await supabase
      .from('users')
      .insert({
        phone,
        password_hash: passwordHash,
        role: 'customer',
        full_name,
        is_active: true,
      })
      .select('id, phone, role, full_name')
      .single();

    if (createErr) throw new Error(createErr.message);
    if (!user) throw new Error('User not created');

    // Auto-assign new_register vouchers
    void (async () => {
      try {
        const now = new Date().toISOString();
        // Find all active new_register rules whose voucher is still valid
        const { data: rules } = await supabase
          .from('voucher_rules')
          .select('voucher_id, vouchers!inner(id, status, expires_at)')
          .eq('rule_type', 'new_register')
          .eq('is_active', true)
          .eq('vouchers.status', 'active');

        for (const rule of rules ?? []) {
          const v = Array.isArray(rule.vouchers) ? rule.vouchers[0] : rule.vouchers;
          const expired = (v as { expires_at: string | null })?.expires_at
            ? new Date((v as { expires_at: string }).expires_at) < new Date(now)
            : false;
          if (expired) continue;
          await supabase
            .from('customer_vouchers')
            .insert({ voucher_id: rule.voucher_id, customer_id: user.id, status: 'available' })
            .select('id');
          // ignore duplicate errors (23505) — user somehow already has it
        }
      } catch {
        // Non-critical — don't fail registration if voucher assignment fails
      }
    })();

    // Auto-login: issue tokens
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, role: user.role, phone: user.phone, name: user.full_name }),
      signRefreshToken(user.id),
    ]);

    const tokenHash = await hashPassword(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    const response = NextResponse.json(
      {
        data: {
          access_token: accessToken,
          expires_in: 900,
          user: { id: user.id, phone: user.phone, role: user.role, full_name: user.full_name },
        },
        error: null,
      },
      { status: 201 },
    );

    // access_token in cookie so middleware can verify on page navigation
    response.cookies.set('access_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
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
    console.error('[POST /api/v1/auth/register]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
