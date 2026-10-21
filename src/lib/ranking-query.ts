// Запрос публичного рейтинга: одинаковый у сервера (первый рендер) и клиента (смена фильтров)
export const RANKING_SEASON = '2026';

export interface RankingFilters {
  category: string;
  gender: string;
  type: string;
}

export function rankingsQuery(filters: RankingFilters): string {
  return new URLSearchParams({
    season: RANKING_SEASON,
    type: filters.type,
    gender: filters.gender,
    category: filters.category,
    limit: '100',
  }).toString();
}
