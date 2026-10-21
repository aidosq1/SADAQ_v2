import { fetchApi } from "@/lib/server-api";
import { NEWS_PAGE_SIZE } from "@/lib/constants";
import NewsView, { type NewsItem } from "./NewsView";

export default async function Page() {
  const response = await fetchApi<NewsItem[]>(`/api/news?page=1&limit=${NEWS_PAGE_SIZE}`);
  return <NewsView initialResponse={response} />;
}
