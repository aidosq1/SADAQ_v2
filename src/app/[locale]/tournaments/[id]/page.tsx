import { fetchApi } from "@/lib/server-api";
import TournamentView, { type Tournament } from "./TournamentView";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
    const { id } = await params;
    const response = await fetchApi<Tournament>(`/api/tournaments/${encodeURIComponent(id)}`);
    return <TournamentView id={id} initialTournament={response?.data} />;
}
