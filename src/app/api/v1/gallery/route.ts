import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');

    const supabase = createServerClient();

    let query = supabase
      .from('gallery_images')
      .select('id, image_url, alt_text, category, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq(
        'category',
        category as 'nail' | 'mi' | 'long_may' | 'goi_dau' | 'studio',
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ data: data ?? [], error: null }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/v1/gallery]', message);
    return NextResponse.json(
      { data: null, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 },
    );
  }
}
