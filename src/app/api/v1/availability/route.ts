import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Working hours: 08:00 – 20:00, each slot = 60 minutes
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 20;

interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
  parallel_available: boolean;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
    const bookingCategoryIdsParam = searchParams.get('booking_category_ids'); // comma-separated UUIDs
    const staffIdParam = searchParams.get('staff_id') ?? null;

    if (!dateStr) {
      return NextResponse.json(
        { data: null, error: { code: 'MISSING_DATE', message: 'date is required' } },
        { status: 400 },
      );
    }

    const bookingCategoryIds = bookingCategoryIdsParam
      ? bookingCategoryIdsParam.split(',').filter(Boolean)
      : [];

    const supabase = createServerClient();

    // 1. Fetch booking_categories to compute total slots and parallel compatibility
    let totalSlots = 1;
    let isParallelCompatible = false;

    if (bookingCategoryIds.length > 0) {
      const { data: bcats, error: bcatsErr } = await supabase
        .from('booking_categories')
        .select('id, slot_count, parallel_group')
        .in('id', bookingCategoryIds)
        .eq('is_active', true);

      if (bcatsErr) throw new Error(bcatsErr.message);

      if (bcats && bcats.length > 0) {
        totalSlots = bcats.reduce((sum, bc) => sum + bc.slot_count, 0);

        // Parallel: all selected categories must share the same non-null parallel_group
        if (bcats.length >= 2) {
          const groups = bcats.map((bc) => bc.parallel_group).filter(Boolean);
          if (
            groups.length === bcats.length &&
            groups.every((g) => g === groups[0])
          ) {
            isParallelCompatible = true;
          }
        }
      }
    }

    // 2. Fetch active staff for the date (not on day off)
    const { data: schedules, error: schedErr } = await supabase
      .from('staff_schedules')
      .select('staff_id, is_day_off')
      .eq('date', dateStr)
      .eq('is_day_off', false);

    if (schedErr) {
      // Table may not exist yet in dev — return all slots available
      const slots = generateTimeSlots().map((time) => ({
        time,
        available: true,
        parallel_available: isParallelCompatible,
      }));
      return NextResponse.json({ data: { slots, parallel_available: isParallelCompatible }, error: null });
    }

    const availableStaffIds: string[] = (schedules ?? []).map((s) => s.staff_id);

    // 3. Fetch bookings for the date (pending/confirmed/in_progress)
    const startOfDay = `${dateStr}T00:00:00.000Z`;
    const endOfDay = `${dateStr}T23:59:59.999Z`;

    const { data: bookingsRaw, error: bookErr } = await supabase
      .from('bookings')
      .select('scheduled_at, slot_count, staff_id')
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .in('status', ['pending', 'confirmed', 'in_progress']);

    if (bookErr) throw new Error(bookErr.message);
    const dayBookings = bookingsRaw ?? [];

    // 4. Compute per-slot availability
    const allSlots = generateTimeSlots();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentHour = now.getUTCHours();

    const staffBookings = staffIdParam
      ? dayBookings.filter((b) => b.staff_id === staffIdParam)
      : [];

    // Count how many staff are occupied per hour
    const hourStaffOccupied: Record<number, number> = {};
    for (const b of dayBookings) {
      const startH = new Date(b.scheduled_at).getUTCHours();
      for (let i = 0; i < b.slot_count; i++) {
        const h = startH + i;
        hourStaffOccupied[h] = (hourStaffOccupied[h] ?? 0) + 1;
      }
    }

    const staffCount = staffIdParam ? 1 : Math.max(availableStaffIds.length, 1);

    const slots: TimeSlot[] = allSlots.map((time) => {
      const [hStr] = time.split(':');
      const slotHour = parseInt(hStr, 10);

      // Past hours today
      if (dateStr === todayStr && slotHour <= currentHour) {
        return { time, available: false, parallel_available: false };
      }

      // Would exceed working hours
      if (slotHour + totalSlots > WORK_END_HOUR) {
        return { time, available: false, parallel_available: false };
      }

      let available: boolean;
      let parallelAvailable = false;

      if (staffIdParam) {
        // Check specific staff occupancy
        const occupiedHours = new Set<number>();
        for (const b of staffBookings) {
          const startH = new Date(b.scheduled_at).getUTCHours();
          for (let i = 0; i < b.slot_count; i++) {
            occupiedHours.add(startH + i);
          }
        }
        available = true;
        for (let i = 0; i < totalSlots; i++) {
          if (occupiedHours.has(slotHour + i)) {
            available = false;
            break;
          }
        }
      } else {
        // Any-staff mode: need at least 1 free staff for all consecutive slots
        available = true;
        for (let i = 0; i < totalSlots; i++) {
          const occupied = hourStaffOccupied[slotHour + i] ?? 0;
          if (staffCount - occupied < 1) {
            available = false;
            break;
          }
        }

        // Parallel: need 2 free staff for the single slot
        if (isParallelCompatible) {
          const occupied = hourStaffOccupied[slotHour] ?? 0;
          parallelAvailable = staffCount - occupied >= 2;
        }
      }

      return { time, available, parallel_available: parallelAvailable };
    });

    return NextResponse.json({
      data: { slots, parallel_available: isParallelCompatible },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/availability]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
