import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("DocumentsPage", "/documents");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
