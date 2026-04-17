import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { getLocale } from 'next-intl/server';
import { AuthHydrator } from '@/components/auth/AuthHydrator';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();
  const locale = await getLocale();

  // Double-check: middleware handles this, but guard at layout level too.
  // Redirect to /login (not home) so users can re-authenticate if session expired.
  if (!user || user.role === 'customer') {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <AuthHydrator />
      {/* Desktop Sidebar */}
      <AdminSidebar userName={user.full_name || user.phone} userRole={user.role} />

      {/* Desktop Topbar — sits to the right of sidebar */}
      <div className="lg:ml-[240px]">
        <AdminTopbar userName={user.full_name || user.phone} />

        {/* Main content */}
        <main className="p-4 lg:p-6 pt-16 lg:pt-0 pb-24 lg:pb-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Mobile Header + Bottom Nav */}
      <AdminMobileNav userRole={user.role} />
    </div>
  );
}
