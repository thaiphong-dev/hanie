'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Users,
  UserCheck,
  Scissors,
  Ticket,
  BarChart3,
  MoreHorizontal,
  ImageIcon,
  X,
  LogOut,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

const MAIN_NAV = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { key: 'bookings', icon: CalendarDays, href: '/admin/bookings' },
  { key: 'pos', icon: ShoppingBag, href: '/admin/pos' },
  { key: 'invoices', icon: Receipt, href: '/admin/invoices' },
  { key: 'customers', icon: Users, href: '/admin/customers' },
] as const;

const MORE_NAV = [
  { key: 'staff', icon: UserCheck, href: '/admin/staff' },
  { key: 'services', icon: Scissors, href: '/admin/services' },
  { key: 'vouchers', icon: Ticket, href: '/admin/vouchers' },
  { key: 'reports', icon: BarChart3, href: '/admin/reports' },
  { key: 'gallery', icon: ImageIcon, href: '/admin/gallery' },
] as const;

export function AdminMobileNav({ userRole }: { userRole: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const [sheetOpen, setSheetOpen] = useState(false);
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearUser();
    setSheetOpen(false);
    router.push(`/${locale}/login`);
  }

  function isActive(href: string) {
    const localHref = `/${locale}${href}`;
    return pathname === localHref || pathname.startsWith(`${localHref}/`);
  }

  const moreActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-bg-dark flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
            <span className="font-display text-xs text-bg-dark font-bold">H</span>
          </div>
          <span className="font-display text-sm text-text-inverse tracking-wide">Hanie Studio</span>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-bg-dark border-t border-white/10 z-40 safe-area-inset-bottom">
        <div className="flex items-center">
          {MAIN_NAV.filter(({ key }) => {
            if (userRole === 'staff') {
              return key === 'bookings' || key === 'pos' || key === 'invoices';
            }
            return key !== 'customers'; // For admin, dashboard, bookings, pos, invoices are in MAIN_NAV
          }).map(({ key, icon: Icon, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={key}
                href={href as Parameters<typeof Link>[0]['href']}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    active ? 'text-accent' : 'text-text-muted',
                  )}
                />
                <span
                  className={cn(
                    'font-body text-[10px]',
                    active ? 'text-accent' : 'text-text-muted',
                  )}
                >
                  {t(key as Parameters<typeof t>[0])}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          {userRole === 'admin' && (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <MoreHorizontal
                className={cn('w-5 h-5', moreActive ? 'text-accent' : 'text-text-muted')}
              />
              <span
                className={cn(
                  'font-body text-[10px]',
                  moreActive ? 'text-accent' : 'text-text-muted',
                )}
              >
                {t('more')}
              </span>
            </button>
          )}

          {/* Logout button for staff on the bar (since they have no 'More') */}
          {userRole === 'staff' && (
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <LogOut className="w-5 h-5 text-text-muted" />
              <span className="font-body text-[10px] text-text-muted">Đăng xuất</span>
            </button>
          )}
        </div>
      </nav>

      {/* Bottom Sheet for more items */}
      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setSheetOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 bg-bg-primary rounded-t-2xl z-50 p-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-base text-text-primary">Thêm</h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-1 rounded-full hover:bg-bg-secondary transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* For admin, show MORE_NAV + Customers (which was in MAIN_NAV but shifted out) */}
              {[...MORE_NAV, { key: 'customers', icon: Users, href: '/admin/customers' }].map(({ key, icon: Icon, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={key}
                    href={href as Parameters<typeof Link>[0]['href']}
                    onClick={() => setSheetOpen(false)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center',
                        active ? 'bg-accent' : 'bg-bg-secondary',
                      )}
                    >
                      <Icon
                        className={cn('w-5 h-5', active ? 'text-bg-dark' : 'text-text-secondary')}
                      />
                    </div>
                    <span className="font-body text-xs text-text-secondary text-center">
                      {t(key as Parameters<typeof t>[0])}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-bg-secondary pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-body text-sm"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
