import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const OrderItemSchema = z.object({
  service_id: z.string().uuid().nullable().optional(),
  service_name: z.string().min(1),
  price: z.number().int().min(0),
  quantity: z.number().int().min(1).default(1),
  unit: z.enum(['fixed', 'per_nail', 'per_piece', 'per_set']).default('fixed'),
  note: z.string().optional(),
});

const CreateOrderSchema = z.object({
  booking_id: z.string().uuid().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional(),
  staff_id: z.string().uuid().nullable().optional(),
  items: z.array(OrderItemSchema).min(1),
  method: z.enum(['cash', 'transfer', 'card']),
  voucher_code: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const body: unknown = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { booking_id, customer_id, items, method, voucher_code, note } = parsed.data;
    let { staff_id } = parsed.data;

    // Staff assignment logic
    if (user!.role === 'staff') {
      staff_id = user!.id; // Staff can't change themselves
    } else if (user!.role === 'admin') {
      // If admin doesn't provide a staff_id, default to themselves or leave as is if provided
      staff_id = staff_id || user!.id;
    }

    // Calculate subtotal
    const subtotal = items.reduce((s, item) => s + item.price * item.quantity, 0);
    let discountAmount = 0;
    let voucherId: string | null = null;
    let customerVoucherId: string | null = null;

    // Validate + apply voucher
    if (voucher_code && customer_id) {
      // Step 1: find voucher by code
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('id, discount_type, discount_value, min_order_amount, expires_at, status')
        .eq('code', voucher_code)
        .eq('status', 'active')
        .single();

      if (voucher) {
        // Step 2: check customer owns this voucher and it's available
        const { data: cv } = await supabase
          .from('customer_vouchers')
          .select('id, voucher_id, status')
          .eq('customer_id', customer_id)
          .eq('voucher_id', voucher.id)
          .eq('status', 'available')
          .single();

        if (cv) {
          const expired = voucher.expires_at ? new Date(voucher.expires_at) < new Date() : false;
          const meetsMin = subtotal >= (voucher.min_order_amount ?? 0);
          if (!expired && meetsMin) {
            if (voucher.discount_type === 'percent') {
              discountAmount = Math.round(subtotal * (voucher.discount_value / 100));
            } else {
              discountAmount = Math.min(voucher.discount_value, subtotal);
            }
            voucherId = voucher.id;
            customerVoucherId = cv.id; // store specific customer_voucher row id
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        booking_id: booking_id ?? null,
        customer_id: customer_id ?? null,
        staff_id: staff_id ?? null,
        subtotal,
        discount_amount: discountAmount,
        total,
        method,
        voucher_code: voucher_code ?? null,
        voucher_id: voucherId,
        status: 'paid',
        note: note ?? null,
        created_by: user!.id,
      })
      .select('id')
      .single();

    if (orderErr) throw new Error(orderErr.message);
    if (!order) throw new Error('Failed to create order');

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      service_id: item.service_id ?? null,
      service_name: item.service_name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      note: item.note ?? null,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) throw new Error(itemsErr.message);

    // If booking_id: update booking status to 'done'
    if (booking_id) {
      await supabase
        .from('bookings')
        .update({ status: 'done' })
        .eq('id', booking_id);
    }

    // Update customer total_spent + member_tier
    if (customer_id) {
      const { data: cu } = await supabase
        .from('users')
        .select('total_spent')
        .eq('id', customer_id)
        .single();

      const newTotal = (cu?.total_spent ?? 0) + total;
      let newTier: 'new' | 'regular' | 'vip' = 'new';
      if (newTotal >= 5000000) newTier = 'vip';
      else if (newTotal >= 1000000) newTier = 'regular';

      await supabase
        .from('users')
        .update({ total_spent: newTotal, member_tier: newTier })
        .eq('id', customer_id);

      // Mark voucher as used — use exact customer_vouchers.id for precision
      // Note: used_in_payment_id references payments(id) (booking flow), not orders.
      // So we only update status + used_at here; used_in_payment_id stays null.
      if (customerVoucherId) {
        await supabase
          .from('customer_vouchers')
          .update({ status: 'used', used_at: new Date().toISOString() })
          .eq('id', customerVoucherId);
      }

      // Auto-assign order_amount_gte vouchers: find rules where threshold <= order total
      // and voucher is still active/not expired, then gift to customer if not already held
      void (async () => {
        try {
          const now = new Date().toISOString();
          const { data: rules } = await supabase
            .from('voucher_rules')
            .select('voucher_id, threshold, vouchers!inner(id, status, expires_at)')
            .eq('rule_type', 'order_amount_gte')
            .eq('is_active', true)
            .lte('threshold', total)           // rule threshold <= this order's total
            .eq('vouchers.status', 'active');

          for (const rule of rules ?? []) {
            const v = Array.isArray(rule.vouchers) ? rule.vouchers[0] : rule.vouchers;
            const expired = (v as { expires_at: string | null })?.expires_at
              ? new Date((v as { expires_at: string }).expires_at) < new Date(now)
              : false;
            if (expired) continue;
            await supabase
              .from('customer_vouchers')
              .insert({ voucher_id: rule.voucher_id, customer_id, status: 'available' })
              .select('id');
            // 23505 duplicate → customer already has it, skip silently
          }
        } catch {
          // Non-critical — order already created successfully
        }
      })();
    }

    return NextResponse.json({
      data: {
        order_id: order.id,
        subtotal,
        discount_amount: discountAmount,
        total,
        method,
        receipt_data: {
          items: orderItems,
          subtotal,
          discount: discountAmount,
          total,
          payment_method: method,
        },
      },
      error: null,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/orders POST]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const staffId = searchParams.get('staff_id');
    const method = searchParams.get('method');
    const q = searchParams.get('q');

    let query = supabase
      .from('orders')
      .select(
        `id, status, subtotal, discount_amount, total, method, created_at,
         customer:users!orders_customer_id_fkey(id, full_name, phone),
         order_items(id, service_name, price, quantity, unit)`,
        { count: 'exact' },
      );

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    if (staffId) query = query.eq('staff_id', staffId);
    if (method) query = query.eq('method', method);

    // Filter by staff_id if user is staff
    if (user!.role === 'staff') {
      query = query.eq('staff_id', user!.id);
    }
    
    // For search 'q', we can join with users or search by ID
    if (q) {
      // Simple approach: search by ID or customer name (partial)
      // Note: customer is a joined table, filtering on joined table might need more complex syntax in Supabase JS
      // or we can use or() if it's broad.
      query = query.or(`voucher_code.ilike.%${q}%, id.eq.${q.length === 36 ? q : '00000000-0000-0000-0000-000000000000'}`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: data ?? [], meta: { total: count ?? 0, page, limit }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/orders GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
