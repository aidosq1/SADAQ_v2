import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("LeadershipPage", "/about/leadership");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
