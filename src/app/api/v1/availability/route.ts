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

// Returns occupied slot-hours for a given date (from booked appointments)
function getOccupiedHours(
  bookings: { scheduled_at: string; slot_count: number }[],
  staffId: string | null,
  staffBookings: { scheduled_at: string; slot_count: number }[],
): Set<number> {
  const occupied = new Set<number>();
  const source = staffId ? staffBookings : bookings;
  for (const b of source) {
    const start = new Date(b.scheduled_at);
    const startHour = start.getUTCHours();
    for (let i = 0; i < b.slot_count; i++) {
      occupied.add(startHour + i);
    }
  }
  return occupied;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
    const serviceIdsParam = searchParams.get('service_ids'); // comma-separated UUIDs
    const staffIdParam = searchParams.get('staff_id') ?? null;

    if (!dateStr) {
      return NextResponse.json(
        { data: null, error: { code: 'MISSING_DATE', message: 'date is required' } },
        { status: 400 },
      );
    }

    const serviceIds = serviceIdsParam ? serviceIdsParam.split(',').filter(Boolean) : [];
    const supabase = createServerClient();

    // 1. Fetch requested services to compute total slot count
    let totalSlots = 1;
    let isParallelCompatible = false;

    if (serviceIds.length > 0) {
      const { data: svcs, error: svcsErr } = await supabase
        .from('services')
        .select('id, slot_count, service_type')
        .in('id', serviceIds)
        .is('deleted_at', null);

      if (svcsErr) throw new Error(svcsErr.message);

      if (svcs && svcs.length > 0) {
        totalSlots = svcs.reduce((sum, s) => sum + s.slot_count, 0);

        // Parallel only for nail_tay + nail_chan combination (slot_count=1 each in same category)
        // Heuristic: if all services each have slot_count=1 and there are 2 services
        if (svcs.length === 2 && svcs.every((s) => s.slot_count === 1)) {
          isParallelCompatible = true;
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

    // If specific staff requested
    const staffBookings = staffIdParam
      ? dayBookings.filter((b) => b.staff_id === staffIdParam)
      : [];

    // Global occupied hours (for any-staff mode)
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

      // Past hours today are unavailable
      if (dateStr === todayStr && slotHour <= currentHour) {
        return { time, available: false, parallel_available: false };
      }

      // Check if we'd exceed working hours
      if (slotHour + totalSlots > WORK_END_HOUR) {
        return { time, available: false, parallel_available: false };
      }

      let available: boolean;
      let parallelAvailable = false;

      if (staffIdParam) {
        // Check specific staff
        const occupiedHours = getOccupiedHours([], staffIdParam, staffBookings);
        available = true;
        for (let i = 0; i < totalSlots; i++) {
          if (occupiedHours.has(slotHour + i)) {
            available = false;
            break;
          }
        }
      } else {
        // Any-staff mode: need at least 1 free staff for consecutive slots
        available = false;
        for (let i = 0; i < totalSlots; i++) {
          const occupied = hourStaffOccupied[slotHour + i] ?? 0;
          if (staffCount - occupied >= 1) {
            available = true;
          } else {
            available = false;
            break;
          }
        }

        // Parallel: for nail tay+chan, check if 2 staff are free for 1 slot
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
