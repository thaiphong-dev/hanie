import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase/server';
import { GalleryClient } from '@/components/customer/GalleryClient';
import type { Database } from '@/types/database';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'gallery' });
  return {
    title: `${t('page_title')} | Hanie Studio`,
    description: t('hero_subtitle'),
  };
}

export default async function GalleryPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'gallery' });
  
  const supabase = createServerClient();
  
  // Fetch images server-side
  const { data: images, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[GalleryPage] Error fetching images:', error);
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero Header - Server Rendered for SEO/LCP */}
      <div className="pt-32 pb-16 md:pt-48 md:pb-24 px-4 text-center bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 grayscale" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <MotionWrapper>
            <p className="font-body text-xs md:text-sm tracking-[0.3em] uppercase text-accent font-semibold mb-4 animate-fadeUp">
              {t('hero_eyebrow')}
            </p>
            <h1 className="font-display text-4xl md:text-7xl text-text-primary mb-6 leading-tight animate-fadeUp [animation-delay:200ms]">
              {t('hero_title')}
            </h1>
            <p className="font-body text-text-secondary max-w-2xl mx-auto text-sm md:text-lg leading-relaxed animate-fadeUp [animation-delay:400ms]">
              {t('hero_subtitle')}
            </p>
          </MotionWrapper>
        </div>
      </div>

      {/* Interactive Gallery Content */}
      <GalleryClient initialImages={(images as GalleryImage[]) || []} locale={locale} />
    </main>
  );
}

// Simple wrapper to avoid client-side error in server component if we used real motion
function MotionWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
