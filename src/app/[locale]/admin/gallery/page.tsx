'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Trash2, X, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CustomSelect } from '@/components/shared/CustomSelect';

interface GalleryImage {
  id: string; image_url: string; alt_text: Record<string, string>;
  category: string; sort_order: number; is_active: boolean; created_at: string;
}

type CategoryValue = 'nail' | 'mi' | 'long_may' | 'goi_dau' | 'studio';

const CATEGORIES = [
  { value: '',          label: 'Tất cả' },
  { value: 'nail',      label: 'Nail' },
  { value: 'mi',        label: 'Nối mi' },
  { value: 'long_may',  label: 'Lông mày' },
  { value: 'goi_dau',   label: 'Gội đầu' },
  { value: 'studio',    label: 'Studio' },
] as const;

// Mapping category → subfolder trong bucket assets/gallery/
const FOLDER_MAP: Record<CategoryValue, string> = {
  nail:     'nails',
  mi:       'eyelash',
  long_may: 'eyebrow',
  goi_dau:  'hairwash',
  studio:   'studio',
};

const EMPTY_FORM = {
  altVi: '', altEn: '', altKo: '',
  category: 'nail' as CategoryValue,
  sortOrder: '0',
};

export default function GalleryAdminPage() {
  const t = useTranslations('admin');
  const fileRef = useRef<HTMLInputElement>(null);

  const [images, setImages]         = useState<GalleryImage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState('');

  // Upload modal state
  const [showModal, setShowModal]   = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalForm, setModalForm]   = useState(EMPTY_FORM);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId]       = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/gallery');
    const json = await res.json() as { data: GalleryImage[] };
    setImages(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchImages(); }, [fetchImages]);

  // Step 1: file selected → show modal immediately with local preview
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(url);
    // Pre-fill category from current filter (if any)
    setModalForm({ ...EMPTY_FORM, category: (filterCat as CategoryValue) || 'nail' });
    setUploadError(null);
    setShowModal(true);

    if (fileRef.current) fileRef.current.value = '';
  }

  function closeModal() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setShowModal(false);
    setPendingFile(null);
    setPreviewUrl(null);
    setModalForm(EMPTY_FORM);
    setUploadError(null);
  }

  // Step 2: submit modal → upload via server API (bypass RLS) → insert to DB
  async function handleModalSubmit() {
    if (!pendingFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Upload qua server-side route — dùng service role key, bypass RLS
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('category', modalForm.category);

      const uploadRes = await fetch('/api/v1/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadJson = await uploadRes.json() as { data: { url: string } | null; error: { message: string } | null };
      if (!uploadRes.ok || uploadJson.error) throw new Error(uploadJson.error?.message ?? 'Upload thất bại');

      const publicUrl = uploadJson.data!.url;

      // Insert into gallery_images
      const res = await fetch('/api/v1/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url:  publicUrl,
          alt_text:   { vi: modalForm.altVi, en: modalForm.altEn, ko: modalForm.altKo },
          category:   modalForm.category,
          sort_order: parseInt(modalForm.sortOrder, 10) || 0,
        }),
      });

      const json = await res.json() as { error: { message: string } | null };
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Lưu thất bại');

      closeModal();
      void fetchImages();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(id: string) {
    setDeletingId(id);
    await fetch(`/api/v1/admin/gallery?id=${id}`, { method: 'DELETE' });
    setConfirmDelete(null);
    setDeletingId(null);
    void fetchImages();
  }

  const filtered = filterCat
    ? images.filter((img) => img.category === filterCat)
    : images;

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-text-primary">{t('gallery_title')}</h2>

      {/* Filter tabs + Upload button */}
      <div className="flex flex-wrap items-center gap-3">
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

        <button
          onClick={() => fileRef.current?.click()}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <ImagePlus className="w-4 h-4" />
          Thêm ảnh
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-bg-secondary rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-48 gap-3 bg-white rounded-2xl border border-bg-secondary border-dashed cursor-pointer hover:bg-bg-secondary/30 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-text-muted" />
          <p className="font-body text-sm text-text-muted">Click để thêm ảnh đầu tiên</p>
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
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-black/50 text-white font-body text-[10px] capitalize">
                  {img.category}
                </span>
              </div>
              {img.sort_order > 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-white font-body text-[10px]">
                    #{img.sort_order}
                  </span>
                </div>
              )}
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

      {/* ── Upload Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={!uploading ? closeModal : undefined}
          />

          {/* Modal card */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-2xl z-50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-display text-base text-text-primary">Thêm ảnh mới</h3>
              {!uploading && (
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-bg-secondary transition-colors">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Preview */}
              {previewUrl && (
                <div className="relative h-48 rounded-xl overflow-hidden bg-bg-secondary">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="480px"
                  />
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 font-body text-sm">
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  {uploadError}
                </div>
              )}

              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Danh mục *
                </label>
                <CustomSelect
                  value={modalForm.category}
                  onChange={(v) => setModalForm((f) => ({ ...f, category: v as CategoryValue }))}
                  options={CATEGORIES.slice(1).map((c) => ({ value: c.value, label: c.label }))}
                />
              </div>

              {/* Alt text — 3 languages */}
              <div className="space-y-2">
                <label className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Mô tả ảnh (alt text)
                </label>
                {[
                  { key: 'altVi', lang: '🇻🇳 Tiếng Việt', placeholder: 'Mẫu nail đẹp...' },
                  { key: 'altEn', lang: '🇬🇧 English',    placeholder: 'Beautiful nail design...' },
                  { key: 'altKo', lang: '🇰🇷 한국어',      placeholder: '예쁜 네일 디자인...' },
                ].map(({ key, lang, placeholder }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-body text-xs text-text-muted w-28 shrink-0">{lang}</span>
                    <input
                      type="text"
                      value={modalForm[key as keyof typeof modalForm]}
                      onChange={(e) => setModalForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-bg-secondary font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                ))}
              </div>

              {/* Sort order */}
              <div className="space-y-1.5">
                <label className="font-body text-xs text-text-muted uppercase tracking-wider">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  min="0"
                  value={modalForm.sortOrder}
                  onChange={(e) => setModalForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  className="w-32 px-3 py-2 rounded-xl border border-border bg-bg-secondary font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <p className="font-body text-[11px] text-text-muted">Số nhỏ hơn hiển thị trước. Mặc định 0.</p>
              </div>

              {/* Storage path preview */}
              <div className="bg-bg-secondary rounded-xl px-3 py-2">
                <p className="font-body text-[11px] text-text-muted">
                  Sẽ lưu vào: <code className="text-accent">assets/gallery/{FOLDER_MAP[modalForm.category]}/</code>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border">
              <button
                onClick={closeModal}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl border border-border font-body text-sm text-text-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={() => void handleModalSubmit()}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Lưu ảnh
                  </>
                )}
              </button>
            </div>
          </div>
        </>
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
