import { titleFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = titleFromTranslations("GalleryPage");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
