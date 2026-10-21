import { fetchApi } from "@/lib/server-api";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { uniqueAlbums } from "@/lib/gallery";
import GalleryView, { type GalleryItem } from "./GalleryView";

export default async function Page() {
  const [firstPage, allItems] = await Promise.all([
    fetchApi<GalleryItem[]>(`/api/gallery?page=1&limit=${GALLERY_PAGE_SIZE}&isPublished=true`),
    fetchApi<GalleryItem[]>("/api/gallery?limit=1000&isPublished=true"),
  ]);
  return (
    <GalleryView
      initialResponse={firstPage}
      initialAlbums={allItems ? uniqueAlbums(allItems.data) : undefined}
    />
  );
}
