"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, Trophy, Activity, type LucideIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { ComponentProps } from "react";

import { HeroNewsSlider } from "./HeroNewsSlider";
import { Container } from "@/components/ui/container";
import { ArrowLink } from "@/components/ui/arrow-link";
import { DateTile } from "@/components/ui/date-tile";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Stat } from "@/components/ui/stat";
import { formatDate } from "@/lib/date-format";

interface SiteStat {
    id: number;
    key: string;
    value: string;
    label: string;
    labelKk?: string;
    labelEn?: string;
    iconType: string;
    sortOrder: number;
}

interface UpcomingEvent {
    id: number;
    title: string;
    titleKk: string | null;
    titleEn: string | null;
    startDate: string;
}

const iconMap: Record<string, LucideIcon> = {
    mapPin: MapPin,
    users: Users,
    badge: Trophy,
    trophy: Trophy,
};

interface HeroProps {
    initialSlides?: ComponentProps<typeof HeroNewsSlider>["initialSlides"];
}

// Ближайший турнир: стеклянная карточка на фото hero
function UpcomingEventCard({ event, locale }: { event: UpcomingEvent; locale: string }) {
    const t = useTranslations("Hero");
    const title =
        (locale === "kk" && event.titleKk) || (locale === "en" && event.titleEn) || event.title;

    return (
        <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <Eyebrow tone="inverse" className="mb-4">{t("upcoming_event")}</Eyebrow>
            <div className="flex items-start gap-4">
                <DateTile date={event.startDate} locale={locale} tone="inverse" />
                <div className="min-w-0">
                    <p className="type-h4 line-clamp-2 text-white">{title}</p>
                    <p className="type-small mt-1 text-white/70" suppressHydrationWarning>
                        {formatDate(event.startDate, locale)}
                    </p>
                </div>
            </div>
            <ArrowLink href="/calendar" tone="inverse" className="mt-5">
                {t("view_calendar")}
            </ArrowLink>
        </div>
    );
}

export function Hero({ initialSlides }: HeroProps) {
    const t = useTranslations("Hero");
    const locale = useLocale();
    const [stats, setStats] = useState<SiteStat[]>([]);
    const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent | null>(null);

    const getLocalizedLabel = (stat: SiteStat) => {
        if (locale === 'kk' && stat.labelKk) return stat.labelKk;
        if (locale === 'en' && stat.labelEn) return stat.labelEn;
        return stat.label;
    };

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/stats?isActive=true");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.data) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error('Failed to load stats:', err);
            }
        }

        async function fetchUpcomingEvent() {
            try {
                const res = await fetch("/api/tournaments/featured");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setUpcomingEvent(data.data);
                }
            } catch (err) {
                console.error('Failed to load upcoming event:', err);
            }
        }

        fetchStats();
        fetchUpcomingEvent();
    }, []);

    return (
        <section aria-label={t("title")}>
            <HeroNewsSlider
                initialSlides={initialSlides}
                aside={upcomingEvent ? <UpcomingEventCard event={upcomingEvent} locale={locale} /> : undefined}
            />

            {/* Цифры федерации: белая плашка, заходящая на нижний край hero */}
            <Container className="relative z-10 -mt-16">
                <div className="grid min-h-[132px] grid-cols-2 gap-y-6 rounded-xl border bg-background px-2 py-6 shadow-raised md:grid-cols-4 md:py-7">
                    {stats.map((stat) => (
                        <Stat
                            key={stat.id}
                            icon={iconMap[stat.iconType] ?? Activity}
                            value={stat.value}
                            label={getLocalizedLabel(stat)}
                            className="border-border px-4 md:px-6 md:[&:not(:first-child)]:border-l"
                        />
                    ))}
                </div>
            </Container>
        </section>
    );
}
