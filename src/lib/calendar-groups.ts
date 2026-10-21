import { formatMonthYear } from './date-format';
import { KZ_TIMEZONE } from './timezone';

interface Dated {
  startDate: string | Date;
  endDate: string | Date;
}

export interface MonthGroup<T> {
  key: string;
  label: string;
  items: T[];
}

const time = (value: string | Date) => new Date(value).getTime();

// Идущие сейчас считаются будущими: по ним ещё актуальна информация
export function splitByTime<T extends Dated>(items: readonly T[], now: Date = new Date()): { upcoming: T[]; past: T[] } {
  const nowTime = now.getTime();
  const upcoming = items
    .filter((item) => time(item.endDate) >= nowTime)
    .sort((a, b) => time(a.startDate) - time(b.startDate));
  const past = items
    .filter((item) => time(item.endDate) < nowTime)
    .sort((a, b) => time(b.startDate) - time(a.startDate));
  return { upcoming, past };
}

const monthKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: KZ_TIMEZONE, year: 'numeric', month: '2-digit' });

export function groupByMonth<T extends Dated>(items: readonly T[], locale: string): MonthGroup<T>[] {
  return items.reduce<MonthGroup<T>[]>((groups, item) => {
    const key = monthKeyFormatter.format(new Date(item.startDate));
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      return [...groups.slice(0, -1), { ...last, items: [...last.items, item] }];
    }
    return [...groups, { key, label: formatMonthYear(item.startDate, locale), items: [item] }];
  }, []);
}
