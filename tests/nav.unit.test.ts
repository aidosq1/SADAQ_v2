/**
 * Тесты навигации: подписи пунктов меню
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAV, isGroup } from '../src/components/layout/nav';

test('пункт группы не повторяет её название: иначе в меню два одинаковых пункта', () => {
  for (const entry of NAV.filter(isGroup)) {
    for (const item of entry.items) {
      assert.notEqual(item.labelKey, entry.labelKey, `${entry.labelKey} → ${item.href}`);
    }
  }
});

test('внутри группы подписи пунктов не повторяются', () => {
  for (const entry of NAV.filter(isGroup)) {
    const keys = entry.items.map((item) => item.labelKey);
    assert.equal(new Set(keys).size, keys.length, entry.labelKey);
  }
});
