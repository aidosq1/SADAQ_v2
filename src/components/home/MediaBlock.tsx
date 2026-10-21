"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/states";
import { MediaCard } from "@/components/ui/media-card";
import { useTranslations, useLocale } from "next-intl";

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

export function MediaBlock() {
    const t = useTranslations("MediaBlock");
    const locale = useLocale();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch('/api/gallery?limit=4');
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => (
                    <MediaCard
                        key={item.id}
                        href="/media/gallery"
                        title={getLocalizedTitle(item)}
                        image={item.thumbnailUrl || item.url}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        badge={
                            <Badge variant="brand">
                                <ImageIcon />
                                {t("photo_album")}
                            </Badge>
                        }
                    />
                ))}
            </div>
        </Section>
    );
}
