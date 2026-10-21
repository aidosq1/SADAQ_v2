import { fetchApi } from "@/lib/server-api";
import { groupProtocols, type RawProtocol, type RawRatingDocument } from "@/lib/results-protocols";
import ResultsView from "./ResultsView";

export default async function Page() {
    const [protocols, documents] = await Promise.all([
        fetchApi<{ protocols: RawProtocol[] }>("/api/protocols?limit=1000"),
        fetchApi<RawRatingDocument[]>("/api/documents?section=ratings&isPublished=true&limit=1000"),
    ]);
    // Хотя бы один запрос не удался — клиент загрузит всё сам, как раньше
    const initialGroupedProtocols = protocols && documents
        ? groupProtocols(protocols.data.protocols ?? [], documents.data)
        : undefined;
    return <ResultsView initialGroupedProtocols={initialGroupedProtocols} />;
}
