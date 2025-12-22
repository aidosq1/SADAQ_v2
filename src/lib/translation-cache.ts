import { unstable_cache } from 'next/cache';
import prisma from './prisma';

type LocaleKey = 'ru' | 'kk' | 'en';
type MessagesStructure = Record<string, Record<string, string>>;

/**
 * Fetches all translations from database and transforms them into
 * next-intl compatible nested structure: { namespace: { key: value } }
 */
async function fetchTranslationsFromDB(locale: LocaleKey): Promise<MessagesStructure> {
  const translations = await prisma.translation.findMany({
    select: {
      namespace: true,
      key: true,
      ru: true,
      kk: true,
      en: true,
    },
  });

  const messages: MessagesStructure = {};

  for (const t of translations) {
    if (!messages[t.namespace]) {
      messages[t.namespace] = {};
    }

    // Select value for current locale, fallback to ru
    let value: string;
    if (locale === 'kk' && t.kk) {
      value = t.kk;
    } else if (locale === 'en' && t.en) {
      value = t.en;
    } else {
      value = t.ru;
    }

    messages[t.namespace][t.key] = value;
  }

  return messages;
}

/**
 * Cached version of translation fetcher.
 * Cache is tagged with 'translations' for easy invalidation.
 * Revalidates every 5 minutes (300 seconds).
 */
export const getTranslationsFromDB = unstable_cache(
  fetchTranslationsFromDB,
  ['translations'],
  {
    revalidate: 300,
    tags: ['translations'],
  }
);

/**
 * Get all available namespaces (for admin UI filters)
 */
export async function getTranslationNamespaces(): Promise<string[]> {
  const namespaces = await prisma.translation.findMany({
    select: { namespace: true },
    distinct: ['namespace'],
    orderBy: { namespace: 'asc' },
  });

  return namespaces.map((n) => n.namespace);
}
