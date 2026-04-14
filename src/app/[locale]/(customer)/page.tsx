import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4">
      <p className="font-body text-xs font-medium uppercase tracking-widest text-text-secondary">
        {t('hero_eyebrow')}
      </p>
      <h1 className="font-display mt-4 whitespace-pre-line text-center text-4xl font-normal leading-tight text-text-primary">
        {t('hero_title')}
      </h1>
      <p className="font-body mt-4 whitespace-pre-line text-center text-text-secondary">
        {t('hero_sub')}
      </p>
      <Link
        href="/booking"
        className="mt-8 rounded-full bg-accent px-8 py-3 font-body text-sm font-medium uppercase tracking-wider text-text-inverse transition-colors hover:bg-accent-dark"
      >
        {tc('book_now')}
      </Link>
    </div>
  );
}
