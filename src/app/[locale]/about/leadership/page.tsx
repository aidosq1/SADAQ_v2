import { fetchApi } from "@/lib/server-api";
import LeadershipView, { type Staff } from "./LeadershipView";

export default async function Page() {
    const response = await fetchApi<Staff[]>("/api/staff?limit=50");
    return <LeadershipView initialStaff={response?.data} />;
}
