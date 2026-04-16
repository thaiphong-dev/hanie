import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') ?? 'pending';

    let query = supabase
      .from('leave_requests')
      .select(`
        id, date, reason, status, review_note, created_at, updated_at,
        staff:users!leave_requests_staff_id_fkey(id, full_name, phone),
        reviewer:users!leave_requests_reviewed_by_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[admin/leave-requests GET]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
