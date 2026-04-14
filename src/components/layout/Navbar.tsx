'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { Link, usePathname } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/' as const, label: 'nav.home' },
  { href: '/services' as const, label: 'nav.services' },
  { href: '/gallery' as const, label: 'nav.gallery' },
  { href: '/booking' as const, label: 'nav.booking' },
  { href: '/location' as const, label: 'nav.location' },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-bg-primary/95 backdrop-blur-sm border-b border-border'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="Hanie Studio"
              width={100}
              height={40}
              priority
              className={cn(
                'transition-all duration-300',
                !scrolled && 'brightness-0 invert',
              )}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'font-body text-sm transition-colors duration-200',
                  pathname === href
                    ? 'text-accent border-b border-accent pb-0.5'
                    : scrolled
                    ? 'text-text-primary hover:text-accent'
                    : 'text-text-inverse/90 hover:text-text-inverse',
                )}
              >
                {t(label)}
              </Link>
            ))}
          </nav>

          {/* Right side: language + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant={scrolled ? 'light' : 'dark'} />
            <Link
              href="/booking"
              className="font-body text-sm font-medium tracking-widest uppercase
                bg-accent hover:bg-accent-dark text-text-inverse
                px-5 py-2.5 rounded-full transition-colors duration-200"
            >
              {t('common.book_now')}
            </Link>
          </div>

          {/* Mobile: hamburger → opens drawer */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu
              size={22}
              className={scrolled ? 'text-text-primary' : 'text-text-inverse'}
            />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-bg-dark flex flex-col p-8"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <button
                className="self-end p-1 mb-8"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} className="text-text-inverse" />
              </button>

              <nav className="flex flex-col gap-6 flex-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'font-display text-xl transition-colors',
                      pathname === href
                        ? 'text-accent'
                        : 'text-text-inverse/80 hover:text-text-inverse',
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(label)}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <LanguageSwitcher variant="dark" />
                <Link
                  href="/booking"
                  className="block text-center font-body text-sm font-medium tracking-widest uppercase
                    bg-accent text-text-inverse px-5 py-3 rounded-full"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('common.book_now')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
