import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUser, requireRole } from '@/lib/get-current-user';

const FOLDER_MAP: Record<string, string> = {
  nail:     'nails',
  mi:       'eyelash',
  long_may: 'eyebrow',
  goi_dau:  'hairwash',
  studio:   'studio',
};

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    requireRole(user, 'admin', 'staff');

    const formData = await req.formData();
    const file     = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;

    if (!file || !category) {
      return NextResponse.json(
        { data: null, error: { code: 'MISSING_FIELDS', message: 'file and category are required' } },
        { status: 400 },
      );
    }

    const folder   = FOLDER_MAP[category] ?? 'nails';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `gallery/${folder}/${Date.now()}_${safeName}`;

    const supabase    = createServerClient();
    const arrayBuffer = await file.arrayBuffer();

    const { error: storageError } = await supabase.storage
      .from('assets')
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) throw new Error(storageError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    return NextResponse.json({ data: { url: publicUrl }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ data: null, error: { code: 'UNAUTHORIZED', message } }, { status: 401 });
    if (message === 'FORBIDDEN')    return NextResponse.json({ data: null, error: { code: 'FORBIDDEN',    message } }, { status: 403 });
    return NextResponse.json({ data: null, error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
