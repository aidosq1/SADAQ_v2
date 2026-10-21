import { fetchApi } from "@/lib/server-api";
import AboutView, { type Partner, type SiteContent, type SiteStat } from "./AboutView";

export default async function Page() {
    const [stats, partners, content] = await Promise.all([
        fetchApi<SiteStat[]>("/api/stats?isActive=true"),
        fetchApi<Partner[]>("/api/partners?isActive=true"),
        fetchApi<SiteContent[]>("/api/content?section=about"),
    ]);
    // Хотя бы один запрос не удался — клиент загрузит всё сам, как раньше
    const initialData = stats && partners && content
        ? { stats: stats.data, partners: partners.data, content: content.data }
        : undefined;
    return <AboutView initialData={initialData} />;
}
