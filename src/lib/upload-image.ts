import sharp from 'sharp';

// Длинная сторона загруженного фото: снимки с телефона и фотоаппарата бывают по 5–6 тыс. px и 10 МБ
export const UPLOAD_IMAGE_MAX_SIDE = 2560;

const JPEG_QUALITY = 85;
const WEBP_QUALITY = 85;

// gif не трогаем: после уменьшения от анимации остался бы один кадр
const SHRINKABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Уменьшает фото больше UPLOAD_IMAGE_MAX_SIDE в том же формате, меньшие возвращает как есть
export async function shrinkUploadImage(buffer: Buffer, type: string): Promise<Buffer> {
  if (!SHRINKABLE_TYPES.includes(type)) return buffer;

  const { width, height, pages } = await sharp(buffer).metadata();
  if (!width || !height || (pages ?? 1) > 1) return buffer;
  if (Math.max(width, height) <= UPLOAD_IMAGE_MAX_SIDE) return buffer;

  // rotate() без аргументов применяет метку поворота с камеры: без неё вертикальное фото ляжет на бок
  const resized = sharp(buffer).rotate().resize({
    width: UPLOAD_IMAGE_MAX_SIDE,
    height: UPLOAD_IMAGE_MAX_SIDE,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (type === 'image/jpeg') return resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  if (type === 'image/webp') return resized.webp({ quality: WEBP_QUALITY }).toBuffer();
  return resized.png().toBuffer();
}
