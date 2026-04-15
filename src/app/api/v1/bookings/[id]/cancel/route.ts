import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const CancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    const body: unknown = await req.json().catch(() => ({}));
    const parsed = CancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Fetch existing booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('id, customer_id, status, scheduled_at')
      .eq('id', params.id)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      );
    }

    // Customer can only cancel own bookings
    if (userRole === 'customer' && booking.customer_id !== userId) {
      return NextResponse.json(
        { data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 },
      );
    }

    // Can only cancel pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'CANNOT_CANCEL',
            message: `Cannot cancel booking with status: ${booking.status}`,
          },
        },
        { status: 422 },
      );
    }

    // Detect late cancellation (within 24 hours of scheduled time)
    const scheduledAt = new Date(booking.scheduled_at);
    const now = new Date();
    const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const lateCancellation = hoursUntil < 24;

    const { data: updated, error: updateErr } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: now.toISOString(),
        cancel_reason: parsed.data.reason ?? null,
        late_cancel: lateCancellation,
      })
      .eq('id', params.id)
      .select('id, status')
      .single();

    if (updateErr || !updated) throw new Error(updateErr?.message ?? 'Update failed');

    return NextResponse.json({ data: { booking_id: updated.id, status: updated.status }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[PATCH /api/v1/bookings/[id]/cancel]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
