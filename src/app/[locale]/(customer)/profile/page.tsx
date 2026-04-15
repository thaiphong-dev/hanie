'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { User, Crown, LogOut } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type UserRow = Database['public']['Tables']['users']['Row'];
type ProfileData = Pick<UserRow, 'id' | 'full_name' | 'phone' | 'avatar_url' | 'member_tier' | 'total_spent'>;

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Name update form
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    // Bootstrap name from auth state while we fetch full profile
    if (user?.full_name) setNameValue(user.full_name);
  }, [user]);

  // Fetch full profile data (tier, total_spent) from a dedicated endpoint
  // Re-use the bookings endpoint isn't ideal — so we'll derive from sessionStorage
  // and show what we have from the JWT. Tier/spent come from auth context only if
  // the backend embeds them. For now, use what's available in sessionStorage.
  useEffect(() => {
    if (!user) return;
    // Build a minimal profile from auth state
    setProfile({
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: null,
      member_tier: 'new', // default — will update if we fetch
      total_spent: 0,
    });

    // Optionally fetch richer profile data
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    fetch('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { data: ProfileData | null } | null) => {
        if (json?.data) {
          setProfile(json.data);
          setNameValue(json.data.full_name);
        }
      })
      .catch(() => {
        // Not critical — profile already bootstrapped from auth state
      });
  }, [user]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameValue.trim()) return;
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    setNameSaving(true);
    setNameError('');
    setNameSuccess(false);

    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: nameValue.trim() }),
      });
      const json = (await res.json()) as { data: ProfileData | null; error: { message: string } | null };
      if (!res.ok || json.error) {
        setNameError(json.error?.message ?? t('common.error'));
      } else {
        setNameSuccess(true);
        if (json.data) {
          setProfile(json.data);
          setNameValue(json.data.full_name);
        }
        // Sync sessionStorage so Navbar / useAuth reflects change
        sessionStorage.setItem('user_name', nameValue.trim());
      }
    } catch {
      setNameError(t('common.error'));
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    setPwSaving(true);
    setPwError('');
    setPwSuccess(false);

    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const json = (await res.json()) as { data: unknown; error: { message: string } | null };
      if (!res.ok || json.error) {
        setPwError(json.error?.message ?? t('common.error'));
      } else {
        setPwSuccess(true);
        setOldPassword('');
        setNewPassword('');
      }
    } catch {
      setPwError(t('common.error'));
    } finally {
      setPwSaving(false);
    }
  }

  function handleLogout() {
    if (!confirm(t('profile.logout_confirm'))) return;
    void logout();
  }

  const tierLabel: Record<string, string> = {
    new: t('profile.tier_new'),
    regular: t('profile.tier_regular'),
    vip: t('profile.tier_vip'),
  };

  const displayName = profile?.full_name ?? user?.full_name ?? '';
  const displayPhone = profile?.phone ?? user?.phone ?? '';
  const tier = profile?.member_tier ?? 'new';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="pt-24 pb-8 px-4 bg-bg-secondary">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl text-text-primary mb-6">{t('profile.title')}</h1>

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <User size={28} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-xl text-text-primary">{displayName}</p>
              <p className="font-body text-sm text-text-muted">{displayPhone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Member tier card */}
        {user?.role === 'customer' && (
          <div className="bg-bg-secondary border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown size={16} className="text-accent" />
              <p className="font-body text-sm font-medium text-text-primary uppercase tracking-wider">
                {t('profile.member_tier')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'font-display text-base px-3 py-1 rounded-full',
                  tier === 'vip'
                    ? 'bg-amber-100 text-amber-700'
                    : tier === 'regular'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600',
                )}
              >
                {tierLabel[tier] ?? tier}
              </span>
              <div className="text-right">
                <p className="font-body text-xs text-text-muted">{t('profile.total_spent')}</p>
                <p className="font-display text-base text-accent">
                  {formatPrice(profile?.total_spent ?? 0, locale)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Update name */}
        <section>
          <h2 className="font-display text-lg text-text-primary mb-4">{t('profile.change_name')}</h2>
          <form onSubmit={(e) => void handleSaveName(e)} className="space-y-3">
            <div>
              <label htmlFor="full_name" className="block font-body text-sm text-text-muted mb-1">
                {t('profile.name_label')}
              </label>
              <input
                id="full_name"
                type="text"
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  setNameSuccess(false);
                }}
                className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl
                  px-4 py-3 text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {nameError && <p className="font-body text-xs text-red-500">{nameError}</p>}
            {nameSuccess && <p className="font-body text-xs text-green-600">{t('common.success')}</p>}
            <button
              type="submit"
              disabled={nameSaving || !nameValue.trim()}
              className="font-body text-sm font-medium tracking-widest uppercase
                bg-accent hover:bg-accent-dark disabled:opacity-50
                text-text-inverse px-6 py-3 rounded-full transition-colors"
            >
              {nameSaving ? t('common.loading') : t('profile.save_changes')}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section>
          <h2 className="font-display text-lg text-text-primary mb-4">{t('profile.change_password')}</h2>
          <form onSubmit={(e) => void handleChangePassword(e)} className="space-y-3">
            <div>
              <label htmlFor="old_password" className="block font-body text-sm text-text-muted mb-1">
                {t('profile.old_password')}
              </label>
              <input
                id="old_password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl
                  px-4 py-3 text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="new_password" className="block font-body text-sm text-text-muted mb-1">
                {t('profile.new_password')}
              </label>
              <input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full font-body text-sm bg-bg-secondary border border-border rounded-xl
                  px-4 py-3 text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {pwError && <p className="font-body text-xs text-red-500">{pwError}</p>}
            {pwSuccess && <p className="font-body text-xs text-green-600">{t('common.success')}</p>}
            <button
              type="submit"
              disabled={pwSaving || !oldPassword || !newPassword}
              className="font-body text-sm font-medium tracking-widest uppercase
                bg-accent hover:bg-accent-dark disabled:opacity-50
                text-text-inverse px-6 py-3 rounded-full transition-colors"
            >
              {pwSaving ? t('common.loading') : t('profile.save_changes')}
            </button>
          </form>
        </section>

        {/* Logout */}
        <section className="pt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-body text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            <LogOut size={16} />
            {t('profile.logout')}
          </button>
        </section>
      </div>
    </div>
  );
}
