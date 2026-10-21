import { metadataFromTranslations } from "@/lib/page-metadata";

// Подразделы (история, руководство, регионы) задают свои метаданные в своих layout
export const generateMetadata = metadataFromTranslations("Header", "/about", "about");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
