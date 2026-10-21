"use client";

import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { cardSurface } from "@/components/ui/card";
import { formatDate } from "@/lib/date-format";
import { groupProtocols, type GroupedProtocols, type Protocol } from "@/lib/results-protocols";

interface ResultsViewProps {
    // Протоколы по годам, собранные на сервере
    initialGroupedProtocols?: GroupedProtocols;
}

export default function ResultsView({ initialGroupedProtocols }: ResultsViewProps) {
    const t = useTranslations("ResultsPage");
    const locale = useLocale();
    const [groupedProtocols, setGroupedProtocols] = useState<GroupedProtocols>(initialGroupedProtocols ?? {});
    const [loading, setLoading] = useState(!initialGroupedProtocols);

    useEffect(() => {
        // Данные пришли с сервера вместе с HTML
        if (initialGroupedProtocols) return;
        async function fetchAllProtocols() {
            try {
                // Fetch tournament protocols
                const protocolsRes = await fetch('/api/protocols?limit=1000');
                const protocolsData = await protocolsRes.json();

                // Fetch document protocols (ratings section)
                const documentsRes = await fetch('/api/documents?section=ratings&isPublished=true&limit=1000');
                const documentsData = await documentsRes.json();

                setGroupedProtocols(groupProtocols(protocolsData.data?.protocols ?? [], documentsData.data ?? []));
            } catch (error) {
                console.error('Failed to fetch protocols:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAllProtocols();
    }, [initialGroupedProtocols]);

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

    const formatEventDate = (dateStr: string) => formatDate(dateStr, locale, { withYear: false });

    // Get sorted years (descending)
    const years = Object.keys(groupedProtocols).sort((a, b) => parseInt(b) - parseInt(a));

    if (loading) {
        return (
            <PageContainer>
                <PageHeader title={t("title")} />
                <LoadingState className="min-h-[400px]" />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader title={t("title")} />

            {years.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue={years[0]}>
                    {years.map((year) => (
                        <AccordionItem key={year} value={year}>
                            <AccordionTrigger className="type-h3 text-foreground hover:no-underline">
                                {year}
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className={`${cardSurface} divide-y`}>
                                    {groupedProtocols[year].map((protocol) => (
                                        <li key={`${protocol.source}-${protocol.id}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="type-h4 text-foreground">{getLocalizedTitle(protocol)}</h3>
                                                {protocol.eventDate && protocol.location && (
                                                    <p className="type-small mt-1 text-muted-foreground">
                                                        {formatEventDate(protocol.eventDate)} · {getLocalizedLocation(protocol)}
                                                    </p>
                                                )}
                                            </div>
                                            {protocol.fileUrl && (
                                                <Button size="sm" variant="outline" className="shrink-0" asChild>
                                                    <a href={protocol.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileText /> {t("btn_protocol")}
                                                    </a>
                                                </Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <EmptyState icon={FolderOpen} title={t("no_protocols")} />
            )}
        </PageContainer>
    );
}
