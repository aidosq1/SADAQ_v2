import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("HistoryPage", "/about/history");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
