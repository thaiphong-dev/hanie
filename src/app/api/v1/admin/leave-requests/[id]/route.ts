import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const ReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  review_note: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin'); // Only admin can approve/reject

    const body: unknown = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { status, review_note } = parsed.data;

    // Get leave request
    const { data: leave, error: leaveErr } = await supabase
      .from('leave_requests')
      .select('id, staff_id, date, status')
      .eq('id', params.id)
      .single();

    if (leaveErr || !leave) {
      return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Leave request not found' } }, { status: 404 });
    }
    if (leave.status !== 'pending') {
      return NextResponse.json({ data: null, error: { code: 'ALREADY_REVIEWED', message: 'Leave request already reviewed' } }, { status: 409 });
    }

    // Update leave request
    const { error: updateErr } = await supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
        review_note: review_note ?? null,
      })
      .eq('id', params.id);

    if (updateErr) throw new Error(updateErr.message);

    // If approved: update staff_schedules.is_day_off = true
    let affectedBookings: unknown[] = [];
    if (status === 'approved') {
      const { error: schedErr } = await supabase
        .from('staff_schedules')
        .upsert(
          {
            staff_id: leave.staff_id,
            date: leave.date,
            is_day_off: true,
            start_time: '08:00:00',
            end_time: '20:00:00',
          },
          { onConflict: 'staff_id,date' },
        );

      if (schedErr) throw new Error(schedErr.message);

      // Find affected bookings (NOT auto-cancel — return for admin to handle)
      const { data: affected } = await supabase
        .from('bookings')
        .select('id, scheduled_at, customer_name, customer_phone, status')
        .eq('staff_id', leave.staff_id)
        .gte('scheduled_at', `${leave.date}T00:00:00`)
        .lte('scheduled_at', `${leave.date}T23:59:59`)
        .in('status', ['pending', 'confirmed']);

      affectedBookings = affected ?? [];
    }

    return NextResponse.json({
      data: { status, affected_bookings: affectedBookings },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/leave-requests PATCH]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
