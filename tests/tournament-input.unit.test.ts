/**
 * Тесты разбора дат турнира из формы админки
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDateInput, InvalidDateError, getTournamentDatesError } from '../src/lib/tournament-input';

test('пустая строка и null очищают дату', () => {
  assert.equal(parseDateInput(''), null);
  assert.equal(parseDateInput(null), null);
});

test('отсутствующее поле не меняет дату', () => {
  assert.equal(parseDateInput(undefined), undefined);
});

test('ISO-строка превращается в Date', () => {
  const date = parseDateInput('2026-11-20T05:00:00.000Z');
  assert.ok(date instanceof Date);
  assert.equal(date.toISOString(), '2026-11-20T05:00:00.000Z');
});

test('мусор вместо даты — ошибка', () => {
  assert.throws(() => parseDateInput('завтра'), InvalidDateError);
  assert.throws(() => parseDateInput(42), InvalidDateError);
});

test('окончание раньше начала — ошибка', () => {
  const start = new Date('2026-11-20T05:00:00Z');
  const end = new Date('2026-11-19T05:00:00Z');
  assert.equal(typeof getTournamentDatesError(start, end), 'string');
});

test('однодневный турнир допустим', () => {
  const day = new Date('2026-11-20T05:00:00Z');
  assert.equal(getTournamentDatesError(day, day), null);
});
