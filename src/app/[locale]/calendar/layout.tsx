import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("CalendarPage", "/calendar");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
