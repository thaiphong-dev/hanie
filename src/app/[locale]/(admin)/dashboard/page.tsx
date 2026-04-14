import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('admin');

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl text-text-primary">{t('dashboard')}</h1>
      <p className="font-body mt-2 text-text-secondary">Admin Dashboard — Phase 4</p>
    </div>
  );
}
