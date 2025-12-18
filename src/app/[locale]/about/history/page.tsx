"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scroll, Calendar, Trophy, Target, Medal } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { useTranslations } from "next-intl";

export default function HistoryPage() {
    const t = useTranslations("HistoryPage");

    const events = [
        {
            year: t("event_bronze_year"),
            title: t("event_bronze_title"),
            description: t("event_bronze_desc"),
            icon: <Scroll className="w-6 h-6 text-yellow-600" />,
            align: "right"
        },
        {
            year: "1992",
            title: t("event_1992_title"),
            description: t("event_1992_desc"),
            icon: <Calendar className="w-6 h-6 text-blue-600" />,
            align: "left"
        },
        {
            year: "1996",
            title: t("event_1996_title"),
            description: t("event_1996_desc"),
            icon: <Trophy className="w-6 h-6 text-yellow-600" />,
            align: "right"
        },
        {
            year: "2004",
            title: t("event_2004_title"),
            description: t("event_2004_desc"),
            icon: <Target className="w-6 h-6 text-blue-600" />,
            align: "left"
        },
        {
            year: "2023-2024",
            title: t("event_2023_title"),
            description: t("event_2023_desc"),
            icon: <Medal className="w-6 h-6 text-yellow-600" />,
            align: "right",
            isLast: true
        }
    ];

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
                            <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                                {/* Timeline Icon Circle */}
                                <div className="absolute left-[28px] md:left-1/2 w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center -translate-x-1/2 z-10 shadow-md top-0 md:top-1/2 md:-translate-y-1/2">
                                    {event.icon}
                                </div>

                                {/* Content Card */}
                                <div className="ml-20 md:ml-0 md:w-1/2 md:px-12 w-full">
                                    <TiltCard className="rounded-xl h-full">
                                        <Card className="bg-card border-border relative overflow-hidden group hover:shadow-lg transition-all shadow-md h-full">
                                            <CardContent className="p-8">
                                                <div className="text-primary font-bold text-xl mb-3 flex items-center gap-3">
                                                    {event.year}
                                                </div>

                                                <h3 className="text-2xl font-bold mb-4 text-foreground">
                                                    {event.title}
                                                </h3>

                                                <p className="text-muted-foreground leading-relaxed text-base">
                                                    {event.description}
                                                </p>
                                            </CardContent>

                                            {/* Bordeaux Bottom Accent */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#800020] opacity-80" />
                                        </Card>
                                    </TiltCard>
                                </div>

                                {/* Empty space for the other side of the timeline */}
                                <div className="hidden md:block md:w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
