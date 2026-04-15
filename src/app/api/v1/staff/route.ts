import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export interface StaffMember {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialties: string[];
  color: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const dateStr = searchParams.get('date'); // YYYY-MM-DD — filter by working day

    const supabase = createServerClient();

    // Fetch staff users (role = 'staff') that are active
    const { data: staffUsers, error: usersErr } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .eq('role', 'staff')
      .eq('is_active', true);

    if (usersErr) throw new Error(usersErr.message);

    const staffIds = (staffUsers ?? []).map((u) => u.id);

    if (staffIds.length === 0) {
      return NextResponse.json({ data: [], error: null });
    }

    // Fetch staff_profiles — id = user id (PK references users.id)
    const { data: profiles, error: profErr } = await supabase
      .from('staff_profiles')
      .select('id, specialties, color')
      .in('id', staffIds);

    if (profErr) throw new Error(profErr.message);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p]),
    );

    // If date filter: exclude staff with is_day_off = true on that date
    let dayOffIds = new Set<string>();
    if (dateStr) {
      const { data: schedules } = await supabase
        .from('staff_schedules')
        .select('staff_id, is_day_off')
        .eq('date', dateStr)
        .eq('is_day_off', true);

      dayOffIds = new Set((schedules ?? []).map((s) => s.staff_id));
    }

    const staffList: StaffMember[] = (staffUsers ?? [])
      .filter((u) => !dayOffIds.has(u.id))
      .map((u) => {
        const profile = profileMap.get(u.id);
        return {
          id: u.id,
          full_name: u.full_name,
          avatar_url: u.avatar_url ?? null,
          specialties: profile?.specialties ?? [],
          color: profile?.color ?? '#C9A882',
        };
      });

    return NextResponse.json({ data: staffList, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/staff]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
