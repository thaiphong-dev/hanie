import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users!orders_customer_id_fkey(id, full_name, phone, member_tier),
        staff:users!orders_staff_id_fkey(id, full_name, phone),
        order_items(id, service_id, service_name, price, quantity, unit, note),
        voucher:vouchers(id, code, discount_type, discount_value)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Order not found' } }, { status: 404 });

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/orders/[id] GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
