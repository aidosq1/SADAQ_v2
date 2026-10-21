import { fetchApi } from "@/lib/server-api";
import HistoryView, { type HistoryEvent } from "./HistoryView";

export default async function Page() {
    const response = await fetchApi<HistoryEvent[]>("/api/history?limit=50");
    return <HistoryView initialEvents={response?.data} />;
}
