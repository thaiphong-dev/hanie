import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── GET /api/v1/admin/bookings/:id ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, status, booking_type, scheduled_at, end_at, slot_count,
        customer_name, customer_phone, customer_id, staff_id, notes, internal_notes,
        created_at,
        staff:users!bookings_staff_id_fkey(id, full_name, phone),
        customer:users!bookings_customer_id_fkey(id, full_name, phone, member_tier),
        booking_services(id, booking_category_id, service_name, price, quantity)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } }, { status: 404 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/bookings/:id GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
