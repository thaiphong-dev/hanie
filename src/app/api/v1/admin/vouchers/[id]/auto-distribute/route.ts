import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const { searchParams } = req.nextUrl;
    const isPreview = searchParams.get('preview') === 'true';

    const supabase = createServerClient();

    // Preview mode: use preview stored procedure
    if (isPreview) {
      const { data, error } = await supabase.rpc('preview_voucher_distribution', {
        p_voucher_id: params.id,
      });
      if (error) throw new Error(error.message);
      return NextResponse.json({ data, error: null });
    }

    // Get the voucher's rule to determine which distribute function to call
    const { data: rule } = await supabase
      .from('voucher_rules')
      .select('rule_type')
      .eq('voucher_id', params.id)
      .eq('is_active', true)
      .single();

    if (!rule) {
      return NextResponse.json(
        { data: null, error: { code: 'NO_RULE', message: 'Voucher không có rule tự động' } },
        { status: 400 },
      );
    }

    let result: { total_issued: number; total_skipped: number } | null = null;

    if (rule.rule_type === 'birthday_month') {
      const { data, error } = await supabase.rpc('distribute_birthday_vouchers', {});
      if (error) throw new Error(error.message);
      result = data as { total_issued: number; total_skipped: number };
    } else if (rule.rule_type === 'points_gte') {
      const { data, error } = await supabase.rpc('distribute_points_vouchers');
      if (error) throw new Error(error.message);
      result = data as { total_issued: number; total_skipped: number };
    } else {
      // member_tier or total_spent_gte: distribute inline
      const { data: vRule } = await supabase
        .from('voucher_rules')
        .select('rule_type, threshold, tier_value')
        .eq('voucher_id', params.id)
        .single();

      if (!vRule) throw new Error('Rule not found');

      let customers: { id: string }[] = [];

      if (vRule.rule_type === 'member_tier' && vRule.tier_value) {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('member_tier', vRule.tier_value)
          .eq('role', 'customer')
          .eq('is_active', true);
        customers = data ?? [];
      } else if (vRule.rule_type === 'total_spent_gte' && vRule.threshold) {
        const { data } = await supabase
          .from('users')
          .select('id')
          .gte('total_spent', vRule.threshold)
          .eq('role', 'customer')
          .eq('is_active', true);
        customers = data ?? [];
      }

      let distributed = 0;
      let skipped = 0;
      for (const c of customers) {
        const { error: insErr } = await supabase
          .from('customer_vouchers')
          .insert({ voucher_id: params.id, customer_id: c.id, status: 'available' })
          .select('id');
        if (insErr?.code === '23505') skipped++;  // duplicate
        else if (!insErr) distributed++;
      }

      result = { total_issued: distributed, total_skipped: skipped };
    }

    return NextResponse.json({
      data: {
        distributed_count: result?.total_issued ?? 0,
        skipped_count: result?.total_skipped ?? 0,
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[POST /api/v1/admin/vouchers/[id]/auto-distribute]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
