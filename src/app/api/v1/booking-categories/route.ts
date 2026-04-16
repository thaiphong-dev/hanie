import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('booking_categories')
      .select('id, name, name_i18n, slug, slot_count, duration_min, parallel_group, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/booking-categories]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
