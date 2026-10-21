import { metadataFromTranslations } from "@/lib/page-metadata";

export const generateMetadata = metadataFromTranslations("GalleryPage", "/media/gallery");

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
