/**
 * Тесты форматирования дат
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatDateRange, formatDayAndShortMonth } from '../src/lib/date-format';

// 12:00 по Алматы, чтобы граница суток не влияла на результат
const d = (iso: string) => new Date(`${iso}T12:00:00+05:00`);

test('kk: месяц словом, без "M10"', () => {
  assert.equal(formatDate(d('2026-10-21'), 'kk'), '21 қазан 2026');
  assert.equal(formatDate(d('2026-01-05'), 'kk', { withYear: false }), '5 қаңтар');
});

test('kk: все 12 месяцев на казахском', () => {
  const months = Array.from({ length: 12 }, (_, i) =>
    formatDate(d(`2026-${String(i + 1).padStart(2, '0')}-15`), 'kk', { withYear: false })
  );
  assert.deepEqual(months, [
    '15 қаңтар', '15 ақпан', '15 наурыз', '15 сәуір', '15 мамыр', '15 маусым',
    '15 шілде', '15 тамыз', '15 қыркүйек', '15 қазан', '15 қараша', '15 желтоқсан',
  ]);
});

test('ru и en форматируются через Intl', () => {
  assert.equal(formatDate(d('2026-10-21'), 'ru'), '21 октября 2026 г.');
  assert.equal(formatDate(d('2026-10-21'), 'en'), 'October 21, 2026');
});

test('дата берётся по Алматы, а не по UTC', () => {
  // 21 октября 23:30 по Алматы = 21 октября 18:30 UTC
  assert.equal(formatDate(new Date('2026-10-21T18:30:00Z'), 'kk'), '21 қазан 2026');
  // 22 октября 01:00 по Алматы = 21 октября 20:00 UTC
  assert.equal(formatDate(new Date('2026-10-21T20:00:00Z'), 'kk'), '22 қазан 2026');
});

test('kk: диапазон в одном месяце', () => {
  assert.equal(formatDateRange(d('2026-07-27'), d('2026-07-31'), 'kk'), '27–31 шілде 2026');
});

test('kk: диапазон через месяц и через год', () => {
  assert.equal(formatDateRange(d('2026-02-28'), d('2026-03-03'), 'kk'), '28 ақпан – 3 наурыз 2026');
  assert.equal(formatDateRange(d('2026-12-30'), d('2027-01-02'), 'kk'), '30 желтоқсан 2026 – 2 қаңтар 2027');
});

test('диапазон из одного дня = одна дата', () => {
  assert.equal(formatDateRange(d('2026-05-05'), d('2026-05-05'), 'kk'), '5 мамыр 2026');
  assert.equal(formatDateRange(d('2026-05-05'), null, 'kk'), '5 мамыр 2026');
});

test('ru: диапазон в одном месяце', () => {
  assert.equal(formatDateRange(d('2026-07-27'), d('2026-07-31'), 'ru'), '27–31 июля 2026 г.');
});

test('неизвестная локаль падает в ru', () => {
  assert.equal(formatDate(d('2026-10-21'), 'de'), '21 октября 2026 г.');
});

test('плитка даты: число и короткий месяц по времени Казахстана', () => {
  assert.deepEqual(formatDayAndShortMonth(d('2026-07-27'), 'kk'), { day: 27, month: 'шіл' });
  assert.deepEqual(formatDayAndShortMonth(d('2026-07-27'), 'ru'), { day: 27, month: 'июль' });
  assert.deepEqual(formatDayAndShortMonth(d('2026-07-27'), 'en'), { day: 27, month: 'Jul' });
});

test('плитка даты: 00:30 по Алматы — уже новый день, хотя в UTC ещё вчера', () => {
  assert.deepEqual(formatDayAndShortMonth('2026-08-01T00:30:00+05:00', 'ru'), { day: 1, month: 'авг' });
});
