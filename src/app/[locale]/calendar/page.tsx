"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Loader2, Download } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { formatDateRange } from "@/lib/date-format";
import { splitByTime, groupByMonth } from "@/lib/calendar-groups";
import { CATEGORIES, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import {
    getTournamentStatus,
    getStatusLabel,
    getStatusClasses,
    TournamentForStatus,
    isRegistrationAvailable
} from "@/lib/tournament-utils";

interface TournamentCategory {
    id: number;
    category: string;
    gender: string;
    type: string;
    regulationUrl: string | null;
}

interface Tournament extends TournamentForStatus {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    description?: string;
    location: string;
    locationKk?: string;
    locationEn?: string;
    isRegistrationOpen: boolean;
    registrationDeadline: string | Date | null;
    regulationUrl?: string | null;
    isFeatured: boolean;
    categories: TournamentCategory[];
}

type CalendarTab = "upcoming" | "past";

export default function CalendarPage() {
    const t = useTranslations("CalendarPage");
    const locale = useLocale();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<CalendarTab | null>(null);

    useEffect(() => {
        async function fetchTournaments() {
            try {
                const res = await fetch(`/api/tournaments?limit=50`);
                const data = await res.json();
                if (data.data) {
                    setTournaments(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch tournaments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTournaments();
    }, []);

    const getLocalizedTitle = (tournament: Tournament) => {
        if (locale === 'kk' && tournament.titleKk) return tournament.titleKk;
        if (locale === 'en' && tournament.titleEn) return tournament.titleEn;
        return tournament.title;
    };

    const getLocalizedLocation = (tournament: Tournament) => {
        if (locale === 'kk' && tournament.locationKk) return tournament.locationKk;
        if (locale === 'en' && tournament.locationEn) return tournament.locationEn;
        return tournament.location;
    };

    const getRegulationUrl = (tournament: Tournament) =>
        tournament.regulationUrl || tournament.categories?.find(c => c.regulationUrl)?.regulationUrl || null;

    const getCategoryBadges = (categories: TournamentCategory[]) => {
        const types = [...new Set(categories.map(c => c.type))];
        const ages = [...new Set(categories.map(c => c.category))];

        return (
            <>
                {types.map(type => {
                    const typeItem = BOW_TYPES.find(t => t.id === type);
                    return (
                        <Badge key={type} variant="outline" className="text-xs font-normal">
                            {typeItem ? getLocalizedLabel(typeItem, locale) : type}
                        </Badge>
                    );
                })}
                {ages.slice(0, 2).map(age => {
                    const ageItem = CATEGORIES.find(c => c.id === age);
                    return (
                        <Badge key={age} variant="secondary" className="text-xs font-normal">
                            {ageItem ? getLocalizedLabel(ageItem, locale) : age}
                        </Badge>
                    );
                })}
                {ages.length > 2 && (
                    <Badge variant="secondary" className="text-xs font-normal">+{ages.length - 2}</Badge>
                )}
            </>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const { upcoming, past } = splitByTime(tournaments);
    // Пока будущих турниров нет, сразу открываем прошедшие
    const activeTab: CalendarTab = selectedTab ?? (upcoming.length > 0 || past.length === 0 ? "upcoming" : "past");
    const visible = activeTab === "upcoming" ? upcoming : past;
    const groups = groupByMonth(visible, locale);

    const tabs: { id: CalendarTab; label: string; count: number }[] = [
        { id: "upcoming", label: t("tab_upcoming"), count: upcoming.length },
        { id: "past", label: t("tab_past"), count: past.length },
    ];

    const renderTournament = (tournament: Tournament) => {
        const status = getTournamentStatus(tournament);
        const regulationUrl = getRegulationUrl(tournament);
        const canApply = isRegistrationAvailable(tournament);

        return (
            <li key={tournament.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="text-sm font-semibold text-[hsl(var(--official-maroon))] sm:w-44 sm:shrink-0">
                    {formatDateRange(tournament.startDate, tournament.endDate, locale)}
                </div>
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/tournaments/${tournament.id}`}
                        className="font-semibold leading-snug hover:text-primary hover:underline"
                    >
                        {getLocalizedTitle(tournament)}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {getLocalizedLocation(tournament)}
                        </span>
                        {tournament.categories?.length > 0 && getCategoryBadges(tournament.categories)}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                    {activeTab === "upcoming" && (
                        <Badge className={`${getStatusClasses(status)} whitespace-nowrap border-0`}>
                            {getStatusLabel(status, locale)}
                        </Badge>
                    )}
                    {regulationUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={regulationUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                {t("btn_regulations")}
                            </a>
                        </Button>
                    )}
                    {canApply && (
                        <Button size="sm" asChild>
                            <Link href={`/tournaments/apply?tournamentId=${tournament.id}`}>{t("btn_apply")}</Link>
                        </Button>
                    )}
                    {status === "COMPLETED" && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/tournaments/${tournament.id}`}>
                                <FileText className="h-4 w-4 mr-1" /> {t("btn_protocol")}
                            </Link>
                        </Button>
                    )}
                </div>
            </li>
        );
    };

    return (
        <div className="container mx-auto px-4 py-6 lg:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">{t("title")}</h1>

            <div className="flex gap-1 mb-6" role="tablist">
                {tabs.map(tab => (
                    <Button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        variant={activeTab === tab.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTab(tab.id)}
                    >
                        {tab.label}
                        <span className="ml-1.5 opacity-70">{tab.count}</span>
                    </Button>
                ))}
            </div>

            {groups.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                    {activeTab === "upcoming" ? t("no_upcoming") : t("no_tournaments")}
                </p>
            ) : (
                <div className="space-y-6">
                    {groups.map(group => (
                        <section key={group.key} className="overflow-hidden rounded-lg border bg-card">
                            <h2 className="border-b bg-muted/40 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {group.label}
                            </h2>
                            <ul className="divide-y">
                                {group.items.map(renderTournament)}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
