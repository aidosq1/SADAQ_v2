/**
 * Тесты списка альбомов галереи
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uniqueAlbums } from '../src/lib/gallery';

test('альбомы без повторов и пустых названий, в порядке появления', () => {
  const items = [
    { albumName: 'Кубок РК' },
    { albumName: null },
    { albumName: 'Чемпионат Азии' },
    { albumName: '' },
    { albumName: 'Кубок РК' },
    {},
  ];
  assert.deepEqual(uniqueAlbums(items), ['Кубок РК', 'Чемпионат Азии']);
});
