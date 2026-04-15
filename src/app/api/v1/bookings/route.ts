import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { resolveGuestCustomer } from '@/lib/guest-booking';

const PHONE_REGEX = /^(0[35789])+([0-9]{8})$/;
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 20;

const CreateBookingSchema = z.object({
  service_ids: z.array(z.string().uuid()).min(1),
  scheduled_at: z.string().datetime({ offset: true }),
  staff_id: z.string().uuid().optional(),
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().regex(PHONE_REGEX, 'INVALID_PHONE'),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = CreateBookingSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      const code =
        firstError.message === 'INVALID_PHONE' ? 'INVALID_PHONE' : 'VALIDATION_ERROR';
      return NextResponse.json(
        { data: null, error: { code, message: firstError.message } },
        { status: 400 },
      );
    }

    const { service_ids, scheduled_at, staff_id, customer_name, customer_phone, notes } =
      parsed.data;

    const scheduledDate = new Date(scheduled_at);
    const now = new Date();

    // Must book at least 1 hour in advance
    if (scheduledDate.getTime() - now.getTime() < 60 * 60 * 1000) {
      return NextResponse.json(
        { data: null, error: { code: 'BOOKING_TOO_SOON', message: 'Book at least 1 hour in advance' } },
        { status: 400 },
      );
    }

    // Working hours check (UTC+7)
    const vnHour = (scheduledDate.getUTCHours() + 7) % 24;
    if (vnHour < WORK_START_HOUR || vnHour >= WORK_END_HOUR) {
      return NextResponse.json(
        { data: null, error: { code: 'OUTSIDE_WORKING_HOURS', message: 'Outside working hours' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Fetch services to compute slot count
    const { data: services, error: svcsErr } = await supabase
      .from('services')
      .select('id, name, price_min, slot_count')
      .in('id', service_ids)
      .is('deleted_at', null);

    if (svcsErr) throw new Error(svcsErr.message);
    if (!services || services.length !== service_ids.length) {
      return NextResponse.json(
        { data: null, error: { code: 'INVALID_SERVICE', message: 'One or more services not found' } },
        { status: 400 },
      );
    }

    const totalSlots = services.reduce((sum, s) => sum + s.slot_count, 0);
    const endAt = new Date(scheduledDate.getTime() + totalSlots * 60 * 60 * 1000);

    // Check slot conflict
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .lt('scheduled_at', endAt.toISOString())
      .gt('end_at', scheduled_at)
      .eq('staff_id', staff_id ?? '00000000-0000-0000-0000-000000000000')
      .limit(1);

    if (staff_id && conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { data: null, error: { code: 'BOOKING_CONFLICT', message: 'Time slot already taken' } },
        { status: 409 },
      );
    }

    // Resolve guest customer (find or create)
    const customerId = await resolveGuestCustomer(customer_phone, customer_name);

    // Create booking
    const { data: booking, error: bookErr } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        customer_name,
        customer_phone,
        staff_id: staff_id ?? null,
        status: 'pending',
        booking_type: 'appointment',
        scheduled_at,
        end_at: endAt.toISOString(),
        slot_count: totalSlots,
        notes: notes ?? null,
      })
      .select('id, scheduled_at, customer_name, status')
      .single();

    if (bookErr) throw new Error(bookErr.message);
    if (!booking) throw new Error('No booking returned');

    // Insert booking_services
    const bookingServices = services.map((s) => ({
      booking_id: booking.id,
      service_id: s.id,
      service_name: s.name,
      quantity: 1,
      price: s.price_min,
    }));

    const { error: bsErr } = await supabase.from('booking_services').insert(bookingServices);
    if (bsErr) throw new Error(bsErr.message);

    return NextResponse.json(
      {
        data: {
          booking_id: booking.id,
          scheduled_at: booking.scheduled_at,
          customer_name: booking.customer_name,
          status: booking.status,
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/v1/bookings]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  // Protected — middleware injects x-user-id
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: 'Login required' } },
      { status: 401 },
    );
  }

  try {
    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select(
        `id, status, booking_type, scheduled_at, end_at, slot_count, notes,
         customer_name, customer_phone,
         booking_services(service_name, quantity, price)`,
        { count: 'exact' },
      )
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Customers only see their own bookings
    if (userRole === 'customer') {
      query = query.eq('customer_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({
      data: { bookings: data ?? [], total: count ?? 0, page, limit },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/bookings]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
