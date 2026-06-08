import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

/**
 * /[locale]/admin → redirect to dashboard
 * Fixes BUG-ADMIN-02: navigating to /vi/admin returned 404 instead of redirecting.
 */
export default async function AdminRootPage() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/dashboard`);
}
