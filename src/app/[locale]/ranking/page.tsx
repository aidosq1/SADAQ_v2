import { fetchApi } from "@/lib/server-api";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { rankingsQuery } from "@/lib/ranking-query";
import RankingView, { type RankingEntry } from "./RankingView";

export default async function Page() {
  const response = await fetchApi<RankingEntry[]>(`/api/rankings?${rankingsQuery(DEFAULT_FILTERS)}`);
  return <RankingView initialRankings={response?.data} />;
}
