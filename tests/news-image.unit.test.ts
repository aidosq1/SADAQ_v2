/**
 * Тесты фото в тексте новости: проверка файла, отбор картинок, фото с подписью на сайте
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import DOMPurify from 'isomorphic-dompurify';
import { NEWS_IMAGE_MAX_BYTES, pickImageFiles, validateNewsImage, withImageExtension } from '../src/lib/news-image';
import { isHtmlContent, toNewsHtml } from '../src/lib/news-content';

const MB = 1024 * 1024;

test('принимает jpg, png, gif, webp до 10 МБ', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
    assert.equal(validateNewsImage({ type, size: 2 * MB }), null, type);
  }
});

test('не принимает не картинки и неподдерживаемые форматы', () => {
  assert.match(validateNewsImage({ type: 'application/pdf', size: MB }) ?? '', /изображени/i);
  assert.match(validateNewsImage({ type: 'image/svg+xml', size: MB }) ?? '', /изображени/i);
  assert.match(validateNewsImage({ type: 'image/heic', size: MB }) ?? '', /изображени/i);
});

test('не принимает файлы больше 10 МБ', () => {
  assert.equal(NEWS_IMAGE_MAX_BYTES, 10 * MB);
  assert.equal(validateNewsImage({ type: 'image/jpeg', size: 10 * MB }), null);
  assert.match(validateNewsImage({ type: 'image/jpeg', size: 10 * MB + 1 }) ?? '', /10 МБ/);
});

test('из вставки и перетаскивания берёт только картинки, порядок сохраняется', () => {
  const files = [
    { name: 'a.jpg', type: 'image/jpeg' },
    { name: 'doc.pdf', type: 'application/pdf' },
    { name: 'b.png', type: 'image/png' },
  ];
  assert.deepEqual(pickImageFiles(files).map((f) => f.name), ['a.jpg', 'b.png']);
  assert.deepEqual(pickImageFiles([]), []);
});

test('имя вставленной картинки получает расширение по типу: сервер сверяет их', () => {
  assert.equal(withImageExtension('image.png', 'image/png'), 'image.png');
  assert.equal(withImageExtension('photo.JPEG', 'image/jpeg'), 'photo.JPEG');
  assert.equal(withImageExtension('screenshot.png', 'image/jpeg'), 'screenshot.jpg');
  assert.equal(withImageExtension('image', 'image/webp'), 'image.webp');
  assert.equal(withImageExtension('', 'image/gif'), 'image.gif');
});

test('текст с фото и подписью распознаётся как html', () => {
  assert.equal(isHtmlContent('<figure><img src="/uploads/news/a.jpg"><figcaption>Финал</figcaption></figure>'), true);
});

test('фото с подписью доходит до страницы новости после очистки html', () => {
  const html = '<p>До</p><figure><img src="/uploads/news/a.jpg" alt="Финал"><figcaption>Финал <em>КРЧ</em></figcaption></figure><p>После</p>';
  const clean = DOMPurify.sanitize(toNewsHtml(html), { ADD_ATTR: ['target'] });
  assert.match(clean, /<figure><img src="\/uploads\/news\/a\.jpg" alt="Финал"><figcaption>Финал <em>КРЧ<\/em><\/figcaption><\/figure>/);
});
