import { getRequestConfig } from 'next-intl/server';
import { routing } from '../navigation';
import { getTranslationsFromDB } from '@/lib/translation-cache';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as 'ru' | 'kk' | 'en')) {
        locale = routing.defaultLocale;
    }

    // Load translations from database
    const messages = await getTranslationsFromDB(locale as 'ru' | 'kk' | 'en');

    return {
        locale,
        messages
    };
});
