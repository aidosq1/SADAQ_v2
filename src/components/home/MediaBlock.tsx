"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/states";
import { MediaCard } from "@/components/ui/media-card";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface GalleryItem {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    createdAt?: string;
}

const GALLERY_LIMIT = 5;

// Медиа на главной: первый альбом крупно, остальные — сеткой справа
export function MediaBlock() {
    const t = useTranslations("MediaBlock");
    const locale = useLocale();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch(`/api/gallery?limit=${GALLERY_LIMIT}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.data) {
                    setItems(data.data);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchGallery();
    }, []);

    const getLocalizedTitle = (item: GalleryItem) => {
        if (locale === 'kk' && item.titleKk) return item.titleKk;
        if (locale === 'en' && item.titleEn) return item.titleEn;
        return item.title;
    };

    if (loading) {
        return (
            <Section>
                <LoadingState />
            </Section>
        );
    }

    if (error || items.length === 0) {
        return null;
    }

    return (
        <Section>
            <SectionHeader
                title={t("title")}
                action={<ArrowLink href="/media/gallery">{t("all_albums")}</ArrowLink>}
            />

            <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:auto-rows-[220px] lg:grid-cols-4">
                {items.map((item, index) => (
                    <MediaCard
                        key={item.id}
                        variant="overlay"
                        href="/media/gallery"
                        title={getLocalizedTitle(item)}
                        image={item.thumbnailUrl || item.url}
                        aspect="aspect-auto"
                        size={index === 0 ? "default" : "sm"}
                        className={cn("min-h-0", index === 0 && "col-span-2 row-span-2")}
                        sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                        badge={
                            index === 0 ? (
                                <Badge variant="inverse">
                                    <ImageIcon />
                                    {t("photo_album")}
                                </Badge>
                            ) : undefined
                        }
                    />
                ))}
            </div>
        </Section>
    );
}
