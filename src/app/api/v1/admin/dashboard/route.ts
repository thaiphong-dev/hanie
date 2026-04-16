import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { format, subDays } from 'date-fns';

export async function GET() {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const monthStart = format(new Date(), 'yyyy-MM-01');

    // Revenue today (sum of paid orders today)
    const { data: revenueToday } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', `${todayStr}T00:00:00+07:00`)
      .lt('created_at', `${todayStr}T23:59:59+07:00`);

    const { data: revenueYesterday } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'paid')
      .gte('created_at', `${yesterdayStr}T00:00:00+07:00`)
      .lt('created_at', `${yesterdayStr}T23:59:59+07:00`);

    const todayTotal = (revenueToday ?? []).reduce((s, r) => s + r.total, 0);
    const yesterdayTotal = (revenueYesterday ?? []).reduce((s, r) => s + r.total, 0);
    const changePct =
      yesterdayTotal === 0
        ? null
        : Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100);

    // Bookings today
    const { data: bookingsToday } = await supabase
      .from('bookings')
      .select('id, status, scheduled_at, end_at, customer_name, customer_phone, staff_id, slot_count')
      .gte('scheduled_at', `${todayStr}T00:00:00+07:00`)
      .lte('scheduled_at', `${todayStr}T23:59:59+07:00`)
      .not('status', 'in', '("cancelled","no_show")')
      .order('scheduled_at');

    const bookingsPending = (bookingsToday ?? []).filter((b) => b.status === 'pending').length;

    // New customers this month
    const { count: newCustomers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', `${monthStart}T00:00:00+07:00`);

    // Pending leave requests
    const { data: pendingLeaves } = await supabase
      .from('leave_requests')
      .select(`
        id, date, reason, status, created_at,
        staff:users!leave_requests_staff_id_fkey(id, full_name, phone)
      `)
      .eq('status', 'pending')
      .order('created_at');

    return NextResponse.json({
      data: {
        revenue_today: todayTotal,
        revenue_yesterday: yesterdayTotal,
        revenue_change_pct: changePct,
        bookings_today: bookingsToday ?? [],
        bookings_today_count: (bookingsToday ?? []).length,
        bookings_pending: bookingsPending,
        new_customers_month: newCustomers ?? 0,
        pending_leaves: pendingLeaves ?? [],
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    }
    console.error('[admin/dashboard]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
