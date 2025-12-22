"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, ArrowRight, MapPin, ChevronRight } from "lucide-react";
import { useTranslations, useLocale, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import { getTournamentStatus, TournamentStatus, getStatusLabel as getUtilStatusLabel, getStatusClasses } from "@/lib/tournament-utils";

interface TournamentCategory {
    id: number;
    category: string;
    gender: string;
    type: string;
}

interface Tournament {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    startDate: string;
    endDate: string;
    location: string;
    locationKk?: string;
    locationEn?: string;
    isRegistrationOpen: boolean;
    registrationDeadline?: string | null;
    categories?: TournamentCategory[];
}

export function CalendarWidget() {
    const t = useTranslations("CalendarWidget");
    const locale = useLocale();
    const format = useFormatter();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTournaments() {
            try {
                const res = await fetch('/api/tournaments?limit=10');
                const data = await res.json();
                if (data.data) {
                    setTournaments(data.data);
                }
            } catch {
                // silently fail
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

    const formatDateRange = (start: Date, end: Date) => {
        const startStr = format.dateTime(start, { day: 'numeric', month: 'short' });
        const endStr = format.dateTime(end, { day: 'numeric', month: 'short' });
        return `${startStr} - ${endStr}`;
    };

    const getDisplayStatus = (status: TournamentStatus) => {
        // Use translations for display, fallback to utility labels
        switch (status) {
            case "COMPLETED": return t("status_past");
            case "IN_PROGRESS": return t("status_current");
            case "REGISTRATION_OPEN": return t("status_future");
            case "REGISTRATION_CLOSED": return t("status_future");
            default: return getUtilStatusLabel(status, locale);
        }
    };

    const getStatusStyles = (status: TournamentStatus) => {
        switch (status) {
            case "COMPLETED": return "bg-gray-100 text-gray-600 border-gray-200";
            case "IN_PROGRESS": return "bg-green-50 text-green-700 border-green-200";
            case "REGISTRATION_OPEN": return "bg-blue-50 text-blue-700 border-blue-200";
            case "REGISTRATION_CLOSED": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const getCategoryTypes = (categories?: TournamentCategory[]) => {
        if (!categories || categories.length === 0) return [];
        const types = [...new Set(categories.map(c => c.type))];
        return types.map(type => {
            const typeItem = BOW_TYPES.find(t => t.id === type);
            return typeItem ? getLocalizedLabel(typeItem, locale) : type;
        });
    };

    const tournamentsWithStatus = tournaments
        .map(t => ({
            ...t,
            status: getTournamentStatus(t)
        }))
        .filter(t => t.status !== "COMPLETED")
        .slice(0, 4);

    if (loading) {
        return (
            <div className="flex flex-col h-full justify-center items-center min-h-[300px]">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--official-navy))]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-[hsl(var(--official-navy))] gold-accent">
                        {t("title")}
                    </h2>
                </div>
                <Link
                    href="/calendar"
                    className="hidden sm:flex items-center gap-2 text-sm font-medium text-[hsl(var(--official-blue))] hover:underline"
                >
                    {t("all_events")} <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Events List */}
            <div className="space-y-3 mt-4">
                {tournamentsWithStatus.map((tournament) => (
                    <Link
                        key={tournament.id}
                        href={`/tournaments/${tournament.id}`}
                        className={`block p-4 rounded-lg border ${getStatusStyles(tournament.status)} hover-lift group transition-all`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">
                                {getDisplayStatus(tournament.status)}
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <h3 className="font-heading font-semibold text-sm mb-2 line-clamp-1 group-hover:text-[hsl(var(--official-blue))] transition-colors">
                            {getLocalizedTitle(tournament)}
                        </h3>

                        {/* Category badges */}
                        {tournament.categories && tournament.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {getCategoryTypes(tournament.categories).map((type, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 text-xs opacity-70">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {formatDateRange(new Date(tournament.startDate), new Date(tournament.endDate))}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {getLocalizedLocation(tournament)}
                            </span>
                        </div>
                    </Link>
                ))}

                {tournamentsWithStatus.length === 0 && (
                    <div className="p-4 text-center text-[hsl(var(--muted-foreground))]">
                        {t("no_events") || "Нет запланированных событий"}
                    </div>
                )}
            </div>

            {/* Mobile View All */}
            <div className="mt-4 sm:hidden text-center">
                <Link
                    href="/calendar"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--official-blue))]"
                >
                    {t("all_events")} <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
