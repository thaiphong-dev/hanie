'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'staff' | 'customer';
}

interface AuthStore {
  user: AuthUser | null;
  isLoggedIn: boolean;
  /** Hydrate store from sessionStorage — call once on client mount */
  hydrate: () => void;
  /** Called by login page after successful auth */
  setUser: (user: AuthUser, token: string) => void;
  /** Called by logout action */
  clearUser: () => void;
}

function readFromSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = sessionStorage.getItem('access_token');
    const id = sessionStorage.getItem('user_id');
    const fullName = sessionStorage.getItem('user_full_name') ?? '';
    const phone = sessionStorage.getItem('user_phone') ?? '';
    const role = sessionStorage.getItem('user_role') as AuthUser['role'] | null;
    if (!token || !id || !role) return null;
    // Check expiry without network call
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    if (payload.exp && Date.now() / 1000 >= payload.exp) return null;
    return { id, full_name: fullName, phone, role };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,

  hydrate() {
    const user = readFromSession();
    set({ user, isLoggedIn: !!user });
  },

  setUser(user, token) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('user_id', user.id);
      sessionStorage.setItem('user_full_name', user.full_name);
      sessionStorage.setItem('user_phone', user.phone);
      sessionStorage.setItem('user_role', user.role);
    }
    set({ user, isLoggedIn: true });
  },

  clearUser() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('user_full_name');
      sessionStorage.removeItem('user_phone');
      sessionStorage.removeItem('user_role');
    }
    set({ user: null, isLoggedIn: false });
  },
}));
