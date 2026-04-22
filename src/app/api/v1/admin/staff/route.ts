import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd');

    // Staff with profiles
    const { data: staffUsers, error } = await supabase
      .from('users')
      .select(`
        id, full_name, phone, avatar_url,
        staff_profiles(specialties, base_salary, commission_pct, color)
      `)
      .eq('role', 'staff')
      .eq('is_active', true)
      .order('full_name');

    if (error) throw new Error(error.message);

    // Monthly revenue per staff (from orders)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('staff_id, total')
      .eq('status', 'paid')
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`)
      .not('staff_id', 'is', null);

    const revenueMap: Record<string, number> = {};
    for (const r of revenueData ?? []) {
      if (r.staff_id) revenueMap[r.staff_id] = (revenueMap[r.staff_id] ?? 0) + r.total;
    }

    // Leave requests for each staff
    const { data: pendingLeaves } = await supabase
      .from('leave_requests')
      .select('id, staff_id, date, reason, status')
      .eq('status', 'pending');

    const leaveMap: Record<string, typeof pendingLeaves> = {};
    for (const l of pendingLeaves ?? []) {
      if (!leaveMap[l.staff_id]) leaveMap[l.staff_id] = [];
      leaveMap[l.staff_id]!.push(l);
    }

    const staffWithStats = (staffUsers ?? []).map((u) => {
      const profile = Array.isArray(u.staff_profiles) ? u.staff_profiles[0] : u.staff_profiles;
      const revenue = revenueMap[u.id] ?? 0;
      const commissionPct = (profile as { commission_pct?: number } | null)?.commission_pct ?? 0;
      const commission = Math.round(revenue * (commissionPct / 100));
      const baseSalary = (profile as { base_salary?: number } | null)?.base_salary ?? 0;
      return {
        id: u.id,
        full_name: u.full_name,
        phone: u.phone,
        avatar_url: u.avatar_url,
        specialties: (profile as { specialties?: string[] } | null)?.specialties ?? [],
        base_salary: baseSalary,
        commission_pct: commissionPct,
        color: (profile as { color?: string } | null)?.color ?? '#C9A882',
        month_revenue: revenue,
        month_commission: commission,
        month_total: baseSalary + commission,
        pending_leaves: leaveMap[u.id] ?? [],
      };
    });

    return NextResponse.json({ data: staffWithStats, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/staff GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body = await req.json();
    const { full_name, phone, role = 'staff', specialties = [], base_salary = 0, commission_pct = 0, color = '#C9A882' } = body;

    if (!full_name || !phone) {
      return NextResponse.json({ data: null, error: { code: 'VALIDATION_ERROR', message: 'Full name and phone are required' } }, { status: 400 });
    }

    const supabase = createServerClient();

    // Generate default password: Hanie@ + last 6 digits of phone
    const { hashPassword } = await import('@/lib/password');
    const digits = phone.replace(/\D/g, '');
    const last6 = digits.slice(-6).padStart(6, '0');
    const defaultPassword = `Hanie@${last6}`;
    const passwordHash = await hashPassword(defaultPassword);

    // 1. Create User
    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert({
        full_name,
        phone,
        role,
        is_active: true,
        password_hash: passwordHash,
      })
      .select('id')
      .single();

    if (userErr) throw new Error(userErr.message);

    // 2. Create Staff Profile
    const { error: profErr } = await supabase
      .from('staff_profiles')
      .insert({
        id: newUser.id,
        specialties,
        base_salary,
        commission_pct,
        color
      });

    if (profErr) throw new Error(profErr.message);

    return NextResponse.json({ data: { id: newUser.id }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/staff POST]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
