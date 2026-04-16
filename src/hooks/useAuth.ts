'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

// Decode JWT payload without verification (client-side only — for reading exp)
function decodeJwtPayload(token: string): { exp?: number; sub?: string } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { exp?: number; sub?: string };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  // Consider expired if less than 60 seconds remaining
  return Date.now() / 1000 >= payload.exp - 60;
}

function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  // Refresh when less than 2 minutes remaining
  return Date.now() / 1000 >= payload.exp - 120;
}

function getUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = sessionStorage.getItem('access_token');
    const role = sessionStorage.getItem('user_role') as AuthUser['role'] | null;
    const full_name = sessionStorage.getItem('user_name') ?? '';
    const phone = sessionStorage.getItem('user_phone') ?? '';
    const id = sessionStorage.getItem('user_id') ?? '';

    if (!token || !role || !id) return null;
    if (isTokenExpired(token)) return null;

    return { id, role, full_name, phone };
  } catch {
    return null;
  }
}

async function silentRefresh(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data: {
        access_token: string;
        user: { id: string; role: AuthUser['role']; full_name: string; phone?: string };
      } | null;
    };

    if (!json.data) return null;

    sessionStorage.setItem('access_token', json.data.access_token);
    sessionStorage.setItem('user_role', json.data.user.role);
    sessionStorage.setItem('user_name', json.data.user.full_name);
    sessionStorage.setItem('user_id', json.data.user.id);

    return {
      id: json.data.user.id,
      role: json.data.user.role,
      full_name: json.data.user.full_name,
      phone: json.data.user.phone ?? '',
    };
  } catch {
    return null;
  }
}

export function useAuth(): AuthState & {
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    isLoading: true,
  });

  useEffect(() => {
    async function init() {
      const stored = getUserFromStorage();

      if (stored) {
        // Check if token is expiring soon and refresh proactively
        const token = sessionStorage.getItem('access_token') ?? '';
        if (isTokenExpiringSoon(token)) {
          const refreshed = await silentRefresh();
          setState({ user: refreshed, isLoggedIn: !!refreshed, isLoading: false });
        } else {
          setState({ user: stored, isLoggedIn: true, isLoading: false });
        }
      } else {
        // Try silent refresh via httpOnly cookie
        const refreshed = await silentRefresh();
        setState({ user: refreshed, isLoggedIn: !!refreshed, isLoading: false });
      }
    }

    void init();
  }, []);

  const login = useCallback((token: string, user: AuthUser) => {
    sessionStorage.setItem('access_token', token);
    sessionStorage.setItem('user_role', user.role);
    sessionStorage.setItem('user_name', user.full_name);
    sessionStorage.setItem('user_id', user.id);
    sessionStorage.setItem('user_phone', user.phone);
    setState({ user, isLoggedIn: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_phone');
    setState({ user: null, isLoggedIn: false, isLoading: false });
    window.location.replace('/');
  }, []);

  return { ...state, login, logout };
}
