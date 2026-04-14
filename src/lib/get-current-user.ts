import { headers } from 'next/headers';
import type { AuthUser } from '@/types/auth';

export function getCurrentUser(): AuthUser | null {
  const headersList = headers();
  const id = headersList.get('x-user-id');
  const role = headersList.get('x-user-role') as AuthUser['role'] | null;
  const phone = headersList.get('x-user-phone');

  if (!id || !role || !phone) return null;

  return { id, role, phone, full_name: '' };
}

export function requireRole(
  user: AuthUser | null,
  ...roles: Array<AuthUser['role']>
): AuthUser {
  if (!user) throw new Error('UNAUTHORIZED');
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}
