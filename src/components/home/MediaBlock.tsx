"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

    useEffect(() => {
        async function fetchGallery() {
            try {
                const res = await fetch('/api/gallery?limit=4');
                const data = await res.json();
                if (data.data) {
                    setItems(data.data);
                }
            } catch {
                // silently fail
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
            <div className="flex flex-col h-full items-center justify-center min-h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--official-maroon))]" />
            </div>
        );
    }

    return (
        <section className="py-16 bg-[hsl(var(--light-cream))]">
            <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <span className="text-xs font-medium text-[hsl(var(--official-gold))] uppercase tracking-wider mb-2 block">
                        {t("photo_album")}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-[hsl(var(--official-maroon))] gold-accent">
                        {t("title")}
                    </h2>
                </div>
                <Link
                    href="/media/gallery"
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-[hsl(var(--official-red))] hover:underline"
                >
                    {t("all_albums")} <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Grid - 4 equal columns like NewsBlock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href="/media/gallery"
                        className="group bg-white border border-[hsl(var(--border-light))] rounded-lg overflow-hidden hover-lift"
                    >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                            <Image
                                src={item.thumbnailUrl || item.url}
                                alt={getLocalizedTitle(item)}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            {/* Type Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="official-badge flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    {t("photo_album")}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-heading font-semibold text-[hsl(var(--official-maroon))] leading-snug line-clamp-2 group-hover:text-[hsl(var(--official-red))] transition-colors">
                                {getLocalizedTitle(item)}
                            </h3>
                        </div>
                    </Link>
                ))}

                {/* Placeholder items if less than 4 */}
                {items.length < 4 && items.length > 0 && (
                    [...Array(4 - items.length)].map((_, i) => (
                        <Link
                            key={`placeholder-${i}`}
                            href="/media/gallery"
                            className="group bg-[hsl(var(--light-cream))] border border-[hsl(var(--border-light))] rounded-lg overflow-hidden hover-lift"
                        >
                            <div className="relative h-48 overflow-hidden bg-[hsl(var(--light-cream))] flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-[hsl(var(--muted-foreground))]" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-heading font-semibold text-[hsl(var(--muted-foreground))] leading-snug">
                                    {t("photo_album")}
                                </h3>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Mobile CTA */}
            <div className="mt-8 md:hidden text-center">
                <Link
                    href="/media/gallery"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--official-maroon))] text-white font-medium rounded-lg hover:bg-[hsl(var(--official-maroon))]/90 transition-colors"
                >
                    {t("all_albums")} <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            </div>
        </section>
    );
}
