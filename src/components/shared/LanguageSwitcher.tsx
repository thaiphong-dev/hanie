'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
] as const;

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          aria-label={`Switch to ${lang.label}`}
          className={cn(
            'font-body text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-200',
            locale === lang.code
              ? 'bg-accent text-text-inverse'
              : variant === 'dark'
              ? 'text-text-inverse/50 hover:text-text-inverse'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
