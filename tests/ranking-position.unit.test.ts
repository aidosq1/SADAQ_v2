/**
 * Тесты места в рейтинге
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withPositions } from '../src/lib/ranking-position';

test('место считается по порядку, а не по полю rank', () => {
  // В базе у лидера rank = 2: запись с rank = 1 была удалена
  const entries = [{ id: 'a', rank: 2 }, { id: 'b', rank: 3 }, { id: 'c', rank: 5 }];
  assert.deepEqual(withPositions(entries, 0).map((e) => e.position), [1, 2, 3]);
});

test('учитывает смещение страницы', () => {
  const entries = [{ id: 'a', rank: 11 }, { id: 'b', rank: 12 }];
  assert.deepEqual(withPositions(entries, 10).map((e) => e.position), [11, 12]);
});

test('не меняет исходные объекты', () => {
  const entries = [{ id: 'a', rank: 2 }];
  const result = withPositions(entries, 0);
  assert.equal('position' in entries[0], false);
  assert.equal(result[0].rank, 2);
});
