'use client';

import { useEffect } from 'react';
// Use next-intl router/pathname so locale is handled automatically
import { useRouter, usePathname } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps protected pages — redirects to /login if not authenticated.
 * Shows skeleton while checking auth state.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // locale-stripped path e.g. "/history"

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // next-intl router handles locale prefix automatically
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoggedIn, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary pt-24 px-4">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="skeleton h-8 w-48 rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
