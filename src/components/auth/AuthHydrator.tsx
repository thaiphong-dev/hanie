'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
