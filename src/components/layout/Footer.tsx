import Image from 'next/image';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { Phone, MapPin, Clock } from 'lucide-react';

const SERVICE_ANCHORS = ['nail', 'lash', 'brow', 'hair_wash'] as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-bg-dark pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/logo.svg"
              alt="Hanie Studio"
              width={90}
              height={36}
              className="brightness-0 invert opacity-80 mb-4"
            />
            <p className="font-body text-sm text-text-inverse/50 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase text-text-inverse/40 mb-5">
              {t('footer.services')}
            </h4>
            <ul className="space-y-3">
              {SERVICE_ANCHORS.map((key) => (
                <li key={key}>
                  <Link
                    href={`/services#${key}`}
                    className="font-body text-sm text-text-inverse/60 hover:text-text-inverse transition-colors duration-200"
                  >
                    {t(`services.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio info */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase text-text-inverse/40 mb-5">
              {t('footer.info')}
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-2.5 items-start">
                <MapPin size={14} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-body text-sm text-text-inverse/60">
                  {t('footer.address')}
                </span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone size={14} className="text-accent flex-shrink-0" strokeWidth={1.5} />
                <a
                  href={`tel:${t('footer.phone').replace(/\s/g, '')}`}
                  className="font-body text-sm text-text-inverse/60 hover:text-text-inverse transition-colors duration-200"
                >
                  {t('footer.phone')}
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Clock size={14} className="text-accent flex-shrink-0" strokeWidth={1.5} />
                <span className="font-body text-sm text-text-inverse/60">
                  {t('footer.hours')}
                </span>
              </li>
            </ul>
          </div>

          {/* Quick book CTA */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase text-text-inverse/40 mb-5">
              {t('footer.quick_book')}
            </h4>
            <Link
              href="/booking"
              className="inline-block font-body text-xs font-medium tracking-widest uppercase
                bg-accent hover:bg-accent-dark text-text-inverse
                px-5 py-3 rounded-full transition-colors duration-200"
            >
              {t('common.book_now')}
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-text-inverse/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-text-inverse/30">
            © {new Date().getFullYear()} Hanie Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
