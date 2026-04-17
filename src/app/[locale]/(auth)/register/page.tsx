'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface RegisterResponseData {
  access_token: string;
  user: { id: string; phone: string; role: 'admin' | 'staff' | 'customer'; full_name: string };
}

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, full_name: fullName }),
      });

      const json = (await res.json()) as {
        data: RegisterResponseData | null;
        error: { code: string } | null;
      };

      if (!res.ok || json.error) {
        const code = json.error?.code ?? 'INTERNAL_ERROR';
        setError(t(`errors.${code}` as Parameters<typeof t>[0]));
        return;
      }

      if (json.data) {
        // Persist full profile to sessionStorage + Zustand store
        setUser(
          {
            id: json.data.user.id,
            full_name: json.data.user.full_name,
            phone: json.data.user.phone,
            role: json.data.user.role,
          },
          json.data.access_token,
        );
      }

      // Use locale-prefixed home path so middleware doesn't redirect
      router.push(`/${locale}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-bg-primary rounded-3xl border border-border p-8">
        <h1 className="font-display text-2xl text-text-primary mb-8">
          {t('auth.register_title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="font-body text-sm text-text-muted block mb-1.5">
              {t('auth.name_label')}
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.name_placeholder')}
              required
              minLength={2}
              className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="phone" className="font-body text-sm text-text-muted block mb-1.5">
              {t('auth.phone_label')}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('auth.phone_placeholder')}
              required
              className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="font-body text-sm text-text-muted block mb-1.5">
              {t('auth.password_label')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password_placeholder')}
              required
              minLength={6}
              className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full font-body text-sm font-medium tracking-widest uppercase py-3.5 rounded-full transition-colors',
              loading
                ? 'bg-bg-secondary text-text-muted cursor-not-allowed'
                : 'bg-accent hover:bg-accent-dark text-text-inverse',
            )}
          >
            {loading ? t('common.loading') : t('auth.register_btn')}
          </button>
        </form>

        <p className="font-body text-sm text-text-muted text-center mt-6">
          {t('auth.have_account')}{' '}
          <Link href="/login" className="text-accent hover:text-accent-dark transition-colors">
            {t('auth.login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
