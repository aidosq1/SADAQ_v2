/**
 * Тесты правил заявки на турнир
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMaxAthletes,
  findDuplicateIds,
  getAthleteEligibilityError,
  canOwnerEditRegistration,
  isActiveRegistrationStatus,
} from '../src/lib/registration-rules';

const DAY = 24 * 3600 * 1000;
const openTournament = {
  startDate: new Date(Date.now() + 10 * DAY),
  endDate: new Date(Date.now() + 12 * DAY),
  isRegistrationOpen: true,
  registrationDeadline: new Date(Date.now() + 5 * DAY),
};

test('регион-организатор заявляет 6 спортсменов, остальные — 4', () => {
  assert.equal(getMaxAthletes(true), 6);
  assert.equal(getMaxAthletes(false), 4);
});

test('находит повторы и пропускает пустые значения', () => {
  assert.deepEqual(findDuplicateIds([1, 2, 1, null, 3, 3, undefined, null]), [1, 3]);
  assert.deepEqual(findDuplicateIds([1, 2, 3]), []);
});

test('спортсмен другого пола не подходит категории', () => {
  const error = getAthleteEligibilityError({ name: 'Иванова', gender: 'F', regionId: 15 }, { gender: 'M' }, 15);
  assert.match(error ?? '', /Иванова/);
});

test('спортсмен другого региона не подходит заявке региона', () => {
  const error = getAthleteEligibilityError({ name: 'Петров', gender: 'M', regionId: 16 }, { gender: 'M' }, 15);
  assert.match(error ?? '', /Петров/);
});

test('без проверки региона (админ) важен только пол', () => {
  assert.equal(getAthleteEligibilityError({ name: 'Петров', gender: 'M', regionId: 16 }, { gender: 'M' }, null), null);
});

test('подходящий спортсмен проходит', () => {
  assert.equal(getAthleteEligibilityError({ name: 'Петров', gender: 'M', regionId: 15 }, { gender: 'M' }, 15), null);
});

test('регион правит только заявку на проверке, пока открыт приём', () => {
  assert.equal(canOwnerEditRegistration('PENDING', openTournament), true);
  assert.equal(canOwnerEditRegistration('APPROVED', openTournament), false);
  assert.equal(canOwnerEditRegistration('REJECTED', openTournament), false);
});

test('после дедлайна заявку не изменить', () => {
  const closed = { ...openTournament, registrationDeadline: new Date(Date.now() - DAY) };
  assert.equal(canOwnerEditRegistration('PENDING', closed), false);
});

test('после старта турнира заявку не изменить', () => {
  const started = { ...openTournament, startDate: new Date(Date.now() - DAY), registrationDeadline: null };
  assert.equal(canOwnerEditRegistration('PENDING', started), false);
});

test('после ручного закрытия приёма заявку не изменить', () => {
  assert.equal(canOwnerEditRegistration('PENDING', { ...openTournament, isRegistrationOpen: false }), false);
});

test('активные заявки — на проверке и одобренные', () => {
  assert.equal(isActiveRegistrationStatus('PENDING'), true);
  assert.equal(isActiveRegistrationStatus('APPROVED'), true);
  assert.equal(isActiveRegistrationStatus('REJECTED'), false);
  assert.equal(isActiveRegistrationStatus('WITHDRAWN'), false);
});
