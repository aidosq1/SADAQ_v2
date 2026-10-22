import { KZ_TIMEZONE } from './timezone';

/**
 * Форматирование дат для публичных страниц.
 *
 * Intl в части браузеров (и в Node без full-icu) не знает казахских
 * названий месяцев и выводит "2026 M10 21". Поэтому для kk месяцы
 * берутся из своего списка, а ru/en идут через Intl.
 */

type DateLocale = 'ru' | 'kk' | 'en';
type DateInput = Date | string;

interface FormatDateOptions {
  withYear?: boolean;
}

const KK_MONTHS = [
  'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
  'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан',
] as const;

const INTL_LOCALES: Record<Exclude<DateLocale, 'kk'>, string> = {
  ru: 'ru-RU',
  en: 'en-US',
};

interface DateParts {
  year: number;
  month: number; // 0–11
  day: number;
}

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: KZ_TIMEZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

// Разные версии ICU ставят то обычный, то узкий неразрывный пробел перед "г.".
// Приводим к обычному, чтобы сервер и браузер давали одинаковую строку.
function normalizeSpaces(value: string): string {
  return value.replace(/[\u00A0\u202F]/g, ' ');
}

function toLocale(locale: string): DateLocale {
  return locale === 'kk' || locale === 'en' ? locale : 'ru';
}

function getParts(date: DateInput): DateParts {
  const parts = partsFormatter.formatToParts(new Date(date));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: pick('year'), month: pick('month') - 1, day: pick('day') };
}

function intlFormatter(locale: Exclude<DateLocale, 'kk'>, withYear: boolean): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    timeZone: KZ_TIMEZONE,
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

// Казахская норма: год впереди с «жылғы» — «2026 жылғы 21 қазан»
function kkYear(year: number): string {
  return `${year} жылғы`;
}

function formatKk({ year, month, day }: DateParts, withYear: boolean): string {
  const base = `${day} ${KK_MONTHS[month]}`;
  return withYear ? `${kkYear(year)} ${base}` : base;
}

export function formatDate(date: DateInput, locale: string, options: FormatDateOptions = {}): string {
  const withYear = options.withYear ?? true;
  const loc = toLocale(locale);
  if (loc === 'kk') return formatKk(getParts(date), withYear);
  return normalizeSpaces(intlFormatter(loc, withYear).format(new Date(date)));
}

function formatKkRange(start: DateParts, end: DateParts): string {
  if (start.year !== end.year) {
    return `${formatKk(start, true)} – ${formatKk(end, true)}`;
  }
  if (start.month !== end.month) {
    return `${kkYear(start.year)} ${formatKk(start, false)} – ${formatKk(end, false)}`;
  }
  return `${kkYear(end.year)} ${start.day}–${end.day} ${KK_MONTHS[end.month]}`;
}

function isSameDay(a: DateParts, b: DateParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function formatDateRange(
  start: DateInput,
  end: DateInput | null | undefined,
  locale: string
): string {
  const loc = toLocale(locale);
  const startParts = getParts(start);
  const endParts = end ? getParts(end) : null;

  if (!endParts || isSameDay(startParts, endParts)) {
    return formatDate(start, loc);
  }
  if (loc === 'kk') return formatKkRange(startParts, endParts);
  return normalizeSpaces(intlFormatter(loc, true).formatRange(new Date(start), new Date(end as DateInput)));
}

function capitalize(value: string): string {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

// Заголовок месяца в календаре: "Шілде 2026", "Июль 2026", "July 2026"
export function formatMonthYear(date: DateInput, locale: string): string {
  const loc = toLocale(locale);
  const { year, month } = getParts(date);
  const monthName = loc === 'kk'
    ? KK_MONTHS[month]
    : new Intl.DateTimeFormat(INTL_LOCALES[loc], { timeZone: KZ_TIMEZONE, month: 'long' }).format(new Date(date));
  return `${capitalize(monthName)} ${year}`;
}

const SHORT_MONTH_LOCALES: Record<Exclude<DateLocale, 'kk'>, string> = {
  ru: 'ru-RU',
  en: 'en-US',
};

// Плитка даты: число и короткий месяц по времени Казахстана — одинаково на сервере и в браузере
export function formatDayAndShortMonth(date: DateInput, locale: string): { day: number; month: string } {
  const loc = toLocale(locale);
  const { month, day } = getParts(date);
  const monthName = loc === 'kk'
    ? KK_MONTHS[month].slice(0, 3)
    : new Intl.DateTimeFormat(SHORT_MONTH_LOCALES[loc], { timeZone: KZ_TIMEZONE, month: 'short' }).format(new Date(date));
  return { day, month: monthName.replace('.', '') };
}
