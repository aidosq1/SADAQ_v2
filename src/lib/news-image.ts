// Фото в тексте новости: те же ограничения, что у /api/upload, проверяем до отправки

export const NEWS_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

// Тип → допустимые расширения (первое — основное), как в ALLOWED_TYPES у /api/upload
const NEWS_IMAGE_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg', '.jfif'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

const NEWS_IMAGE_TYPES = Object.keys(NEWS_IMAGE_EXTENSIONS);

interface FileLike {
  type: string;
  size: number;
}

// Текст ошибки для тоста или null, если файл подходит
export function validateNewsImage(file: FileLike): string | null {
  if (!NEWS_IMAGE_TYPES.includes(file.type)) {
    return 'Только изображения JPG, PNG, GIF или WebP';
  }
  if (file.size > NEWS_IMAGE_MAX_BYTES) {
    return 'Фото больше 10 МБ';
  }
  return null;
}

// Картинки из вставки или перетаскивания: остальные файлы пропускаем
export function pickImageFiles<T extends { type: string }>(files: ArrayLike<T>): T[] {
  return Array.from(files).filter((file) => file.type.startsWith('image/'));
}

// Вставленные из буфера картинки браузеры называют как попало, а сервер сверяет расширение с типом
export function withImageExtension(name: string, type: string): string {
  const extensions = NEWS_IMAGE_EXTENSIONS[type];
  if (!extensions) return name;
  const dot = name.lastIndexOf('.');
  const current = dot > 0 ? name.slice(dot).toLowerCase() : '';
  if (extensions.includes(current)) return name;
  const base = (dot > 0 ? name.slice(0, dot) : name) || 'image';
  return base + extensions[0];
}
