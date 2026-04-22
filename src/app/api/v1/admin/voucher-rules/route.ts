import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const CreateRuleSchema = z.object({
  voucher_id: z.string().uuid(),
  rule_type: z.enum(['birthday_month', 'points_gte', 'member_tier', 'total_spent_gte', 'manual', 'new_register', 'order_amount_gte']),
  threshold: z.number().int().min(0).nullable().optional(),
  tier_value: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const { searchParams } = req.nextUrl;
    const voucherId = searchParams.get('voucher_id');

    const supabase = createServerClient();
    let query = supabase
      .from('voucher_rules')
      .select('id, voucher_id, rule_type, threshold, tier_value, is_active, created_at')
      .order('created_at', { ascending: false });

    if (voucherId) {
      query = query.eq('voucher_id', voucherId);
    }

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
    const parsed = CreateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    const { voucher_id, rule_type, threshold, tier_value } = parsed.data;

    // Validate rule-type-specific fields
    if ((rule_type === 'points_gte' || rule_type === 'order_amount_gte') && (threshold == null)) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'threshold required for this rule type' } },
        { status: 400 },
      );
    }
    if (rule_type === 'member_tier' && !tier_value) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: 'tier_value required for member_tier rule' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Remove old rules for this voucher (1 rule per voucher)
    await supabase.from('voucher_rules').delete().eq('voucher_id', voucher_id);

    if (rule_type === 'manual') {
      return NextResponse.json({ data: { message: 'Manual rule — no auto-trigger' }, error: null });
    }

    const { data, error } = await supabase
      .from('voucher_rules')
      .insert({
        voucher_id,
        rule_type,
        threshold: threshold ?? null,
        tier_value: tier_value ?? null,
        is_active: true,
      })
      .select('id, voucher_id, rule_type, threshold, tier_value, is_active')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[POST /api/v1/admin/voucher-rules]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
