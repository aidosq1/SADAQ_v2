/**
 * Тесты статуса заявки в UI kit
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getRegistrationStatus } from '../src/lib/registration-status';

test('статусы заявки показываются вариантами Badge из UI kit', () => {
  assert.equal(getRegistrationStatus('PENDING').variant, 'warning');
  assert.equal(getRegistrationStatus('APPROVED').variant, 'success');
  assert.equal(getRegistrationStatus('REJECTED').variant, 'destructive');
  assert.equal(getRegistrationStatus('WITHDRAWN').variant, 'neutral');
});

test('подписи статусов на русском', () => {
  assert.equal(getRegistrationStatus('PENDING').label, 'На проверке');
  assert.equal(getRegistrationStatus('APPROVED').label, 'Одобрено');
});

test('неизвестный статус не ломает страницу', () => {
  const status = getRegistrationStatus('SOMETHING');
  assert.equal(status.variant, 'neutral');
  assert.equal(status.label, 'SOMETHING');
});
