// Слайдер hero главной: переход по кругу и какие фото держать на странице

export function nextSlideIndex(current: number, count: number): number {
  return count > 0 ? (current + 1) % count : 0;
}

export function prevSlideIndex(current: number, count: number): number {
  return count > 0 ? (current - 1 + count) % count : 0;
}

// Показанные слайды: их фото уже скачаны и нужны для плавной смены
export function markSlideSeen(seen: readonly number[], index: number): readonly number[] {
  return seen.includes(index) ? seen : [...seen, index];
}

// Фото грузим, когда слайд уже показывали или он следующий: остальные не тянем при открытии страницы
export function isSlideImageMounted(
  index: number,
  seen: readonly number[],
  current: number,
  count: number
): boolean {
  return seen.includes(index) || index === nextSlideIndex(current, count);
}
