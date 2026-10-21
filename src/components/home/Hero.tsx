"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, Trophy, Calendar, Activity, type LucideIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { HeroNewsSlider } from "./HeroNewsSlider";
import type { ComponentProps } from "react";
import { Container } from "@/components/ui/container";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Stat } from "@/components/ui/stat";
import { cardSurface } from "@/components/ui/card";
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

export function Hero({ initialSlides }: HeroProps) {
    const t = useTranslations("Hero");
    const locale = useLocale();
    const [stats, setStats] = useState<SiteStat[]>([]);
    const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent | null>(null);
    const [error, setError] = useState(false);

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
                setError(true);
                console.error('Failed to load data:', err);
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
                setError(true);
                console.error('Failed to load data:', err);
            }
        }

        fetchStats();
        fetchUpcomingEvent();
    }, []);

    const getLocalizedTitle = (event: UpcomingEvent) => {
        if (locale === "kk" && event.titleKk) return event.titleKk;
        if (locale === "en" && event.titleEn) return event.titleEn;
        return event.title;
    };


    return (
        <section className="bg-secondary">
            <Container className="py-6 md:py-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* News Slider - Left Side */}
                    <div className="lg:col-span-7">
                        <div className="relative h-[420px] overflow-hidden rounded-lg lg:h-[550px]">
                            <HeroNewsSlider initialSlides={initialSlides} />
                        </div>
                    </div>

                    {/* Stats & Info - Right Side */}
                    <div className="flex flex-col gap-6 lg:col-span-5">
                        <div className={`${cardSurface} p-6`}>
                            <h2 className="type-h3 gold-underline mb-6 text-primary">
                                {t("federation_stats")}
                            </h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                {stats.map((stat) => (
                                    <Stat
                                        key={stat.id}
                                        icon={iconMap[stat.iconType] ?? Activity}
                                        value={stat.value}
                                        label={getLocalizedLabel(stat)}
                                    />
                                ))}
                            </div>
                        </div>

                        {upcomingEvent && (
                            <div className={`${cardSurface} p-6`}>
                                <p className="type-eyebrow mb-3 flex items-center gap-2 text-gold-strong">
                                    <Calendar className="size-4" />
                                    {t("upcoming_event")}
                                </p>
                                <h3 className="type-h4 mb-2 line-clamp-2 text-primary">
                                    {getLocalizedTitle(upcomingEvent)}
                                </h3>
                                <p className="type-small text-muted-foreground">
                                    {formatDate(upcomingEvent.startDate, locale)}
                                </p>
                                <ArrowLink href="/calendar" className="mt-4">
                                    {t("view_calendar")}
                                </ArrowLink>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}
