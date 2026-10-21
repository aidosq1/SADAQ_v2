/**
 * Тесты цвета статуса турнира в UI kit
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStatusVariant, TOURNAMENT_STATUS_CONFIG } from '../src/lib/tournament-utils';

test('каждому статусу соответствует вариант Badge из UI kit', () => {
  assert.equal(getStatusVariant('REGISTRATION_OPEN'), 'success');
  assert.equal(getStatusVariant('REGISTRATION_CLOSED'), 'warning');
  assert.equal(getStatusVariant('IN_PROGRESS'), 'info');
  assert.equal(getStatusVariant('COMPLETED'), 'neutral');
});

test('неизвестный статус показывается нейтральным', () => {
  assert.equal(getStatusVariant('UNKNOWN' as never), 'neutral');
});

test('в конфиге статусов нет сырых цветов Tailwind', () => {
  for (const config of Object.values(TOURNAMENT_STATUS_CONFIG)) {
    assert.equal('bgClass' in config, false);
    assert.equal('textClass' in config, false);
  }
});
