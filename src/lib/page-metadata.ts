import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

// generateMetadata для страниц-клиентов: <title> берётся из `${namespace}.title` в переводах
export function titleFromTranslations(namespace: string) {
  return async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });
    return { title: t('title') };
  };
}
