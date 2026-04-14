import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Gowun_Batang, Noto_Sans } from 'next/font/google';
import '../globals.css';

const gowunBatang = Gowun_Batang({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const notoSans = Noto_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Hanie in Quy Nhon',
    default: 'Hanie in Quy Nhon — Studio Làm Đẹp',
  },
  description: 'Nối mi · Lông mày · Gội đầu · Nail. 55 Nguyễn Nhạc, Quy Nhơn.',
  openGraph: {
    siteName: 'Hanie in Quy Nhon',
    locale: 'vi_VN',
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${gowunBatang.variable} ${notoSans.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
