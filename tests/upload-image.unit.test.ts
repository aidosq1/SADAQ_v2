/**
 * Тесты уменьшения фото при загрузке
 * Запуск: npm run test:unit
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { UPLOAD_IMAGE_MAX_SIDE, shrinkUploadImage } from '../src/lib/upload-image';

function makeImage(width: number, height: number, background = { r: 120, g: 40, b: 50 }) {
  return sharp({ create: { width, height, channels: 3, background } });
}

test('большое jpeg-фото уменьшается до 2560 px по длинной стороне и остаётся jpeg', async () => {
  const input = await makeImage(4000, 3000).jpeg().toBuffer();
  const output = await shrinkUploadImage(input, 'image/jpeg');
  const meta = await sharp(output).metadata();
  assert.equal(UPLOAD_IMAGE_MAX_SIDE, 2560);
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.width, 2560);
  assert.equal(meta.height, 1920);
});

test('png и webp уменьшаются в своём формате', async () => {
  const png = await shrinkUploadImage(await makeImage(3000, 3000).png().toBuffer(), 'image/png');
  const webp = await shrinkUploadImage(await makeImage(1000, 5000).webp().toBuffer(), 'image/webp');
  const pngMeta = await sharp(png).metadata();
  const webpMeta = await sharp(webp).metadata();
  assert.deepEqual([pngMeta.format, pngMeta.width, pngMeta.height], ['png', 2560, 2560]);
  assert.deepEqual([webpMeta.format, webpMeta.width, webpMeta.height], ['webp', 512, 2560]);
});

test('фото до 2560 px сохраняется как есть', async () => {
  const input = await makeImage(2560, 1440).jpeg().toBuffer();
  assert.equal(await shrinkUploadImage(input, 'image/jpeg'), input);
});

test('поворот с телефона применяется: вертикальное фото остаётся вертикальным', async () => {
  // Камера пишет кадр горизонтально и ставит метку поворота на 90°
  const input = await makeImage(3000, 2000).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const meta = await sharp(await shrinkUploadImage(input, 'image/jpeg')).metadata();
  assert.equal(meta.width, 1707);
  assert.equal(meta.height, 2560);
  assert.ok(!meta.orientation || meta.orientation === 1);
});

test('gif и анимированный webp не трогаются: уменьшение оставило бы один кадр', async () => {
  const gif = await makeImage(3000, 3000).gif().toBuffer();
  assert.equal(await shrinkUploadImage(gif, 'image/gif'), gif);

  // Кадры разного цвета: одинаковые кодировщик склеил бы в один
  const red = await makeImage(3000, 3000, { r: 255, g: 0, b: 0 }).png().toBuffer();
  const blue = await makeImage(3000, 3000, { r: 0, g: 0, b: 255 }).png().toBuffer();
  const animated = await sharp([red, blue], { join: { animated: true } }).webp().toBuffer();
  assert.equal((await sharp(animated).metadata()).pages, 2);
  assert.equal(await shrinkUploadImage(animated, 'image/webp'), animated);
});
