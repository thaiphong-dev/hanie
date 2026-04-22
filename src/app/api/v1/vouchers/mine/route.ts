import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    if (!userId) {
      return NextResponse.json(
        { data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    const { searchParams } = req.nextUrl;
    const queryCustomerId = searchParams.get('customer_id');

    // Admin/staff can query any customer's vouchers; customers can only query their own
    let targetCustomerId = userId;
    if (queryCustomerId && (userRole === 'admin' || userRole === 'staff')) {
      targetCustomerId = queryCustomerId;
    }

    const supabase = createServerClient();

    // Fetch customer_vouchers joined with vouchers
    const { data: cvRows, error: cvErr } = await supabase
      .from('customer_vouchers')
      .select('id, status, used_at, created_at, voucher_id')
      .eq('customer_id', targetCustomerId)
      .eq('status', 'available')       // POS only needs available vouchers
      .order('created_at', { ascending: false });

    if (cvErr) throw new Error(cvErr.message);
    if (!cvRows || cvRows.length === 0) {
      return NextResponse.json({ data: [], error: null });
    }

    // Fetch voucher details
    const voucherIds = cvRows.map((cv) => cv.voucher_id);
    const { data: voucherRows, error: vErr } = await supabase
      .from('vouchers')
      .select('id, code, name, name_i18n, discount_type, discount_value, min_order_amount, expires_at')
      .in('id', voucherIds);

    if (vErr) throw new Error(vErr.message);

    const voucherMap = new Map((voucherRows ?? []).map((v) => [v.id, v]));

    const data = cvRows.map((cv) => ({
      id: cv.id,
      status: cv.status,
      used_at: cv.used_at,
      created_at: cv.created_at,
      voucher: voucherMap.get(cv.voucher_id) ?? null,
    }));

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/vouchers/mine]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
