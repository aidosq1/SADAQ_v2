/**
 * Тесты слайдера hero: переход по кругу и какие фото держать на странице
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSlideImageMounted, markSlideSeen, nextSlideIndex, prevSlideIndex } from '../src/lib/hero-slider';

test('следующий и предыдущий слайд идут по кругу', () => {
  assert.equal(nextSlideIndex(0, 4), 1);
  assert.equal(nextSlideIndex(3, 4), 0);
  assert.equal(prevSlideIndex(0, 4), 3);
  assert.equal(prevSlideIndex(2, 4), 1);
});

test('один слайд и пустой слайдер не ломают переход', () => {
  assert.equal(nextSlideIndex(0, 1), 0);
  assert.equal(prevSlideIndex(0, 1), 0);
  assert.equal(nextSlideIndex(0, 0), 0);
  assert.equal(prevSlideIndex(0, 0), 0);
});

test('показанный слайд запоминается один раз, исходный список не меняется', () => {
  const seen = [0];
  assert.deepEqual(markSlideSeen(seen, 2), [0, 2]);
  assert.deepEqual(seen, [0]);
  assert.equal(markSlideSeen(seen, 0), seen);
});

test('при открытии страницы грузятся только первое и второе фото', () => {
  const mounted = [0, 1, 2, 3].filter((i) => isSlideImageMounted(i, [0], 0, 4));
  assert.deepEqual(mounted, [0, 1]);
});

test('показанные фото остаются на странице, следующее подгружается заранее', () => {
  const mounted = [0, 1, 2, 3].filter((i) => isSlideImageMounted(i, [0, 1, 2], 2, 4));
  assert.deepEqual(mounted, [0, 1, 2, 3]);
  const afterJump = [0, 1, 2, 3].filter((i) => isSlideImageMounted(i, [0, 2], 2, 4));
  assert.deepEqual(afterJump, [0, 2, 3]);
});
