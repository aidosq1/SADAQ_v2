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
import { cn } from "@/lib/utils";

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

export default function GalleryPage() {
  const t = useTranslations("GalleryPage");
  const locale = useLocale();

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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      </div>

      {/* Album Filter Tabs */}
      {albums.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAlbumChange("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              albumFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            Все
          </button>
          {albums.map((album) => (
            <button
              key={album}
              onClick={() => handleAlbumChange(album)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                albumFilter === album
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              {album}
            </button>
          ))}
        </div>
      )}

      {/* Album Cloud Link Banner */}
      {albumFilter !== "all" && items.length > 0 && items[0].cloudUrl && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Дополнительные фотографии доступны в облаке
            </span>
          </div>
          <a
            href={items[0].cloudUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Открыть в облаке
          </a>
        </div>
      )}

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">{t("no_items")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const thumbnailSrc = item.thumbnailUrl || item.url;

            return (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-muted"
                onClick={() => openLightbox(item, index)}
              >
                {thumbnailSrc ? (
                  <Image
                    src={thumbnailSrc}
                    alt={getLocalizedTitle(item, locale)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {getLocalizedTitle(item, locale)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("load_more")}...
              </>
            ) : (
              t("load_more")
            )}
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
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              {/* Navigation Arrows */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
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
                    <h3 className="text-white font-semibold text-lg">
                      {getLocalizedTitle(selectedItem, locale)}
                    </h3>
                    {(selectedItem.description ||
                      selectedItem.descriptionKk ||
                      selectedItem.descriptionEn) && (
                      <p className="text-white/70 text-sm mt-1">
                        {getLocalizedDescription(selectedItem, locale)}
                      </p>
                    )}
                    <div className="text-white/50 text-xs mt-2">
                      {currentIndex + 1} / {items.length}
                    </div>
                  </div>
                  {selectedItem.cloudUrl && (
                    <a
                      href={selectedItem.cloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Все фото в облаке
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
