/**
 * Тесты группировки протоколов для страницы «Результаты»
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupProtocols } from '../src/lib/results-protocols';

const protocol = (id: number, eventDate: string, year: number) => ({
  id, title: `П${id}`, eventDate, location: 'Алматы', year, fileUrl: `/p${id}.pdf`,
});

test('группировка по годам: протоколы по убыванию даты, документы в конце', () => {
  const grouped = groupProtocols(
    [protocol(1, '2026-03-01', 2026), protocol(2, '2026-09-15', 2026), protocol(3, '2025-05-01', 2025)],
    [{ id: 10, title: 'Рейтинг 2026', year: 2026, fileUrl: '/r.pdf' }],
  );
  assert.deepEqual(Object.keys(grouped).sort(), ['2025', '2026']);
  assert.deepEqual(grouped['2026'].map((p) => [p.source, p.id]), [['protocol', 2], ['protocol', 1], ['document', 10]]);
  assert.deepEqual(grouped['2025'].map((p) => p.id), [3]);
});

test('документ без года попадает в текущий год, без даты и места', () => {
  const grouped = groupProtocols([], [{ id: 5, title: 'Рейтинг', year: null }], 2026);
  assert.deepEqual(grouped['2026'], [{
    id: 5, title: 'Рейтинг', titleKk: undefined, titleEn: undefined, eventDate: '', location: '',
    locationKk: '', locationEn: '', fileUrl: undefined, year: 2026, source: 'document',
  }]);
});

test('пустые списки — пустой объект', () => {
  assert.deepEqual(groupProtocols([], []), {});
});
