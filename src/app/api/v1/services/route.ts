import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const categorySlug = searchParams.get('category_slug');
    const type = searchParams.get('type') as 'main' | 'addon' | null;
    const activeOnly = searchParams.get('active') !== 'false';

    const supabase = createServerClient();

    let query = supabase
      .from('services')
      .select(
        `id, category_id, name, name_i18n, description, desc_i18n,
         service_type, price_min, price_max, unit,
         duration_min, slot_count, warranty_days,
         requires_booking, image_url, sort_order, is_active,
         category:categories(id, name, name_i18n, slug)`,
      )
      .is('deleted_at', null)
      .order('sort_order');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (type) {
      query = query.eq('service_type', type);
    }

    if (categorySlug) {
      // Filter via join
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!cat) {
        return NextResponse.json({ data: [], error: null });
      }
      query = query.eq('category_id', cat.id);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/services]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
