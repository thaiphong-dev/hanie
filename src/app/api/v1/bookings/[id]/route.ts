import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
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

    const supabase = createServerClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id, customer_id, customer_name, customer_phone,
        staff_id, status, booking_type, scheduled_at, end_at,
        slot_count, notes, cancelled_at, cancel_reason, late_cancel,
        created_at, updated_at,
        booking_services (
          id, service_id, service_name, quantity, price, notes
        )
      `)
      .eq('id', params.id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { data: null, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      );
    }

    // Customer can only see own bookings
    if (userRole === 'customer' && booking.customer_id !== userId) {
      return NextResponse.json(
        { data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 },
      );
    }

    return NextResponse.json({ data: booking, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/bookings/[id]]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
