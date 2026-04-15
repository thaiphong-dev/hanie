import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ChangePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    const body: unknown = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    const { old_password, new_password } = parsed.data;

    const supabase = createServerClient();

    // Fetch current hash
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (fetchErr || !user) throw new Error('User not found');

    const { comparePassword, hashPassword } = await import('@/lib/password');
    const isValid = await comparePassword(old_password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_CREDENTIALS', message: 'Old password is incorrect' } },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(new_password);

    const { error: updateErr } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    if (updateErr) throw new Error(updateErr.message);

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[PATCH /api/v1/users/me/password]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
