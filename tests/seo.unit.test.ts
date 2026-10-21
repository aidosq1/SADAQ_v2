/**
 * Тесты SEO-хелперов: адреса страниц, canonical/hreflang, метаданные, sitemap
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SITE_URL,
  localizedPath,
  absoluteUrl,
  languageAlternates,
  buildPageMetadata,
  sitemapEntries,
  pageDescription,
  truncateDescription,
} from '../src/lib/seo';
import { serializeJsonLd } from '../src/lib/structured-data';

test('русский — без префикса, остальные языки — с префиксом', () => {
  assert.equal(localizedPath('/', 'ru'), '/');
  assert.equal(localizedPath('/', 'kk'), '/kk');
  assert.equal(localizedPath('/ranking', 'ru'), '/ranking');
  assert.equal(localizedPath('/ranking', 'en'), '/en/ranking');
});

test('абсолютный адрес строится от боевого домена, внешние ссылки не трогаем', () => {
  assert.equal(absoluteUrl('/'), `${SITE_URL}/`);
  assert.equal(absoluteUrl('/uploads/news/a.jpg'), `${SITE_URL}/uploads/news/a.jpg`);
  assert.equal(absoluteUrl('uploads/a.jpg'), `${SITE_URL}/uploads/a.jpg`);
  assert.equal(absoluteUrl('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
});

test('hreflang: все языки и x-default на русскую версию', () => {
  assert.deepEqual(languageAlternates('/media/news'), {
    ru: `${SITE_URL}/media/news`,
    kk: `${SITE_URL}/kk/media/news`,
    en: `${SITE_URL}/en/media/news`,
    'x-default': `${SITE_URL}/media/news`,
  });
});

test('canonical страницы указывает на её языковую версию', () => {
  const meta = buildPageMetadata({ locale: 'kk', path: '/calendar', title: 'Күнтізбе', description: 'd' });
  assert.equal(meta.alternates?.canonical, `${SITE_URL}/kk/calendar`);
  assert.equal(meta.openGraph?.url, `${SITE_URL}/kk/calendar`);
});

test('без своей картинки берётся общая og-картинка', () => {
  const meta = buildPageMetadata({ locale: 'ru', path: '/', title: 't', description: 'd' });
  assert.deepEqual(meta.openGraph?.images, [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }]);
});

test('картинка новости становится абсолютной, тип — article с датой', () => {
  const meta = buildPageMetadata({
    locale: 'ru',
    path: '/media/news/test',
    title: 't',
    description: 'd',
    image: '/uploads/news/a.jpg',
    article: { publishedTime: '2026-10-15T07:00:00.000Z' },
  });
  assert.deepEqual(meta.openGraph?.images, [{ url: `${SITE_URL}/uploads/news/a.jpg` }]);
  assert.equal((meta.openGraph as { type?: string }).type, 'article');
  assert.equal((meta.openGraph as { publishedTime?: string }).publishedTime, '2026-10-15T07:00:00.000Z');
});

test('absoluteTitle отключает шаблон «%s | SADAQ»', () => {
  const meta = buildPageMetadata({ locale: 'ru', path: '/', title: 'Федерация', description: 'd', absoluteTitle: true });
  assert.deepEqual(meta.title, { absolute: 'Федерация' });
});

test('sitemap: на каждую страницу — запись для каждого языка с hreflang', () => {
  const lastModified = new Date('2026-10-01T00:00:00Z');
  const entries = sitemapEntries('/team/ivanov', lastModified);
  assert.deepEqual(entries.map((e) => e.url), [
    `${SITE_URL}/team/ivanov`,
    `${SITE_URL}/kk/team/ivanov`,
    `${SITE_URL}/en/team/ivanov`,
  ]);
  assert.equal(entries[0].lastModified, lastModified);
  assert.equal(entries[1].alternates?.languages?.ru, `${SITE_URL}/team/ivanov`);
});

test('описание страницы есть на всех языках, для неизвестной — описание сайта', () => {
  assert.match(pageDescription('/ranking', 'en'), /ranking/i);
  assert.equal(pageDescription('/unknown', 'kk'), pageDescription('/', 'kk'));
  assert.equal(pageDescription('/ranking', 'fr'), pageDescription('/ranking', 'ru'));
});

test('длинное описание обрезается по слову и без HTML', () => {
  const text = '<p>Слово </p>'.repeat(60);
  const result = truncateDescription(text);
  assert.ok(result.length <= 160);
  assert.ok(!result.includes('<'));
  assert.ok(result.endsWith('…'));
  assert.equal(truncateDescription('  Коротко  '), 'Коротко');
});

test('JSON-LD не даёт закрыть тег script из данных', () => {
  const json = serializeJsonLd({ headline: '</script><script>alert(1)</script>' });
  assert.ok(!json.includes('</script>'));
  assert.deepEqual(JSON.parse(json), { headline: '</script><script>alert(1)</script>' });
});
