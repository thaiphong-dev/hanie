import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const AssignSchema = z.object({
  staff_id: z.string().uuid(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const body: unknown = await req.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { staff_id } = parsed.data;

    const { data, error } = await supabase
      .from('bookings')
      .update({ staff_id })
      .eq('id', params.id)
      .select('id, staff_id')
      .single();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } }, { status: 404 });

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/bookings/assign]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
