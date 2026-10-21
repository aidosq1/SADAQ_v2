import { fetchApi } from "@/lib/server-api";
import RegionsView, { type Region } from "./RegionsView";

export default async function Page() {
    const response = await fetchApi<Region[]>("/api/regions?limit=50");
    return <RegionsView initialRegions={response?.data} />;
}
