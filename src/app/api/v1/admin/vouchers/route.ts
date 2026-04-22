import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const VoucherSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  name: z.string().min(1),
  name_i18n: z.record(z.string()).default({}),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().positive(),
  min_order_amount: z.number().int().min(0).default(0),
  required_member_tier: z.enum(['new', 'regular', 'vip']).nullable().optional(),
  max_issue: z.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  status: z.enum(['draft', 'active', 'disabled']).default('active'),
});

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');

    let query = supabase
      .from('vouchers')
      .select('id, code, name, name_i18n, discount_type, discount_value, min_order_amount, required_member_tier, total_issued, max_issue, expires_at, status, created_at')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body: unknown = await req.json();

    // Check if this is a "distribute" action
    const bodyObj = body as Record<string, unknown>;
    if (bodyObj.action === 'distribute') {
      const supabase = createServerClient();
      const voucherId = bodyObj.voucher_id as string;
      const distributeType = bodyObj.distribute_to as string;

      // Find qualifying customers
      let query = supabase.from('users').select('id').eq('role', 'customer').eq('is_active', true);

      if (distributeType === 'all') {
        // no additional filter — all active customers
      } else if (distributeType === 'new_only') {
        query = query.eq('member_tier', 'new');
      } else if (distributeType === 'regular_only') {
        query = query.eq('member_tier', 'regular');
      } else if (distributeType === 'regular_plus') {
        query = query.in('member_tier', ['regular', 'vip']);
      } else if (distributeType === 'vip') {
        query = query.eq('member_tier', 'vip');
      } else if (distributeType === 'birthday') {
        const thisMonth = new Date().getMonth() + 1;
        query = query.filter('birthday', 'like', `%-${String(thisMonth).padStart(2, '0')}-%`);
      }

      const { data: customers } = await query;
      if (!customers || customers.length === 0) {
        return NextResponse.json({ data: { distributed: 0 }, error: null });
      }

      // Insert customer_vouchers (ignore duplicates)
      const inserts = customers.map((c) => ({
        voucher_id: voucherId,
        customer_id: c.id,
        status: 'available' as const,
      }));

      const { error: insertErr } = await supabase
        .from('customer_vouchers')
        .upsert(inserts, { onConflict: 'voucher_id,customer_id', ignoreDuplicates: true });

      if (insertErr) throw new Error(insertErr.message);

      // Update total_issued
      await supabase
        .from('vouchers')
        .update({ total_issued: customers.length })
        .eq('id', voucherId);

      return NextResponse.json({ data: { distributed: customers.length }, error: null });
    }

    // Create new voucher
    const parsed = VoucherSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('vouchers')
      .insert({ ...parsed.data, created_by: user!.id })
      .select('id, code, name, status')
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/vouchers POST]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
