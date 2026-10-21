/**
 * Тесты распознавания клика, который ведёт на другую страницу сайта
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPageNavigation, type LinkClick } from '../src/lib/navigation-progress';

const current = new URL('https://kazarchery.kz/calendar');
const click = (href: string, extra: Partial<LinkClick> = {}): LinkClick => ({
  href,
  target: null,
  hasDownload: false,
  button: 0,
  modified: false,
  ...extra,
});

test('внутренняя ссылка на другую страницу — переход', () => {
  assert.equal(isPageNavigation(click('https://kazarchery.kz/ranking'), current), true);
  assert.equal(isPageNavigation(click('/kk/calendar'), current), true);
  assert.equal(isPageNavigation(click('/team?gender=F'), new URL('https://kazarchery.kz/team')), true);
});

test('та же страница или только якорь — не переход', () => {
  assert.equal(isPageNavigation(click('/calendar'), current), false);
  assert.equal(isPageNavigation(click('/calendar#july'), current), false);
});

test('новая вкладка, клик с модификатором, средняя кнопка, download — не переход', () => {
  assert.equal(isPageNavigation(click('/ranking', { target: '_blank' }), current), false);
  assert.equal(isPageNavigation(click('/ranking', { modified: true }), current), false);
  assert.equal(isPageNavigation(click('/ranking', { button: 1 }), current), false);
  assert.equal(isPageNavigation(click('/ranking', { hasDownload: true }), current), false);
});

test('target="_self" — обычный переход', () => {
  assert.equal(isPageNavigation(click('/ranking', { target: '_self' }), current), true);
});

test('внешний сайт, почта, телефон — не переход', () => {
  assert.equal(isPageNavigation(click('https://www.instagram.com/kazarchery_official/'), current), false);
  assert.equal(isPageNavigation(click('mailto:info@kazarchery.kz'), current), false);
  assert.equal(isPageNavigation(click('tel:+77001234567'), current), false);
});

test('файлы и API открываются браузером, а не роутером — не переход', () => {
  assert.equal(isPageNavigation(click('/uploads/documents/polozhenie.pdf'), current), false);
  assert.equal(isPageNavigation(click('/api/registrations/5/export/excel'), current), false);
});
