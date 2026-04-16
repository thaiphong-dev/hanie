import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';
import { format } from 'date-fns';

const FinalizeSchema = z.object({
  staff_id: z.string().uuid(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body: unknown = await req.json();
    const parsed = FinalizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }, { status: 400 });
    }

    const { staff_id, year, month, note } = parsed.data;
    const supabase = createServerClient();

    // Check not already finalized
    const { data: existing } = await supabase
      .from('monthly_payroll')
      .select('id, finalized')
      .eq('staff_id', staff_id)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existing?.finalized) {
      return NextResponse.json({ data: null, error: { code: 'ALREADY_FINALIZED', message: 'Payroll already finalized' } }, { status: 409 });
    }

    // Get staff profile for salary/commission
    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('base_salary, commission_pct')
      .eq('id', staff_id)
      .single();

    const baseSalary = profile?.base_salary ?? 0;
    const commissionPct = profile?.commission_pct ?? 0;

    // Get month revenue
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd');

    const { data: orders } = await supabase
      .from('orders')
      .select('total')
      .eq('staff_id', staff_id)
      .eq('status', 'paid')
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`);

    const totalBill = (orders ?? []).reduce((s, o) => s + o.total, 0);
    const commissionAmount = Math.round(totalBill * (commissionPct / 100));
    const totalSalary = baseSalary + commissionAmount;

    // Upsert monthly_payroll
    const { data, error } = await supabase
      .from('monthly_payroll')
      .upsert({
        staff_id,
        year,
        month,
        base_salary: baseSalary,
        total_bill: totalBill,
        commission_pct: commissionPct,
        commission_amount: commissionAmount,
        total_salary: totalSalary,
        note: note ?? null,
        finalized: true,
        finalized_at: new Date().toISOString(),
      }, { onConflict: 'staff_id,year,month' })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/payroll POST]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
