type LocaleKey = 'ru' | 'kk' | 'en';

const localeSuffixes: Record<LocaleKey, string> = {
  ru: '',
  kk: 'Kk',
  en: 'En'
};

export function getLocalizedField<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: string
): string {
  const suffix = localeSuffixes[locale as LocaleKey] || '';
  const localizedField = `${field}${suffix}`;

  // Try localized field first, fallback to base field (Russian)
  return (item[localizedField] as string) || (item[field] as string) || '';
}

export function getLocalizedFields<T extends Record<string, unknown>>(
  item: T,
  fields: string[],
  locale: string
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of fields) {
    result[field] = getLocalizedField(item, field, locale);
  }

  return result;
}

// For use in server components
export async function getLocaleFromCookies(): Promise<string> {
  const { cookies } = await import('next/headers');
  return (await cookies()).get('NEXT_LOCALE')?.value || 'ru';
}
