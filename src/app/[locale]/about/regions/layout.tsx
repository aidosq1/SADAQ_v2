import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("RegionsPage", "/about/regions");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
