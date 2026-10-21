/**
 * Тесты разбивки календаря на будущие/прошедшие турниры и по месяцам
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitByTime, groupByMonth } from '../src/lib/calendar-groups';
import { formatMonthYear } from '../src/lib/date-format';

const t = (id: number, start: string, end: string) => ({
  id,
  startDate: `${start}T05:00:00Z`,
  endDate: `${end}T13:00:00Z`,
});

const NOW = new Date('2026-10-21T08:00:00Z');

test('будущие и идущие сейчас — в upcoming по возрастанию даты', () => {
  const list = [t(1, '2026-12-01', '2026-12-05'), t(2, '2026-10-20', '2026-10-23'), t(3, '2026-07-27', '2026-07-31')];
  const { upcoming, past } = splitByTime(list, NOW);
  assert.deepEqual(upcoming.map((x) => x.id), [2, 1]);
  assert.deepEqual(past.map((x) => x.id), [3]);
});

test('прошедшие — по убыванию даты', () => {
  const list = [t(1, '2026-02-10', '2026-02-16'), t(2, '2026-07-27', '2026-07-31'), t(3, '2026-05-05', '2026-05-09')];
  assert.deepEqual(splitByTime(list, NOW).past.map((x) => x.id), [2, 3, 1]);
});

test('не меняет исходный массив', () => {
  const list = [t(1, '2026-02-10', '2026-02-16'), t(2, '2026-07-27', '2026-07-31')];
  splitByTime(list, NOW);
  assert.deepEqual(list.map((x) => x.id), [1, 2]);
});

test('группировка по месяцу начала с сохранением порядка', () => {
  const list = [t(1, '2026-07-27', '2026-07-31'), t(2, '2026-07-02', '2026-07-05'), t(3, '2026-05-05', '2026-05-09')];
  const groups = groupByMonth(list, 'kk');
  assert.deepEqual(groups.map((g) => [g.label, g.items.map((x) => x.id)]), [
    ['Шілде 2026', [1, 2]],
    ['Мамыр 2026', [3]],
  ]);
});

test('название месяца для ru и en', () => {
  assert.equal(formatMonthYear('2026-07-15T12:00:00Z', 'ru'), 'Июль 2026');
  assert.equal(formatMonthYear('2026-07-15T12:00:00Z', 'en'), 'July 2026');
  assert.equal(formatMonthYear('2026-07-15T12:00:00Z', 'kk'), 'Шілде 2026');
});
