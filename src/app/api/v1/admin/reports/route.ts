import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { format, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;

    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));

    const monthStart = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));

    // Revenue by day
    const { data: ordersRaw } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('status', 'paid')
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`);

    const revenueByDay: Array<{ date: string; amount: number }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRevenue = (ordersRaw ?? [])
        .filter((o) => o.created_at.startsWith(dateStr))
        .reduce((s, o) => s + o.total, 0);
      revenueByDay.push({ date: dateStr, amount: dayRevenue });
    }

    // Top services
    const { data: orderItemsRaw } = await supabase
      .from('order_items')
      .select('service_name, price, quantity, orders!inner(status, created_at)')
      .eq('orders.status', 'paid')
      .gte('orders.created_at', `${monthStart}T00:00:00`)
      .lte('orders.created_at', `${monthEnd}T23:59:59`);

    const serviceMap: Record<string, { count: number; revenue: number }> = {};
    for (const item of orderItemsRaw ?? []) {
      const name = item.service_name;
      if (!serviceMap[name]) serviceMap[name] = { count: 0, revenue: 0 };
      serviceMap[name]!.count += item.quantity;
      serviceMap[name]!.revenue += item.price * item.quantity;
    }
    const topServices = Object.entries(serviceMap)
      .map(([service_name, stats]) => ({ service_name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Staff performance
    const { data: staffOrders } = await supabase
      .from('orders')
      .select('staff_id, total, staff:users!orders_staff_id_fkey(id, full_name)')
      .eq('status', 'paid')
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`)
      .not('staff_id', 'is', null);

    const staffMap: Record<string, { staff_name: string; order_count: number; revenue: number }> = {};
    for (const o of staffOrders ?? []) {
      if (!o.staff_id) continue;
      const staffInfo = Array.isArray(o.staff) ? o.staff[0] : o.staff;
      const staffName = (staffInfo as { full_name?: string } | null)?.full_name ?? 'Unknown';
      if (!staffMap[o.staff_id]) staffMap[o.staff_id] = { staff_name: staffName, order_count: 0, revenue: 0 };
      staffMap[o.staff_id]!.order_count += 1;
      staffMap[o.staff_id]!.revenue += o.total;
    }

    // Get commission_pct from staff_profiles
    const staffIds = Object.keys(staffMap);
    const { data: staffProfiles } = staffIds.length
      ? await supabase.from('staff_profiles').select('id, commission_pct').in('id', staffIds)
      : { data: [] };

    const commissionMap: Record<string, number> = {};
    for (const sp of staffProfiles ?? []) {
      commissionMap[sp.id] = sp.commission_pct;
    }

    const staffPerformance = Object.entries(staffMap).map(([staffId, stats]) => ({
      staff_id: staffId,
      staff_name: stats.staff_name,
      order_count: stats.order_count,
      revenue: stats.revenue,
      commission_pct: commissionMap[staffId] ?? 0,
      commission: Math.round(stats.revenue * ((commissionMap[staffId] ?? 0) / 100)),
    }));

    // Customer stats
    const { count: newCustomers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', `${monthStart}T00:00:00`);

    const { count: returningCustomers } = await supabase
      .from('bookings')
      .select('customer_id', { count: 'exact', head: true })
      .gte('scheduled_at', `${monthStart}T00:00:00`)
      .lte('scheduled_at', `${monthEnd}T23:59:59`)
      .not('status', 'in', '("cancelled","no_show")')
      .not('customer_id', 'is', null);

    return NextResponse.json({
      data: {
        revenue_by_day: revenueByDay,
        top_services: topServices,
        staff_performance: staffPerformance,
        customer_stats: {
          new: newCustomers ?? 0,
          returning: returningCustomers ?? 0,
          retention_rate:
            (returningCustomers ?? 0) > 0 && (newCustomers ?? 0) > 0
              ? Math.round(((returningCustomers! - newCustomers!) / returningCustomers!) * 100)
              : 0,
        },
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/reports GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
