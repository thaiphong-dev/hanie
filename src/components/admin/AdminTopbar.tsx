'use client';

import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { LogOut, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: 'dashboard',
  bookings: 'bookings',
  pos: 'pos',
  customers: 'customers',
  staff: 'staff',
  services: 'services',
  vouchers: 'vouchers',
  reports: 'reports',
  gallery: 'gallery',
};

function getPageName(pathname: string): string {
  const parts = pathname.split('/');
  const adminIdx = parts.indexOf('admin');
  if (adminIdx >= 0 && parts[adminIdx + 1]) {
    return ROUTE_NAME_MAP[parts[adminIdx + 1]!] ?? 'dashboard';
  }
  return 'dashboard';
}

interface AdminTopbarProps {
  userName: string;
}

export function AdminTopbar({ userName }: AdminTopbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const pageName = getPageName(pathname);
  const today = format(new Date(), 'EEEE, dd/MM/yyyy');

  async function handleLogout() {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearUser();
    router.push(`/${locale}/login`);
  }

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-bg-primary border-b border-bg-secondary sticky top-0 z-30">
      {/* Page title + date */}
      <div>
        <h1 className="font-display text-lg text-text-primary capitalize">
          {t(pageName as Parameters<typeof t>[0])}
        </h1>
        <p className="font-body text-xs text-text-muted capitalize">{today}</p>
      </div>

      {/* Avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="font-body text-sm text-bg-dark font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-body text-sm text-text-primary max-w-[120px] truncate">{userName}</span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-bg-secondary z-50 py-1">
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2.5 font-body text-sm text-red-600 hover:bg-red-50 transition-colors',
                )}
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
