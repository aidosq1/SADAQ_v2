/**
 * Тесты запроса публичного рейтинга
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankingsQuery } from '../src/lib/ranking-query';

test('запрос рейтинга: сезон, фильтры и лимит', () => {
  const params = new URLSearchParams(rankingsQuery({ category: 'Adults', gender: 'F', type: 'Compound' }));
  assert.equal(params.get('season'), '2026');
  assert.equal(params.get('category'), 'Adults');
  assert.equal(params.get('gender'), 'F');
  assert.equal(params.get('type'), 'Compound');
  assert.equal(params.get('limit'), '100');
});
