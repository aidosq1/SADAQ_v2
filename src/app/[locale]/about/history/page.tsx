"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Scroll, Calendar, Trophy, Target, Medal, Loader2 } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { useTranslations, useLocale } from "next-intl";

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

const iconMap: Record<string, React.ReactNode> = {
    scroll: <Scroll className="w-6 h-6 text-yellow-600" />,
    calendar: <Calendar className="w-6 h-6 text-blue-600" />,
    trophy: <Trophy className="w-6 h-6 text-yellow-600" />,
    target: <Target className="w-6 h-6 text-blue-600" />,
    medal: <Medal className="w-6 h-6 text-yellow-600" />,
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="min-h-screen bg-background text-foreground py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                            {t("title")}
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {t("subtitle")}
                        </p>
                    </div>
                    <div className="text-center py-12 text-muted-foreground">
                        {locale === 'kk' ? 'Деректер жоқ' : locale === 'en' ? 'No data available' : 'Данные не найдены'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-16">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        {t("title")}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-[2px] bg-border -translate-x-1/2 md:translate-x-0" />

                    <div className="space-y-8">
                        {events.map((event, index) => (
                            <div key={event.id} className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="absolute left-[28px] md:left-1/2 w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center -translate-x-1/2 z-10 shadow-md top-0 md:top-1/2 md:-translate-y-1/2">
                                    {iconMap[event.iconType] || iconMap.calendar}
                                </div>
                                <div className="ml-20 md:ml-0 md:w-1/2 md:px-12 w-full">
                                    <TiltCard className="rounded-xl h-full">
                                        <Card className="bg-card border-border relative overflow-hidden group hover:shadow-lg transition-all shadow-md h-full">
                                            <CardContent className="p-8">
                                                <div className="text-primary font-bold text-xl mb-3 flex items-center gap-3">
                                                    {event.year}
                                                </div>
                                                <h3 className="text-2xl font-bold mb-4 text-foreground">
                                                    {getLocalizedTitle(event)}
                                                </h3>
                                                <p className="text-muted-foreground leading-relaxed text-base">
                                                    {getLocalizedDescription(event)}
                                                </p>
                                            </CardContent>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#800020] opacity-80" />
                                        </Card>
                                    </TiltCard>
                                </div>
                                <div className="hidden md:block md:w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
