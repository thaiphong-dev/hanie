'use client';

import { Home, CalendarCheck, Clock, Tag, User } from 'lucide-react';
import { Link, usePathname } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TabItem {
  href: '/' | '/booking' | '/history' | '/vouchers' | '/profile';
  labelKey: string;
  icon: React.ElementType;
}

const CUSTOMER_TABS: TabItem[] = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/booking', labelKey: 'nav.booking', icon: CalendarCheck },
  { href: '/history', labelKey: 'nav.history', icon: Clock },
  { href: '/vouchers', labelKey: 'nav.vouchers', icon: Tag },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-14">
        {CUSTOMER_TABS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200',
                isActive ? 'text-accent' : 'text-text-muted',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-body leading-none">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
