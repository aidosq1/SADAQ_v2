/**
 * Место спортсмена в выдаче рейтинга.
 *
 * Поле `rank` в базе может иметь пропуски (запись удалили, спортсмен
 * неактивен), поэтому на сайте показываем порядковый номер в отсортированной
 * выдаче с учётом смещения страницы.
 */
export function withPositions<T extends object>(entries: readonly T[], offset: number): Array<T & { position: number }> {
  return entries.map((entry, index) => ({ ...entry, position: offset + index + 1 }));
}
