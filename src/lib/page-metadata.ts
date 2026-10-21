import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata, pageDescription } from './seo';

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

// generateMetadata для разделов сайта: <title> из переводов `${namespace}.${key}`,
// description, canonical, hreflang и Open Graph — по пути раздела без префикса языка
export function metadataFromTranslations(namespace: string, path: string, key = 'title') {
  return async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });
    return buildPageMetadata({ locale, path, title: t(key), description: pageDescription(path, locale) });
  };
}

// Служебные страницы (вход, подача заявки, админка) не попадают в поиск
export const NO_INDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};
