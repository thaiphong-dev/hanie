'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type AppSetting = Database['public']['Tables']['app_settings']['Row'];

interface SettingRow extends AppSetting {
  saving?: boolean;
  saved?: boolean;
  error?: string;
  localValue?: string;
}

function formatLabel(label: string, value: string, type: AppSetting['type']): string {
  if (type === 'number') {
    const n = parseInt(value, 10);
    if (!isNaN(n) && label.toLowerCase().includes('vnd') || label.includes('₫') || label.toLowerCase().includes('ngưỡng')) {
      return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
    }
  }
  return value;
}

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings');
      const json = await res.json() as { data: AppSetting[] | null };
      setSettings((json.data ?? []).map((s) => ({ ...s, localValue: s.value })));
    } catch {
      setSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchSettings(); }, [fetchSettings]);

  async function handleSave(key: string) {
    setSettings((prev) =>
      prev.map((s) => s.key === key ? { ...s, saving: true, saved: false, error: undefined } : s),
    );

    const setting = settings.find((s) => s.key === key);
    if (!setting) return;

    try {
      const res = await fetch(`/api/v1/admin/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: setting.localValue ?? setting.value }),
      });
      const json = await res.json() as { data: AppSetting | null; error: { message: string } | null };

      if (!res.ok || json.error) {
        setSettings((prev) =>
          prev.map((s) => s.key === key ? { ...s, saving: false, error: json.error?.message ?? t('settings_error') } : s),
        );
      } else {
        setSettings((prev) =>
          prev.map((s) => s.key === key
            ? { ...s, saving: false, saved: true, value: json.data?.value ?? s.value }
            : s),
        );
        setTimeout(() => {
          setSettings((prev) => prev.map((s) => s.key === key ? { ...s, saved: false } : s));
        }, 2000);
      }
    } catch {
      setSettings((prev) =>
        prev.map((s) => s.key === key ? { ...s, saving: false, error: t('settings_error_connection') } : s),
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Settings size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-text-primary">{t('settings_title')}</h1>
          <p className="font-body text-sm text-text-muted">{t('settings_desc')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => {
          const isDirty = setting.localValue !== setting.value;
          return (
            <div
              key={setting.key}
              className="bg-bg-primary border border-border rounded-2xl p-5"
            >
              <label
                htmlFor={`setting-${setting.key}`}
                className="block font-body text-sm font-medium text-text-primary mb-1"
              >
                {setting.label}
              </label>
              <p className="font-body text-xs text-text-muted mb-3">
                {`key: ${setting.key} · type: ${setting.type}`}
                {setting.type === 'number' && setting.localValue
                  ? ` · ${t('settings_current_value')}: ${formatLabel(setting.label, setting.localValue, setting.type)}`
                  : ''}
              </p>

              <div className="flex gap-2">
                <input
                  id={`setting-${setting.key}`}
                  type={setting.type === 'boolean' ? 'text' : setting.type}
                  value={setting.localValue ?? setting.value}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev.map((s) =>
                        s.key === setting.key ? { ...s, localValue: e.target.value, saved: false } : s,
                      ),
                    )
                  }
                  className={cn(
                    'flex-1 font-body text-sm bg-bg-secondary border rounded-xl px-4 py-2.5',
                    'text-text-primary focus:outline-none focus:border-accent transition-colors',
                    setting.error ? 'border-red-400' : 'border-border',
                  )}
                />
                <button
                  onClick={() => void handleSave(setting.key)}
                  disabled={setting.saving || !isDirty}
                  className={cn(
                    'flex items-center gap-1.5 font-body text-xs font-medium px-4 py-2.5 rounded-xl transition-all',
                    setting.saved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-accent hover:bg-accent/80 text-white disabled:opacity-40',
                  )}
                >
                  {setting.saved ? (
                    <><CheckCircle size={14} /> {t('settings_saved')}</>
                  ) : (
                    <><Save size={14} /> {setting.saving ? '...' : t('settings_save')}</>
                  )}
                </button>
              </div>

              {setting.error && (
                <p className="font-body text-xs text-red-500 mt-1">{setting.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {settings.length === 0 && (
        <div className="text-center py-16">
          <p className="font-body text-text-muted">{t('settings_empty')}</p>
        </div>
      )}
    </div>
  );
}
