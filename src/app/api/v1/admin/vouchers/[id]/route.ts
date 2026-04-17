import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body = await req.json();
    const { code, name, discount_type, discount_value, min_order_amount, required_member_tier, max_issue, expires_at, status } = body;

    const supabase = createServerClient();

    const updates: Record<string, string | number | null | undefined> = {};
    if (code !== undefined) updates.code = code.toUpperCase();
    if (name !== undefined) updates.name = name;
    if (discount_type !== undefined) updates.discount_type = discount_type;
    if (discount_value !== undefined) updates.discount_value = Number(discount_value);
    if (min_order_amount !== undefined) updates.min_order_amount = Number(min_order_amount);
    if (required_member_tier !== undefined) updates.required_member_tier = required_member_tier || null;
    if (max_issue !== undefined) updates.max_issue = max_issue === '' ? null : Number(max_issue);
    if (expires_at !== undefined) updates.expires_at = expires_at ? new Date(expires_at).toISOString() : null;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from('vouchers')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/vouchers/[id] PATCH]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const supabase = createServerClient();
    const { error } = await supabase
      .from('vouchers')
      .update({ status: 'disabled' })
      .eq('id', params.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/vouchers/[id] DELETE]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
