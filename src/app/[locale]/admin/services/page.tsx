'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X, Pencil, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category { id: string; name: string; slug: string; }
interface Service {
  id: string; name: string; name_i18n: Record<string, string>;
  description: string | null; desc_i18n: Record<string, string>;
  service_type: string; price_min: number; price_max: number; unit: string;
  duration_min: number; slot_count: number; warranty_days: number;
  commission_pct: number; sort_order: number; is_active: boolean;
  category_id: string;
  categories: { name: string; slug: string } | null;
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const EMPTY_FORM = {
  category_id: '', name: '', name_i18n: { en: '', ko: '' },
  description: '', desc_i18n: { en: '', ko: '' },
  service_type: 'main', price_min: 0, price_max: 0,
  unit: 'fixed', duration_min: 60, slot_count: 1,
  warranty_days: 0, requires_booking: true,
  commission_pct: 0, sort_order: 0, is_active: true,
};

export default function ServicesPage() {
  const t = useTranslations('admin');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch('/api/v1/categories').then((r) => r.json()).then((j: { data: Category[] }) => {
      setCategories(j.data ?? []);
      if (j.data?.[0]) setActiveCategory(j.data[0].id);
    });
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const params = activeCategory ? `?category_id=${activeCategory}` : '';
    const res = await fetch(`/api/v1/admin/services${params}`);
    const json = await res.json() as { data: Service[] };
    setServices(json.data ?? []);
    setLoading(false);
  }, [activeCategory]);

  useEffect(() => { if (activeCategory) void fetchServices(); }, [fetchServices, activeCategory]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category_id: activeCategory });
    setSheetOpen(true);
  }

  function openEdit(svc: Service) {
    setEditingId(svc.id);
    setForm({
      category_id: svc.category_id,
      name: svc.name,
      name_i18n: { en: (svc.name_i18n as Record<string, string>)?.en ?? '', ko: (svc.name_i18n as Record<string, string>)?.ko ?? '' },
      description: svc.description ?? '',
      desc_i18n: { en: (svc.desc_i18n as Record<string, string>)?.en ?? '', ko: (svc.desc_i18n as Record<string, string>)?.ko ?? '' },
      service_type: svc.service_type,
      price_min: svc.price_min,
      price_max: svc.price_max,
      unit: svc.unit,
      duration_min: svc.duration_min,
      slot_count: svc.slot_count,
      warranty_days: svc.warranty_days,
      requires_booking: true,
      commission_pct: svc.commission_pct,
      sort_order: svc.sort_order,
      is_active: svc.is_active,
    });
    setSheetOpen(true);
  }

  async function toggleActive(svc: Service) {
    await fetch(`/api/v1/admin/services?id=${svc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !svc.is_active }),
    });
    void fetchServices();
  }

  async function save() {
    setSaving(true);
    const url = editingId ? `/api/v1/admin/services?id=${editingId}` : '/api/v1/admin/services';
    const method = editingId ? 'PATCH' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSheetOpen(false);
    void fetchServices();
  }

  const grouped = services;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">{t('services_title')}</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('add_service')}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-xl font-body text-sm whitespace-nowrap border transition-colors',
              activeCategory === cat.id
                ? 'bg-accent border-accent text-bg-dark'
                : 'border-bg-secondary text-text-secondary hover:bg-bg-secondary',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services table */}
      <div className="bg-white rounded-2xl border border-bg-secondary overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-bg-secondary animate-pulse">
                <div className="flex-1 h-4 bg-bg-secondary rounded" />
                <div className="h-4 w-24 bg-bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex items-center justify-center h-24 font-body text-sm text-text-muted">
            Chưa có dịch vụ nào
          </div>
        ) : (
          <div>
            {grouped.map((svc, i) => (
              <div key={svc.id} className={cn('flex items-center gap-4 px-5 py-3', i < grouped.length - 1 && 'border-b border-bg-secondary')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('font-body text-sm font-medium', svc.is_active ? 'text-text-primary' : 'text-text-muted line-through')}>
                      {svc.name}
                    </p>
                    {!svc.is_active && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-body text-[10px]">Ẩn</span>
                    )}
                  </div>
                  <p className="font-body text-xs text-text-muted">
                    {formatVND(svc.price_min)} – {formatVND(svc.price_max)} · {svc.duration_min} phút · {svc.slot_count} slot
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(svc)}
                    className="p-2 hover:bg-bg-secondary rounded-lg text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => void toggleActive(svc)}
                    className="p-2 hover:bg-bg-secondary rounded-lg text-text-muted hover:text-text-primary transition-colors"
                    title={svc.is_active ? t('service_deactivate') : t('service_activate')}
                  >
                    {svc.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSheetOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-secondary sticky top-0 bg-white">
              <h3 className="font-display text-base text-text-primary">
                {editingId ? 'Chỉnh sửa dịch vụ' : t('add_service')}
              </h3>
              <button onClick={() => setSheetOpen(false)} className="p-1 hover:bg-bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tên VI */}
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_title_vi')} *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                />
              </div>
              {/* Tên EN */}
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_title_en')}</label>
                <input
                  value={form.name_i18n.en ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name_i18n: { ...f.name_i18n, en: e.target.value } }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                />
              </div>
              {/* Tên KO */}
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_title_ko')}</label>
                <input
                  value={form.name_i18n.ko ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name_i18n: { ...f.name_i18n, ko: e.target.value } }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {/* Price range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_price_min')}</label>
                  <input type="number" min={0} value={form.price_min}
                    onChange={(e) => setForm((f) => ({ ...f, price_min: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_price_max')}</label>
                  <input type="number" min={0} value={form.price_max}
                    onChange={(e) => setForm((f) => ({ ...f, price_max: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Duration + Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_duration')}</label>
                  <input type="number" min={1} value={form.duration_min}
                    onChange={(e) => setForm((f) => ({ ...f, duration_min: parseInt(e.target.value) || 60 }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_slot')}</label>
                  <input type="number" min={1} value={form.slot_count}
                    onChange={(e) => setForm((f) => ({ ...f, slot_count: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Commission + Warranty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_commission')}</label>
                  <input type="number" min={0} max={100} value={form.commission_pct}
                    onChange={(e) => setForm((f) => ({ ...f, commission_pct: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_warranty')}</label>
                  <input type="number" min={0} value={form.warranty_days}
                    onChange={(e) => setForm((f) => ({ ...f, warranty_days: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="font-body text-xs text-text-muted block mb-1">{t('service_form_unit')}</label>
                <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-accent bg-white">
                  <option value="fixed">Cố định</option>
                  <option value="per_nail">Mỗi móng</option>
                  <option value="per_piece">Mỗi cái</option>
                  <option value="per_set">Mỗi bộ</option>
                </select>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors cursor-pointer',
                    form.is_active ? 'bg-accent' : 'bg-gray-300',
                  )}
                >
                  <div className={cn('w-4 h-4 bg-white rounded-full mt-1 transition-transform', form.is_active ? 'translate-x-5' : 'translate-x-1')} />
                </div>
                <span className="font-body text-sm text-text-primary">{t('service_form_active')}</span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-bg-secondary px-5 py-4">
              <button
                onClick={() => void save()}
                disabled={saving || !form.name}
                className="w-full py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : t('service_form_save')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
