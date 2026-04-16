import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';
import { z } from 'zod';

const ServiceSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1),
  name_i18n: z.record(z.string()).default({}),
  description: z.string().nullable().optional(),
  desc_i18n: z.record(z.string()).default({}),
  service_type: z.enum(['main', 'addon']).default('main'),
  price_min: z.number().int().min(0),
  price_max: z.number().int().min(0),
  unit: z.enum(['fixed', 'per_nail', 'per_piece', 'per_set']).default('fixed'),
  duration_min: z.number().int().min(1).default(60),
  slot_count: z.number().int().min(1).default(1),
  warranty_days: z.number().int().min(0).default(0),
  requires_booking: z.boolean().default(true),
  commission_pct: z.number().min(0).max(100).default(0),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

const UpdateServiceSchema = ServiceSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const supabase = createServerClient();
    const { searchParams } = req.nextUrl;
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('services')
      .select(`
        id, name, name_i18n, description, desc_i18n, service_type,
        price_min, price_max, unit, duration_min, slot_count,
        warranty_days, requires_booking, commission_pct, sort_order, is_active,
        category_id,
        categories(id, name, slug)
      `)
      .is('deleted_at', null)
      .order('sort_order');

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json({ data: data ?? [], error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const body: unknown = await req.json();
    const parsed = ServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('services')
      .insert(parsed.data)
      .select('id, name, is_active')
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin');

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ data: null, error: { code: 'MISSING_ID', message: 'id required' } }, { status: 400 });

    const body: unknown = await req.json();
    const parsed = UpdateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('services')
      .update(parsed.data)
      .eq('id', id)
      .select('id, name, is_active')
      .single();

    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ data: null, error: { code: 'NOT_FOUND', message: 'Service not found' } }, { status: 404 });
    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ data: null, error: { code: 'FORBIDDEN', message } }, { status: 403 });
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
