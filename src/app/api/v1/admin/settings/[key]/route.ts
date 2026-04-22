import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const UpdateSettingSchema = z.object({
  value: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { key: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body: unknown = await req.json();
    const parsed = UpdateSettingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'value is required' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('app_settings')
      .update({ value: parsed.data.value, updated_at: new Date().toISOString() })
      .eq('key', params.key)
      .select('key, value, label, type')
      .single();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Setting not found' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[PATCH /api/v1/admin/settings/[key]]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
