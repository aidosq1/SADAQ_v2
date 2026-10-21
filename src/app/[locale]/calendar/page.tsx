import { fetchApi } from "@/lib/server-api";
import CalendarView, { type Tournament } from "./CalendarView";

export default async function Page() {
    const response = await fetchApi<Tournament[]>("/api/tournaments?limit=50");
    return <CalendarView initialTournaments={response?.data} />;
}
