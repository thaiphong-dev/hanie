import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';
import { sendNotification } from '@/lib/notifications';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const StatusSchema = z.object({
  status: z.enum(['confirmed', 'in_progress', 'done', 'cancelled', 'no_show']),
  note: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const body: unknown = await req.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      );
    }

    const supabase = createServerClient();
    const { status, note } = parsed.data;

    // Fetch booking để lấy customer_id + scheduled_at cho notification
    const { data: bookingMeta } = await supabase
      .from('bookings')
      .select('customer_id, scheduled_at')
      .eq('id', params.id)
      .single();

    // Staff can only confirm/update bookings assigned to them or unassigned
    if (user!.role === 'staff') {
      const { data: booking } = await supabase
        .from('bookings')
        .select('staff_id')
        .eq('id', params.id)
        .single();

      if (booking && booking.staff_id !== null && booking.staff_id !== user!.id) {
        return NextResponse.json(
          { data: null, error: { code: 'FORBIDDEN', message: 'Bạn không thể thay đổi lịch của nhân viên khác' } },
          { status: 403 },
        );
      }
    }

    const updatePayload: Record<string, unknown> = { status };
    if (note) updatePayload.internal_notes = note;
    if (status === 'cancelled') {
      updatePayload.cancelled_at = new Date().toISOString();
      updatePayload.cancel_reason = note ?? null;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', params.id)
      .select('id, status')
      .single();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } }, { status: 404 });

    // Notify customer khi confirm hoặc cancel (fire-and-forget)
    if (bookingMeta?.customer_id && (status === 'confirmed' || status === 'cancelled')) {
      const timeStr = new Date(bookingMeta.scheduled_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      void sendNotification({
        userIds: bookingMeta.customer_id,
        type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled_by_admin',
        title: status === 'confirmed' ? 'Lịch hẹn đã xác nhận' : 'Lịch hẹn bị hủy',
        body: status === 'confirmed'
          ? `Lịch của bạn lúc ${timeStr} đã được xác nhận`
          : `Lịch của bạn lúc ${timeStr} đã bị hủy${note ? `: ${note}` : ''}`,
        data: { booking_id: params.id },
        url: `/history?booking_id=${params.id}`,
      });
    }

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/bookings/status]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
