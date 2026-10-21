"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { EmptyState, LoadingState } from "@/components/ui/states";

interface GalleryItem {
  id: number;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string | null;
  cloudUrl?: string | null;
  albumName?: string | null;
  eventDate?: string | null;
}

function getLocalizedTitle(item: GalleryItem, locale: string): string {
  if (locale === "kk" && item.titleKk) return item.titleKk;
  if (locale === "en" && item.titleEn) return item.titleEn;
  return item.title;
}

function getLocalizedDescription(item: GalleryItem, locale: string): string {
  if (locale === "kk" && item.descriptionKk) return item.descriptionKk;
  if (locale === "en" && item.descriptionEn) return item.descriptionEn;
  return item.description || "";
}

interface GalleryResponse {
  success: boolean;
  data: GalleryItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

const GALLERY_LABELS = {
  ru: { all: "Все", openCloud: "Открыть в облаке", allInCloud: "Все фото в облаке" },
  kk: { all: "Барлығы", openCloud: "Бұлтта ашу", allInCloud: "Барлық фото бұлтта" },
  en: { all: "All", openCloud: "Open in cloud", allInCloud: "All photos in cloud" },
} as const;

export default function GalleryPage() {
  const t = useTranslations("GalleryPage");
  const locale = useLocale();
  const labels = GALLERY_LABELS[locale as keyof typeof GALLERY_LABELS] ?? GALLERY_LABELS.ru;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [albumFilter, setAlbumFilter] = useState<string>("all");
  const [albums, setAlbums] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Lightbox state
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const ITEMS_PER_PAGE = 12;

  // Fetch unique album names
  const fetchAlbums = useCallback(async () => {
    try {
      const res = await fetch(`/api/gallery?limit=1000&isPublished=true`);
      const data: GalleryResponse = await res.json();
      if (data.success) {
        const uniqueAlbums = [...new Set(
          data.data
            .map((item) => item.albumName)
            .filter((name): name is string => !!name)
        )];
        setAlbums(uniqueAlbums);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const fetchGallery = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          isPublished: "true",
        });

        if (albumFilter !== "all") {
          params.append("album", albumFilter);
        }

        const res = await fetch(`/api/gallery?${params}`);
        const data: GalleryResponse = await res.json();

        if (data.success) {
          if (reset) {
            setItems(data.data);
          } else {
            setItems((prev) => [...prev, ...data.data]);
          }
          if (data.meta) {
            const calculatedTotalPages = Math.ceil(data.meta.total / data.meta.limit);
            setTotalPages(calculatedTotalPages);
          }
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [albumFilter]
  );

  useEffect(() => {
    fetchGallery(1, true);
  }, [fetchGallery]);

  function handleAlbumChange(value: string) {
    setAlbumFilter(value);
    setPage(1);
  }

  function handleLoadMore() {
    if (page < totalPages) {
      fetchGallery(page + 1, false);
    }
  }

  function openLightbox(item: GalleryItem, index: number) {
    setSelectedItem(item);
    setCurrentIndex(index);
  }

  function closeLightbox() {
    setSelectedItem(null);
  }

  function navigateLightbox(direction: "prev" | "next") {
    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + items.length) % items.length
        : (currentIndex + 1) % items.length;
    setCurrentIndex(newIndex);
    setSelectedItem(items[newIndex]);
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedItem) return;
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "Escape") closeLightbox();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, currentIndex, items]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={t("title")} />
        <LoadingState />
      </PageContainer>
    );
  }

  const cloudUrl = albumFilter !== "all" && items.length > 0 ? items[0].cloudUrl : null;

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        actions={
          cloudUrl && (
            <Button asChild>
              <a href={cloudUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                {labels.openCloud}
              </a>
            </Button>
          )
        }
      />

      {albums.length > 0 && (
        <ChipGroup className="mb-6">
          <Chip active={albumFilter === "all"} onClick={() => handleAlbumChange("all")}>
            {labels.all}
          </Chip>
          {albums.map((album) => (
            <Chip key={album} active={albumFilter === album} onClick={() => handleAlbumChange(album)}>
              {album}
            </Chip>
          ))}
        </ChipGroup>
      )}

      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title={t("no_items")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {items.map((item, index) => {
            const thumbnailSrc = item.thumbnailUrl || item.url;

            return (
              <button
                key={item.id}
                type="button"
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                onClick={() => openLightbox(item, index)}
              >
                {thumbnailSrc ? (
                  <Image
                    src={thumbnailSrc}
                    alt={getLocalizedTitle(item, locale)}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="size-10 text-muted-foreground/50" />
                  </span>
                )}

                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="type-small line-clamp-2 font-medium text-white">
                    {getLocalizedTitle(item, locale)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {page < totalPages && (
        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 className="animate-spin" />}
            {t("load_more")}
          </Button>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none">
          {selectedItem && (
            <div className="relative w-full h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                aria-label="Close"
                className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Navigation Arrows */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox("prev")}
                    aria-label="Previous"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
                    aria-label="Next"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </button>
                </>
              )}

              {/* Content */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-full h-full">
                  <Image
                    src={selectedItem.url}
                    alt={getLocalizedTitle(selectedItem, locale)}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 bg-black/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="type-h4 text-white">
                      {getLocalizedTitle(selectedItem, locale)}
                    </h3>
                    {(selectedItem.description ||
                      selectedItem.descriptionKk ||
                      selectedItem.descriptionEn) && (
                      <p className="text-white/70 text-sm mt-1">
                        {getLocalizedDescription(selectedItem, locale)}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-white/70">
                      {currentIndex + 1} / {items.length}
                    </div>
                  </div>
                  {selectedItem.cloudUrl && (
                    <a
                      href={selectedItem.cloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {labels.allInCloud}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
