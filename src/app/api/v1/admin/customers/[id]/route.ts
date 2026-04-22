import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();

    const { data: customer, error: cErr } = await supabase
      .from('users')
      .select('id, full_name, phone, member_tier, total_spent, loyalty_points, avatar_url, birthday, notes, created_at')
      .eq('id', params.id)
      .eq('role', 'customer')
      .single();

    if (cErr || !customer) {
      return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Customer not found' } }, { status: 404 });
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, status, scheduled_at, end_at, customer_name, staff_id, slot_count, booking_services(service_name, price)')
      .eq('customer_id', params.id)
      .order('scheduled_at', { ascending: false })
      .limit(20);

    const { data: customerNotes } = await supabase
      .from('customer_notes')
      .select('id, content, created_at, author:users!customer_notes_author_id_fkey(full_name)')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false });

    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', params.id)
      .not('status', 'in', '("cancelled","no_show")');

    return NextResponse.json({
      data: {
        ...customer,
        booking_count: bookingCount ?? 0,
        bookings: bookings ?? [],
        notes_list: customerNotes ?? [],
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/customers/[id]]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
