import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("NewsPage", "/media/news");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
