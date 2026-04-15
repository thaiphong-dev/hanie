import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } },
        { status: 401 },
      );
    }

    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } },
        { status: 401 },
      );
    }

    const supabase = createServerClient();

    // Check token is not revoked
    const { data: tokens } = await supabase
      .from('refresh_tokens')
      .select('id, revoked, expires_at')
      .eq('user_id', userId)
      .eq('revoked', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (!tokens || tokens.length === 0) {
      const response = NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Token revoked or expired' } },
        { status: 401 },
      );
      response.cookies.delete('refresh_token');
      return response;
    }

    // Fetch user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, phone, role, full_name, is_active')
      .eq('id', userId)
      .single();

    if (userErr || !user || !user.is_active) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'User not found or disabled' } },
        { status: 401 },
      );
    }

    // Issue new access token + rotate refresh token
    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, role: user.role, phone: user.phone, name: user.full_name }),
      signRefreshToken(user.id),
    ]);

    // Store new refresh token hash
    const { hashPassword } = await import('@/lib/password');
    const tokenHash = await hashPassword(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    const response = NextResponse.json({
      data: {
        access_token: newAccessToken,
        expires_in: 900,
        user: { id: user.id, phone: user.phone, role: user.role, full_name: user.full_name },
      },
      error: null,
    });

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/v1/auth/refresh]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
