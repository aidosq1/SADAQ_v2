"use client";

import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { useTranslations, useLocale, useFormatter } from "next-intl";

interface Protocol {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    eventDate: string;
    location: string;
    locationKk?: string;
    locationEn?: string;
    fileUrl?: string;
    year: number;
}

interface GroupedProtocols {
    [year: string]: Protocol[];
}

export default function ResultsPage() {
    const t = useTranslations("ResultsPage");
    const locale = useLocale();
    const format = useFormatter();
    const [groupedProtocols, setGroupedProtocols] = useState<GroupedProtocols>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProtocols() {
            try {
                const res = await fetch('/api/protocols?limit=100');
                const data = await res.json();
                if (data.data) {
                    setGroupedProtocols(data.data.groupedByYear || {});
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        }
        fetchProtocols();
    }, []);

    const getLocalizedTitle = (protocol: Protocol) => {
        if (locale === 'kk' && protocol.titleKk) return protocol.titleKk;
        if (locale === 'en' && protocol.titleEn) return protocol.titleEn;
        return protocol.title;
    };

    const getLocalizedLocation = (protocol: Protocol) => {
        if (locale === 'kk' && protocol.locationKk) return protocol.locationKk;
        if (locale === 'en' && protocol.locationEn) return protocol.locationEn;
        return protocol.location;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return format.dateTime(date, { day: 'numeric', month: 'long' });
    };

    // Get sorted years (descending)
    const years = Object.keys(groupedProtocols).sort((a, b) => parseInt(b) - parseInt(a));

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">{t("title") || "Архив Протоколов"}</h1>

            {years.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue={years[0]}>
                    {years.map((year) => (
                        <AccordionItem key={year} value={year}>
                            <AccordionTrigger className="text-xl font-bold">
                                {t("season")} {year}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    {groupedProtocols[year].map((protocol) => (
                                        <div key={protocol.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                            <div className="mb-2 sm:mb-0">
                                                <h3 className="font-bold text-lg">{getLocalizedTitle(protocol)}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(protocol.eventDate)} • {getLocalizedLocation(protocol)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {protocol.fileUrl ? (
                                                    <>
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={protocol.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <FileText className="h-4 w-4 mr-2" /> {t("btn_protocol")}
                                                            </a>
                                                        </Button>
                                                        <Button size="sm" variant="ghost" asChild>
                                                            <a href={protocol.fileUrl} download>
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button size="sm" variant="outline" disabled>
                                                        <FileText className="h-4 w-4 mr-2" /> {t("btn_protocol")}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    {t("no_protocols")}
                </div>
            )}
        </div>
    );
}
