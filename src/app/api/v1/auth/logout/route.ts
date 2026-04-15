import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      const userId = await verifyRefreshToken(refreshToken);

      if (userId) {
        const supabase = createServerClient();
        // Revoke all refresh tokens for this user (full logout)
        await supabase
          .from('refresh_tokens')
          .update({ revoked: true })
          .eq('user_id', userId)
          .eq('revoked', false);
      }
    }

    const response = NextResponse.json({ data: { success: true }, error: null });
    response.cookies.delete('refresh_token');
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/v1/auth/logout]', message);
    // Always clear cookie even on error
    const response = NextResponse.json({ data: { success: true }, error: null });
    response.cookies.delete('refresh_token');
    return response;
  }
}
