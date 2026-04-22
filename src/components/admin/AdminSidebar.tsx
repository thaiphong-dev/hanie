'use client';

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
  ImageIcon,
  LogOut,
  Receipt,
  CalendarOff,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/admin/dashboard', roles: ['admin'] },
  { key: 'bookings', icon: CalendarDays, href: '/admin/bookings', roles: ['admin', 'staff'] },
  { key: 'pos', icon: ShoppingBag, href: '/admin/pos', roles: ['admin', 'staff'] },
  { key: 'invoices', icon: Receipt, href: '/admin/invoices', roles: ['admin', 'staff'] },
  { key: 'leave', icon: CalendarOff, href: '/admin/staff/leave', roles: ['staff'] },
  { key: 'customers', icon: Users, href: '/admin/customers', roles: ['admin'] },
  { key: 'staff', icon: UserCheck, href: '/admin/staff', roles: ['admin'] },
  { key: 'services', icon: Scissors, href: '/admin/services', roles: ['admin'] },
  { key: 'vouchers', icon: Ticket, href: '/admin/vouchers', roles: ['admin'] },
  { key: 'reports', icon: BarChart3, href: '/admin/reports', roles: ['admin'] },
  { key: 'gallery', icon: ImageIcon, href: '/admin/gallery', roles: ['admin'] },
  { key: 'settings', icon: Settings, href: '/admin/settings', roles: ['admin'] },
] as const;

interface AdminSidebarProps {
  userName: string;
  userRole: string;
}

export function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();

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
    <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-[240px] bg-bg-dark border-r border-white/10 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <span className="font-display text-sm text-bg-dark font-bold">H</span>
        </div>
        <div>
          <p className="font-display text-sm text-text-inverse tracking-wide">Hanie Studio</p>
          <p className="font-body text-xs text-text-muted capitalize">{userRole}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(({ roles }) => (roles as readonly string[]).includes(userRole)).map(({ key, icon: Icon, href }) => {
          const localHref = `/${locale}${href}`;
          const isActive = pathname === localHref || pathname.startsWith(`${localHref}/`);
          return (
            <Link
              key={key}
              href={href as Parameters<typeof Link>[0]['href']}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-body text-sm',
                isActive
                  ? 'bg-accent text-bg-dark font-medium'
                  : 'text-text-muted hover:text-text-inverse hover:bg-white/10',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t(key as keyof typeof t)}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <div className="px-3 py-2">
          <p className="font-body text-sm text-text-inverse truncate">{userName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors font-body text-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
