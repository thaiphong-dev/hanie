import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateMeSchema = z.object({
  full_name: z.string().min(1).max(100),
});

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, phone, avatar_url, member_tier, total_spent')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/users/me]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}

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
    const parsed = UpdateMeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('users')
      .update({ full_name: parsed.data.full_name })
      .eq('id', userId)
      .select('id, full_name, phone, avatar_url, member_tier, total_spent, birthday')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[PATCH /api/v1/users/me]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
