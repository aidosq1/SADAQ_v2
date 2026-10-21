import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("ResultsPage", "/results");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
