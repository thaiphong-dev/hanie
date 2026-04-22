import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const CreateLeaveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  reason: z.string().min(1).max(500),
});

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const queryStaffId = searchParams.get('staff_id');

    // Admin can query any staff's leave requests; staff can only see their own
    const targetStaffId = (user!.role === 'admin' && queryStaffId) ? queryStaffId : user!.id;

    const { data, error } = await supabase
      .from('leave_requests')
      .select('id, date, reason, status, review_note, created_at')
      .eq('staff_id', targetStaffId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[GET /api/v1/staff/leave-requests]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const body: unknown = await req.json();
    const parsed = CreateLeaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
        { status: 400 },
      );
    }

    const { date, reason } = parsed.data;

    // Validate: date must be tomorrow or later
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const requestDate = new Date(date + 'T00:00:00');
    if (requestDate < tomorrow) {
      return NextResponse.json(
        { data: null, error: { code: 'DATE_TOO_SOON', message: 'Ngày nghỉ phải là ngày mai hoặc sau đó' } },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Check for existing pending/approved request on same date
    const { data: existing } = await supabase
      .from('leave_requests')
      .select('id')
      .eq('staff_id', user!.id)
      .eq('date', date)
      .in('status', ['pending', 'approved'])
      .single();

    if (existing) {
      return NextResponse.json(
        { data: null, error: { code: 'DUPLICATE_REQUEST', message: 'Đã có đơn xin nghỉ cho ngày này' } },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        staff_id: user!.id,
        date,
        reason,
        status: 'pending',
      })
      .select('id, date, reason, status, created_at')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    console.error('[POST /api/v1/staff/leave-requests]', message);
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
