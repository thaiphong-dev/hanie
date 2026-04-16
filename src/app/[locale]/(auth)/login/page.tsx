'use client';

import { useState, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface LoginResponseData {
  access_token: string;
  user: { id: string; phone: string; role: 'admin' | 'staff' | 'customer'; full_name: string };
}

function LoginForm() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const json = (await res.json()) as {
        data: LoginResponseData | null;
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
            name: json.data.user.full_name,
            phone: json.data.user.phone,
            role: json.data.user.role,
          },
          json.data.access_token,
        );
      }

      // Use window.location to force a full browser navigation so the
      // access_token cookie (set by the login API) is sent with the next request.
      // router.push() uses RSC cache and may not re-trigger middleware cookie checks.
      const role = json.data?.user.role;
      const callbackUrl = searchParams.get('callbackUrl');
      const destination = callbackUrl
        ?? (role === 'admin' || role === 'staff'
          ? `/${locale}/admin/dashboard`
          : `/${locale}`);
      window.location.replace(destination);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-bg-primary rounded-3xl border border-border p-8">
        <h1 className="font-display text-2xl text-text-primary mb-8">
          {t('auth.login_title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? t('common.loading') : t('auth.login_btn')}
          </button>
        </form>

        <p className="font-body text-sm text-text-muted text-center mt-6">
          {t('auth.no_account')}{' '}
          <Link href="/register" className="text-accent hover:text-accent-dark transition-colors">
            {t('auth.register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
