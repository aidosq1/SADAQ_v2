"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Download, CalendarX2 } from "lucide-react";
import { Link } from "@/navigation";
import { PageContainer } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { cardSurface } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { formatDateRange } from "@/lib/date-format";
import { splitByTime, groupByMonth } from "@/lib/calendar-groups";
import { CATEGORIES, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import {
    getTournamentStatus,
    getStatusLabel,
    getStatusVariant,
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
                        <Badge key={type} variant="outline">
                            {typeItem ? getLocalizedLabel(typeItem, locale) : type}
                        </Badge>
                    );
                })}
                {ages.slice(0, 2).map(age => {
                    const ageItem = CATEGORIES.find(c => c.id === age);
                    return (
                        <Badge key={age} variant="secondary">
                            {ageItem ? getLocalizedLabel(ageItem, locale) : age}
                        </Badge>
                    );
                })}
                {ages.length > 2 && (
                    <Badge variant="secondary">+{ages.length - 2}</Badge>
                )}
            </>
        );
    };

    if (loading) {
        return (
            <PageContainer>
                <PageHeader title={t("title")} />
                <LoadingState className="min-h-[400px]" />
            </PageContainer>
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
                <div className="type-small font-semibold text-primary sm:w-44 sm:shrink-0">
                    {formatDateRange(tournament.startDate, tournament.endDate, locale)}
                </div>
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/tournaments/${tournament.id}`}
                        className="type-h4 text-foreground transition-colors hover:text-primary"
                    >
                        {getLocalizedTitle(tournament)}
                    </Link>
                    <div className="type-small mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin className="size-4 shrink-0" />
                            {getLocalizedLocation(tournament)}
                        </span>
                        {tournament.categories?.length > 0 && getCategoryBadges(tournament.categories)}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                    {activeTab === "upcoming" && (
                        <Badge variant={getStatusVariant(status)}>
                            {getStatusLabel(status, locale)}
                        </Badge>
                    )}
                    {regulationUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={regulationUrl} target="_blank" rel="noopener noreferrer">
                                <Download />
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
                                <FileText /> {t("btn_protocol")}
                            </Link>
                        </Button>
                    )}
                </div>
            </li>
        );
    };

    return (
        <PageContainer>
            <PageHeader title={t("title")} />

            <ChipGroup className="mb-6">
                {tabs.map(tab => (
                    <Chip
                        key={tab.id}
                        active={activeTab === tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                    >
                        {tab.label}
                        <span className="opacity-70">{tab.count}</span>
                    </Chip>
                ))}
            </ChipGroup>

            {groups.length === 0 ? (
                <EmptyState
                    icon={CalendarX2}
                    title={activeTab === "upcoming" ? t("no_upcoming") : t("no_tournaments")}
                />
            ) : (
                <div className="space-y-6">
                    {groups.map(group => (
                        <section key={group.key} className={`${cardSurface} overflow-hidden`}>
                            <h2 className="type-eyebrow border-b bg-muted/60 px-4 py-2.5 text-muted-foreground">
                                {group.label}
                            </h2>
                            <ul className="divide-y">
                                {group.items.map(renderTournament)}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </PageContainer>
    );
}
