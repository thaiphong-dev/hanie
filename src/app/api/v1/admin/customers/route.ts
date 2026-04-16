import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;

    const search = searchParams.get('search') ?? '';
    const tier = searchParams.get('tier') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 30;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(
        'id, full_name, phone, member_tier, total_spent, avatar_url, birthday, created_at',
        { count: 'exact' },
      )
      .eq('role', 'customer')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (tier && tier !== 'all') {
      query = query.eq('member_tier', tier);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    // Get last booking date for each customer (separate query for simplicity)
    const customerIds = (data ?? []).map((c) => c.id);
    const { data: lastBookings } = customerIds.length
      ? await supabase
          .from('bookings')
          .select('customer_id, scheduled_at')
          .in('customer_id', customerIds)
          .not('status', 'in', '("cancelled","no_show")')
          .order('scheduled_at', { ascending: false })
      : { data: [] };

    const lastBookingMap: Record<string, string> = {};
    for (const b of lastBookings ?? []) {
      if (b.customer_id && !lastBookingMap[b.customer_id]) {
        lastBookingMap[b.customer_id] = b.scheduled_at;
      }
    }

    const customers = (data ?? []).map((c) => ({
      ...c,
      last_booking_at: lastBookingMap[c.id] ?? null,
    }));

    return NextResponse.json({
      data: customers,
      meta: { total: count ?? 0, page, limit },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/customers GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
