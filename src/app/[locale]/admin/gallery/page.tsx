'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface GalleryImage {
  id: string; image_url: string; alt_text: Record<string, string>;
  category: string; sort_order: number; is_active: boolean; created_at: string;
}

const CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'nail', label: 'Nail' },
  { value: 'mi', label: 'Nối mi' },
  { value: 'long_may', label: 'Lông mày' },
  { value: 'goi_dau', label: 'Gội đầu' },
  { value: 'studio', label: 'Studio' },
] as const;

export default function GalleryAdminPage() {
  const t = useTranslations('admin');
  const fileRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'nail' | 'mi' | 'long_may' | 'goi_dau' | 'studio'>('nail');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/gallery');
    const json = await res.json() as { data: GalleryImage[] };
    setImages(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchImages(); }, [fetchImages]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Upload to Supabase Storage via a signed URL approach
      // For now, convert to base64 data URL and store (dev mode)
      // In production: upload to Supabase Storage bucket, get public URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase config missing');
      }

      // Upload to Supabase Storage
      const fileName = `gallery/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/gallery/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed — check Storage bucket permissions');
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/gallery/${fileName}`;

      // Insert into gallery_images
      const res = await fetch('/api/v1/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: publicUrl,
          alt_text: { vi: '', en: '', ko: '' },
          category: uploadCategory,
          sort_order: 0,
        }),
      });

      const json = await res.json() as { error: { message: string } | null };
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Insert failed');

      void fetchImages();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteImage(id: string) {
    setDeletingId(id);
    await fetch(`/api/v1/admin/gallery?id=${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    setDeletingId(null);
    void fetchImages();
  }

  const filtered = filterCat ? images.filter((img) => img.category === filterCat) : images;

  return (
    <div className="space-y-5 max-w-5xl">
      <h2 className="font-display text-xl text-text-primary">{t('gallery_title')}</h2>

      {/* Upload + filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category filter */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={cn(
                'px-3 py-1.5 rounded-xl font-body text-sm whitespace-nowrap border transition-colors',
                filterCat === cat.value
                  ? 'bg-accent border-accent text-bg-dark'
                  : 'border-bg-secondary text-text-secondary hover:bg-bg-secondary',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Upload controls */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as typeof uploadCategory)}
            className="border border-bg-secondary rounded-xl px-3 py-1.5 font-body text-sm bg-white text-text-primary focus:outline-none focus:border-accent"
          >
            {CATEGORIES.slice(1).map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark disabled:opacity-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploading ? t('uploading') : t('upload_image')}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 font-body text-sm">
          <X className="w-4 h-4 shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 bg-white rounded-2xl border border-bg-secondary border-dashed">
          <Upload className="w-10 h-10 text-text-muted" />
          <p className="font-body text-sm text-text-muted">{t('upload_image')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-bg-secondary">
              <Image
                src={img.image_url}
                alt={img.alt_text.vi ?? ''}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Category badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-black/50 text-white font-body text-[10px] capitalize">
                  {img.category}
                </span>
              </div>

              {/* Delete button */}
              <button
                onClick={() => setConfirmDelete(img.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label={t('delete_image')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-xs mx-auto bg-white rounded-2xl z-50 p-5 shadow-2xl space-y-4">
            <h3 className="font-display text-base text-text-primary">{t('confirm_delete_image')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary"
              >
                Huỷ
              </button>
              <button
                onClick={() => void deleteImage(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-body text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === confirmDelete ? 'Đang xoá...' : t('delete_image')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
