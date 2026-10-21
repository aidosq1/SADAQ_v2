import type { Metadata, MetadataRoute } from 'next';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/locales';
import { PAGE_DESCRIPTIONS } from './seo-descriptions';

// Боевой домен: от него строятся canonical, hreflang, sitemap и og:image
export const SITE_URL = 'https://kazarchery.kz';

// Коды подтверждения прав в Google Search Console и Яндекс Вебмастере
export const SEARCH_VERIFICATION = {
  google: 'bw4qLpmSaALBC2nKzWlbrpOyM8IMAuCU0CIUKVxpsrY',
  yandex: 'a4a42d678a88ab32',
} as const;

export const ORGANIZATION_NAMES: Record<Locale, string> = {
  ru: 'Национальная федерация стрельбы из лука Республики Казахстан',
  kk: 'Қазақстан Республикасының Ұлттық садақ ату федерациясы',
  en: 'National Archery Federation of the Republic of Kazakhstan',
};

export const LOGO_PATH = '/logo_federation_circular.png';

const DEFAULT_OG_IMAGE = { path: '/og-image.jpg', width: 1200, height: 630 };

const OG_LOCALES: Record<Locale, string> = { ru: 'ru_KZ', kk: 'kk_KZ', en: 'en_US' };

const MAX_DESCRIPTION_LENGTH = 160;

// Разделы сайта, которые попадают в sitemap.xml
export const STATIC_PAGE_PATHS = [
  '/',
  '/about',
  '/about/history',
  '/about/leadership',
  '/about/regions',
  '/calendar',
  '/ranking',
  '/results',
  '/team',
  '/documents',
  '/media/news',
  '/media/gallery',
] as const;

function toLocale(locale: string): Locale {
  return (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : DEFAULT_LOCALE;
}

// '/ranking' + 'kk' → '/kk/ranking'; у русской версии префикса нет (localePrefix: as-needed)
export function localizedPath(path: string, locale: string): string {
  const tail = path === '/' ? '' : path;
  if (toLocale(locale) === DEFAULT_LOCALE) return tail || '/';
  return `/${toLocale(locale)}${tail}`;
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function languageAlternates(path: string): Record<string, string> {
  const languages = Object.fromEntries(LOCALES.map((locale) => [locale, absoluteUrl(localizedPath(path, locale))]));
  return { ...languages, 'x-default': languages[DEFAULT_LOCALE] };
}

export function organizationName(locale: string): string {
  return ORGANIZATION_NAMES[toLocale(locale)];
}

export function pageDescription(path: string, locale: string): string {
  const descriptions = PAGE_DESCRIPTIONS[path] ?? PAGE_DESCRIPTIONS['/'];
  return descriptions[toLocale(locale)];
}

// Текст из HTML-контента или длинного описания → meta description до 160 символов
export function truncateDescription(text: string, maxLength = MAX_DESCRIPTION_LENGTH): string {
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export interface PageSeoInput {
  locale: string;
  // Путь без префикса языка: '/', '/media/news', '/media/news/slug'
  path: string;
  title: string;
  description: string;
  image?: string | null;
  article?: { publishedTime: string; modifiedTime?: string };
  // Главная: заголовок без шаблона «%s | SADAQ»
  absoluteTitle?: boolean;
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const locale = toLocale(input.locale);
  const url = absoluteUrl(localizedPath(input.path, locale));
  const images = input.image
    ? [{ url: absoluteUrl(input.image) }]
    : [{ url: absoluteUrl(DEFAULT_OG_IMAGE.path), width: DEFAULT_OG_IMAGE.width, height: DEFAULT_OG_IMAGE.height }];
  const openGraphBase = {
    url,
    title: input.title,
    description: input.description,
    siteName: ORGANIZATION_NAMES[locale],
    locale: OG_LOCALES[locale],
    images,
  };

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url, languages: languageAlternates(input.path) },
    openGraph: input.article
      ? { ...openGraphBase, type: 'article', ...input.article }
      : { ...openGraphBase, type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: images.map((image) => image.url),
    },
  };
}

// Одна страница → записи sitemap для всех языков, каждая со ссылками на остальные версии
export function sitemapEntries(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  const languages = languageAlternates(path);
  return LOCALES.map((locale) => ({
    url: absoluteUrl(localizedPath(path, locale)),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}
