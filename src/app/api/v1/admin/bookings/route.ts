import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { format } from 'date-fns';
import { z } from 'zod';
import { resolveGuestCustomer } from '@/lib/guest-booking';
import { sendNotification, getAdminIds } from '@/lib/notifications';

// ── GET /api/v1/admin/bookings ─────────────────────────────────────────────────
// Modes:
//   ?date=YYYY-MM-DD            → calendar view: single-day fetch (original)
//   ?date_from=&date_to=&...    → list view: range query with search/pagination
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;

    const date = searchParams.get('date');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const staffId = searchParams.get('staff_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0'));

    const selectCols = `
      id, status, booking_type, scheduled_at, end_at, slot_count,
      customer_name, customer_phone, customer_id, staff_id, notes, internal_notes,
      created_at,
      staff:users!bookings_staff_id_fkey(id, full_name, phone),
      customer:users!bookings_customer_id_fkey(id, full_name, phone, member_tier),
      booking_services(id, booking_category_id, service_name, price, quantity)
    `;

    let query = supabase
      .from('bookings')
      .select(selectCols, dateFrom || dateTo ? { count: 'exact' } : undefined);

    if (date) {
      // Calendar mode: single day
      query = query
        .gte('scheduled_at', `${date}T00:00:00+07:00`)
        .lte('scheduled_at', `${date}T23:59:59+07:00`)
        .order('scheduled_at');
    } else {
      // List mode: date range
      const from = dateFrom ?? format(new Date(), 'yyyy-MM-dd');
      const to = dateTo ?? from;
      query = query
        .gte('scheduled_at', `${from}T00:00:00+07:00`)
        .lte('scheduled_at', `${to}T23:59:59+07:00`)
        .order('scheduled_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    if (staffId) query = query.eq('staff_id', staffId);
    if (status && status !== 'all') query = query.eq('status', status);
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    // Staff can only see their own bookings
    if (user!.role === 'staff') {
      query = query.eq('staff_id', user!.id);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({
      data: data ?? [],
      total: count ?? undefined,
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/bookings GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

// ── POST /api/v1/admin/bookings (walk-in) ─────────────────────────────────────
const WalkInSchema = z.object({
  customer_phone: z.string().regex(/^(0[35789])[0-9]{8}$/, 'INVALID_PHONE'),
  customer_name: z.string().min(1),
  booking_category_ids: z.array(z.string().uuid()).min(1),
  scheduled_at: z.string().datetime(),
  staff_id: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const body: unknown = await req.json();
    const parsed = WalkInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    const { customer_phone, customer_name, booking_category_ids, scheduled_at, staff_id, notes } = parsed.data;
    const supabase = createServerClient();

    // Resolve or create customer
    const { customerId } = await resolveGuestCustomer(customer_phone, customer_name);

    // Get booking categories for slot calculation
    const { data: bcats, error: bcError } = await supabase
      .from('booking_categories')
      .select('id, slot_count, name')
      .in('id', booking_category_ids)
      .eq('is_active', true);

    if (bcError) throw new Error(bcError.message);
    if (!bcats || bcats.length === 0) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_CATEGORIES', message: 'No valid booking categories found' } },
        { status: 400 },
      );
    }

    const totalSlots = bcats.reduce((s, bc) => s + bc.slot_count, 0);
    const startAt = new Date(scheduled_at);
    const endAt = new Date(startAt.getTime() + totalSlots * 60 * 60 * 1000);

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        customer_name,
        customer_phone,
        staff_id: staff_id ?? null,
        status: 'confirmed',
        booking_type: 'walk_in',
        scheduled_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        slot_count: totalSlots,
        notes: notes ?? null,
        created_by: user!.id,
      })
      .select('id')
      .single();

    if (bookingError) throw new Error(bookingError.message);
    if (!booking) throw new Error('No booking returned');

    // Create booking_services
    const services = bcats.map((bc) => ({
      booking_id: booking.id,
      booking_category_id: bc.id,
      service_id: null,
      service_name: bc.name,
      price: 0,
      quantity: 1,
    }));

    const { error: servicesError } = await supabase.from('booking_services').insert(services);
    if (servicesError) throw new Error(servicesError.message);

    const timeStr = startAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const serviceNames = bcats.map((bc) => bc.name).join(', ');

    // Notify customer về lịch hẹn đã được tạo (walk-in confirmed ngay)
    void sendNotification({
      userIds: customerId,
      type: 'booking_confirmed',
      title: 'Lịch hẹn đã được đặt',
      body: `Lịch ${serviceNames} lúc ${timeStr} đã được xác nhận tại Hanie Studio`,
      data: { booking_id: booking.id },
      url: `/history?booking_id=${booking.id}`,
    });

    // Notify admin & staff về lịch hẹn walk-in mới
    void getAdminIds().then((adminIds) =>
      sendNotification({
        userIds: adminIds,
        type: 'new_booking',
        title: 'Lịch hẹn walk-in mới',
        body: `${customer_name} (${customer_phone}) — ${serviceNames} lúc ${timeStr}`,
        data: { booking_id: booking.id },
        url: `/admin/bookings?booking_id=${booking.id}`,
      }),
    );

    return NextResponse.json({ data: { booking_id: booking.id }, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/bookings POST]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
