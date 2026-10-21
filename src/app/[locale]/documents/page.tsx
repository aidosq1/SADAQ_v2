import { fetchApi } from "@/lib/server-api";
import DocumentsView, { type Document } from "./DocumentsView";

export default async function Page() {
  const response = await fetchApi<Document[]>("/api/documents?isPublished=true");
  return <DocumentsView initialDocuments={response?.data} />;
}
