// Языки сайта. Без зависимостей от next-intl, чтобы модуль грузился и в unit-тестах
export const LOCALES = ['ru', 'kk', 'en'] as const;
export const DEFAULT_LOCALE = 'ru';

export type Locale = (typeof LOCALES)[number];
