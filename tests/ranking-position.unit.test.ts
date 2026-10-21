/**
 * Тесты места в рейтинге
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withPositions, positionsById } from '../src/lib/ranking-position';

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

test('место в группе: порядок как на странице рейтинга (rank, затем очки, затем id)', () => {
  const entries = [
    { id: 1, rank: 2, points: 900, category: 'Adults', gender: 'M', type: 'Recurve' },
    { id: 2, rank: 5, points: 800, category: 'Adults', gender: 'M', type: 'Recurve' },
    { id: 3, rank: 9, points: 700, category: 'Adults', gender: 'M', type: 'Recurve' },
  ];
  const positions = positionsById(entries);
  assert.equal(positions.get(1), 1);
  assert.equal(positions.get(2), 2);
  assert.equal(positions.get(3), 3);
});

test('место считается отдельно для каждой категории, пола и лука', () => {
  const entries = [
    { id: 1, rank: 1, points: 900, category: 'Adults', gender: 'M', type: 'Recurve' },
    { id: 2, rank: 4, points: 500, category: 'Adults', gender: 'M', type: 'Compound' },
    { id: 3, rank: 1, points: 950, category: 'Youth', gender: 'M', type: 'Recurve' },
    { id: 4, rank: 3, points: 600, category: 'Adults', gender: 'M', type: 'Compound' },
  ];
  const positions = positionsById(entries);
  assert.equal(positions.get(1), 1);
  assert.equal(positions.get(3), 1);
  assert.equal(positions.get(4), 1);
  assert.equal(positions.get(2), 2);
});

test('при равном rank выше тот, у кого больше очков, при равных очках — меньший id', () => {
  const entries = [
    { id: 7, rank: 3, points: 500, category: 'Adults', gender: 'F', type: 'Recurve' },
    { id: 5, rank: 3, points: 500, category: 'Adults', gender: 'F', type: 'Recurve' },
    { id: 6, rank: 3, points: 600, category: 'Adults', gender: 'F', type: 'Recurve' },
  ];
  const positions = positionsById(entries);
  assert.deepEqual([positions.get(6), positions.get(5), positions.get(7)], [1, 2, 3]);
});
