type LocaleText = { vi: string; en?: string; ko?: string };

export function getLocaleText(
  field: LocaleText | Record<string, string> | null | undefined,
  locale: string,
  fallback: string = 'vi',
): string {
  if (!field) return '';
  return (
    (field as Record<string, string>)[locale] ??
    (field as Record<string, string>)[fallback] ??
    (field as Record<string, string>)['vi'] ??
    ''
  );
}

export function formatPrice(amount: number, locale: string): string {
  return (
    new Intl.NumberFormat(
      locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN',
      { style: 'decimal', maximumFractionDigits: 0 },
    ).format(amount) + ' ₫'
  );
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(
    locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  ).format(date);
}

export function formatTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(
    locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN',
    { hour: '2-digit', minute: '2-digit' },
  ).format(date);
}
