import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'customer');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('orders')
      .select(
        `id, status, subtotal, discount_amount, total, method, voucher_code, created_at,
         order_items(id, service_name, price, quantity, unit)`,
        { count: 'exact' },
      )
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return NextResponse.json({
      data: data ?? [],
      meta: { total: count ?? 0, page, limit },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[GET /api/v1/orders/mine]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
