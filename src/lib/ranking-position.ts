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

export interface GroupedRankingEntry {
  id: number;
  rank: number;
  points: number;
  category: string;
  gender: string;
  type: string;
}

// Тот же порядок, что в /api/rankings: rank по возрастанию, затем очки по убыванию, затем id
export const RANKING_ORDER = [{ rank: 'asc' }, { points: 'desc' }, { id: 'asc' }] as const;

function compareEntries(a: GroupedRankingEntry, b: GroupedRankingEntry): number {
  return a.rank - b.rank || b.points - a.points || a.id - b.id;
}

/**
 * Место каждой записи внутри своей группы (категория + пол + тип лука).
 * Нужен для профиля спортсмена: там записи из разных групп, а позиция
 * должна совпадать с той, что видна на странице рейтинга.
 */
export function positionsById(entries: readonly GroupedRankingEntry[]): Map<number, number> {
  const groups = new Map<string, GroupedRankingEntry[]>();
  for (const entry of entries) {
    const key = `${entry.category}|${entry.gender}|${entry.type}`;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  const positions = new Map<number, number>();
  for (const group of groups.values()) {
    [...group].sort(compareEntries).forEach((entry, index) => positions.set(entry.id, index + 1));
  }
  return positions;
}
