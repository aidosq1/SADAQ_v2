import { titleFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = titleFromTranslations("CalendarPage");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
