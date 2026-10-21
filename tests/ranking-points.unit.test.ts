/**
 * Тесты очков за место в турнире
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePoints, isValidPlace } from '../src/lib/ranking-points';

test('взрослые: 100 за первое место, 30 за восьмое', () => {
  assert.equal(calculatePoints(1, 'Adults'), 100);
  assert.equal(calculatePoints(2, 'Adults'), 90);
  assert.equal(calculatePoints(8, 'Adults'), 30);
});

test('юниоры и младше: 70 за первое место, 5 за восьмое', () => {
  assert.equal(calculatePoints(1, 'Juniors'), 70);
  assert.equal(calculatePoints(1, 'Cadets'), 70);
  assert.equal(calculatePoints(8, 'Cubs'), 5);
});

test('за места после восьмого очков нет', () => {
  assert.equal(calculatePoints(9, 'Adults'), 0);
  assert.equal(calculatePoints(0, 'Adults'), 0);
});

test('место — целое число от 1', () => {
  assert.equal(isValidPlace(1), true);
  assert.equal(isValidPlace(0), false);
  assert.equal(isValidPlace(-3), false);
  assert.equal(isValidPlace(1.5), false);
  assert.equal(isValidPlace('1'), false);
});
