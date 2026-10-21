import { absoluteUrl, LOGO_PATH, organizationName, SITE_URL } from './seo';

// Разметка schema.org (JSON-LD) для расширенных сниппетов Google и Яндекса

type JsonLd = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// "<" экранируется, чтобы текст из базы не закрыл тег <script>
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function publisher(locale: string): JsonLd {
  return {
    '@type': 'SportsOrganization',
    '@id': ORGANIZATION_ID,
    name: organizationName(locale),
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: absoluteUrl(LOGO_PATH) },
  };
}

export function organizationJsonLd(locale: string, sameAs: readonly string[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    ...publisher(locale),
    alternateName: 'SADAQ',
    sport: 'Archery',
    areaServed: { '@type': 'Country', name: 'Kazakhstan' },
    sameAs,
  };
}

export function websiteJsonLd(locale: string, url: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url,
    name: organizationName(locale),
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface NewsArticleJsonLdInput {
  locale: string;
  url: string;
  headline: string;
  description: string;
  image: string | null;
  publishedAt: Date;
  updatedAt: Date;
}

export function newsArticleJsonLd(input: NewsArticleJsonLdInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    headline: input.headline,
    description: input.description,
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    inLanguage: input.locale,
    author: { '@type': 'Organization', name: organizationName(input.locale), url: `${SITE_URL}/` },
    publisher: publisher(input.locale),
  };
}
