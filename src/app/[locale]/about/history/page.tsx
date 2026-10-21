"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Scroll, Calendar, Trophy, Target, Medal, type LucideIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { IconTile } from "@/components/ui/icon-tile";
import { EmptyState, LoadingState } from "@/components/ui/states";

interface HistoryEvent {
    id: number;
    year: string;
    title: string;
    titleKk?: string;
    titleEn?: string;
    description: string;
    descriptionKk?: string;
    descriptionEn?: string;
    iconType: string;
    sortOrder: number;
    isActive: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    scroll: Scroll,
    calendar: Calendar,
    trophy: Trophy,
    target: Target,
    medal: Medal,
};

export default function HistoryPage() {
    const t = useTranslations("HistoryPage");
    const locale = useLocale();
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch('/api/history?limit=50');
                const data = await res.json();
                if (data.data) {
                    setEvents(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    const getLocalizedTitle = (event: HistoryEvent) => {
        if (locale === 'kk' && event.titleKk) return event.titleKk;
        if (locale === 'en' && event.titleEn) return event.titleEn;
        return event.title;
    };

    const getLocalizedDescription = (event: HistoryEvent) => {
        if (locale === 'kk' && event.descriptionKk) return event.descriptionKk;
        if (locale === 'en' && event.descriptionEn) return event.descriptionEn;
        return event.description;
    };

    if (loading) {
        return (
            <PageContainer size="narrow">
                <PageHeader title={t("title")} />
                <LoadingState className="min-h-[400px]" />
            </PageContainer>
        );
    }

    if (events.length === 0) {
        return (
            <PageContainer size="narrow">
                <PageHeader title={t("title")} />
                <EmptyState
                    icon={Scroll}
                    title={locale === 'kk' ? 'Деректер жоқ' : locale === 'en' ? 'No data available' : 'Данные не найдены'}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer size="narrow">
            <PageHeader title={t("title")} />

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-0 left-7 w-0.5 -translate-x-1/2 bg-border md:left-1/2" />

                <ol className="space-y-8">
                    {events.map((event, index) => (
                        <li key={event.id} className={`relative flex flex-col items-center gap-8 md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            <IconTile
                                icon={iconMap[event.iconType] ?? Calendar}
                                size="lg"
                                className="absolute top-0 left-7 z-10 -translate-x-1/2 border bg-background md:top-1/2 md:left-1/2 md:-translate-y-1/2"
                            />
                            <div className="ml-20 self-stretch md:ml-0 md:w-1/2 md:self-auto md:px-12">
                                <Card className="h-full py-0">
                                    <CardContent className="space-y-3 p-6 md:p-8">
                                        <p className="type-number text-xl text-gold-strong">{event.year}</p>
                                        <h2 className="type-h3 text-foreground">{getLocalizedTitle(event)}</h2>
                                        <p className="type-body text-muted-foreground">{getLocalizedDescription(event)}</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="hidden md:block md:w-1/2" />
                        </li>
                    ))}
                </ol>
            </div>
        </PageContainer>
    );
}
