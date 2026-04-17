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
      .from('users')
      .select(`
        id, full_name, phone, avatar_url, role, is_active,
        staff_profiles(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Staff not found' } }, { status: 404 });

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/staff/[id] GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body = await req.json();
    const { full_name, phone, role, specialties, base_salary, commission_pct, color, is_active } = body;

    const supabase = createServerClient();

    // Update User
    const userUpdates: Record<string, string | boolean | undefined> = {};
    if (full_name !== undefined) userUpdates.full_name = full_name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (role !== undefined) userUpdates.role = role;
    if (is_active !== undefined) userUpdates.is_active = is_active;

    if (Object.keys(userUpdates).length > 0) {
      const { error: userErr } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', params.id);
      if (userErr) throw new Error(userErr.message);
    }

    // Update Profile
    const profileUpdates: Record<string, string | number | undefined> = {};
    if (specialties !== undefined) profileUpdates.specialties = specialties;
    if (base_salary !== undefined) profileUpdates.base_salary = base_salary;
    if (commission_pct !== undefined) profileUpdates.commission_pct = commission_pct;
    if (color !== undefined) profileUpdates.color = color;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profErr } = await supabase
        .from('staff_profiles')
        .update(profileUpdates)
        .eq('id', params.id);
      if (profErr) throw new Error(profErr.message);
    }

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/staff/[id] PATCH]', message);
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
      .from('users')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/staff/[id] DELETE]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
