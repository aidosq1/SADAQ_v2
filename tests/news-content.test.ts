import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHtmlContent, plainTextToHtml, toNewsHtml } from '../src/lib/news-content';

test('plain text: blank lines become paragraphs', () => {
  assert.equal(plainTextToHtml('Первый абзац\n\nВторой абзац'), '<p>Первый абзац</p><p>Второй абзац</p>');
});

test('plain text: single line break becomes <br>', () => {
  assert.equal(plainTextToHtml('строка 1\nстрока 2'), '<p>строка 1<br>строка 2</p>');
});

test('plain text: windows line endings and extra blank lines', () => {
  assert.equal(plainTextToHtml('a\r\n\r\n\r\n  b  \r\n'), '<p>a</p><p>b</p>');
});

test('plain text: html special chars are escaped', () => {
  assert.equal(plainTextToHtml('5 < 7 & "ok"'), '<p>5 &lt; 7 &amp; &quot;ok&quot;</p>');
});

test('detects editor html', () => {
  assert.equal(isHtmlContent('<p>Текст <strong>жирный</strong></p>'), true);
  assert.equal(isHtmlContent('<h2>Заголовок</h2>'), true);
  assert.equal(isHtmlContent('<img src="/uploads/news/a.jpg">'), true);
});

test('plain text with angle brackets is not html', () => {
  assert.equal(isHtmlContent('счёт 3<5 и 7>2'), false);
  assert.equal(isHtmlContent('Победа! <3'), false);
});

test('toNewsHtml keeps html as is', () => {
  const html = '<p>Текст</p><ul><li>пункт</li></ul>';
  assert.equal(toNewsHtml(html), html);
});

test('toNewsHtml converts legacy plain text', () => {
  assert.equal(toNewsHtml('Заголовок\n\nТекст'), '<p>Заголовок</p><p>Текст</p>');
});

test('toNewsHtml handles empty values', () => {
  assert.equal(toNewsHtml(''), '');
  assert.equal(toNewsHtml(null), '');
  assert.equal(toNewsHtml(undefined), '');
});
