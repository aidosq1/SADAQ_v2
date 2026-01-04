"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, Trophy, Calendar, Activity } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { HeroNewsSlider } from "./HeroNewsSlider";
import { Link } from "@/navigation";

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

const iconMap: Record<string, React.ReactNode> = {
    mapPin: <MapPin className="w-5 h-5 text-[hsl(var(--official-maroon))]" />,
    users: <Users className="w-5 h-5 text-[hsl(var(--official-maroon))]" />,
    badge: <Trophy className="w-5 h-5 text-[hsl(var(--official-maroon))]" />,
    trophy: <Trophy className="w-5 h-5 text-[hsl(var(--official-maroon))]" />,
    default: <Activity className="w-5 h-5 text-[hsl(var(--official-maroon))]" />,
};

export function Hero() {
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
                const data = await res.json();
                if (data.data) {
                    setStats(data.data);
                }
            } catch {
                // silently fail
            }
        }

        async function fetchUpcomingEvent() {
            try {
                const res = await fetch("/api/tournaments/featured");
                const data = await res.json();
                if (data.success && data.data) {
                    setUpcomingEvent(data.data);
                }
            } catch {
                // silently fail
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <section className="bg-[hsl(var(--light-cream))]">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* News Slider - Left Side */}
                    <div className="lg:col-span-7">
                        <div className="relative h-[450px] lg:h-[550px] rounded-lg overflow-hidden shadow-sm">
                            <HeroNewsSlider />
                        </div>
                    </div>

                    {/* Stats & Info - Right Side */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {/* Stats Card */}
                        <div className="bg-white rounded-lg border border-[hsl(var(--border-light))] p-6 shadow-sm">
                            <h2 className="text-lg font-heading font-semibold text-[hsl(var(--official-maroon))] mb-4 gold-accent">
                                {t("federation_stats")}
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {stats.map((stat) => (
                                    <div key={stat.id} className="text-center p-3">
                                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[hsl(var(--light-cream))] flex items-center justify-center">
                                            {iconMap[stat.iconType] || iconMap.default}
                                        </div>
                                        <div className="text-2xl font-bold font-heading text-[hsl(var(--official-maroon))]">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wide">
                                            {getLocalizedLabel(stat)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Event Card */}
                        {upcomingEvent && (
                            <div className="bg-white rounded-lg border border-[hsl(var(--border-light))] p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-[hsl(var(--official-gold))]" />
                                    <span className="text-xs font-medium text-[hsl(var(--official-gold))] uppercase tracking-wide">
                                        {t("upcoming_event")}
                                    </span>
                                </div>
                                <h3 className="font-heading font-semibold text-[hsl(var(--official-maroon))] mb-2 line-clamp-2">
                                    {getLocalizedTitle(upcomingEvent)}
                                </h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    {formatDate(upcomingEvent.startDate)}
                                </p>
                                <Link
                                    href="/calendar"
                                    className="inline-block mt-4 text-sm font-medium text-[hsl(var(--official-red))] hover:underline"
                                >
                                    {t("view_calendar")} →
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
}
