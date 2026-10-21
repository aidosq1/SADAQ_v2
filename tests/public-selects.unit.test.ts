/**
 * Тесты публичных наборов полей: персональные данные не уходят в открытое API
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLIC_ATHLETE_SELECT,
  PUBLIC_ATHLETE_PROFILE_SELECT,
  PUBLIC_PERSON_SELECT,
  PUBLIC_REGION_SELECT,
  STAFF_ROLES,
} from '../src/lib/public-selects';

// Поля спортсмена, которых не должно быть в ответе без входа
const ATHLETE_PRIVATE_FIELDS = [
  'iin',
  'registrationNumber',
  'registrationDate',
  'federationName',
  'medicalStatus',
  'medicalDate',
  'medicalExpiry',
  'disqualificationInfo',
  'dopingInfo',
  'additionalInfo',
  'coachId',
  'coach',
  'athleteRegistrations',
];

function selectedKeys(select: Record<string, unknown>): string[] {
  return Object.keys(select).filter((key) => select[key] !== false);
}

test('список спортсменов: нет закрытых полей и даты рождения', () => {
  const keys = selectedKeys(PUBLIC_ATHLETE_SELECT);
  for (const field of [...ATHLETE_PRIVATE_FIELDS, 'dob']) {
    assert.equal(keys.includes(field), false, `поле ${field} не должно быть публичным`);
  }
});

test('список спортсменов: есть всё, что нужно рейтингу и сборной', () => {
  const keys = selectedKeys(PUBLIC_ATHLETE_SELECT);
  for (const field of ['id', 'slug', 'name', 'nameKk', 'nameEn', 'image', 'regionRef']) {
    assert.ok(keys.includes(field), `нет поля ${field}`);
  }
});

test('профиль спортсмена: нет закрытых полей, дата рождения есть (показывается на странице)', () => {
  const keys = selectedKeys(PUBLIC_ATHLETE_PROFILE_SELECT);
  for (const field of ATHLETE_PRIVATE_FIELDS) {
    assert.equal(keys.includes(field), false, `поле ${field} не должно быть публичным`);
  }
  assert.ok(keys.includes('dob'));
  assert.ok(keys.includes('rankings'));
});

test('тренер и судья: нет ИИН и даты рождения', () => {
  const keys = selectedKeys(PUBLIC_PERSON_SELECT);
  assert.equal(keys.includes('iin'), false);
  assert.equal(keys.includes('dob'), false);
});

test('регион: нет пользователей', () => {
  assert.equal(selectedKeys(PUBLIC_REGION_SELECT).includes('users'), false);
});

test('сотрудники — только роли админки', () => {
  assert.deepEqual([...STAFF_ROLES].sort(), ['Admin', 'Editor', 'RegionalRepresentative']);
});
