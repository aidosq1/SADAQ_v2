"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, MapPin, Loader2, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { useTranslations, useFormatter, useLocale } from "next-intl";
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
    isFeatured: boolean;
    categories: TournamentCategory[];
}

export default function CalendarPage() {
    const t = useTranslations("CalendarPage");
    const format = useFormatter();
    const locale = useLocale();
    const [filterType, setFilterType] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTournaments() {
            try {
                const params = new URLSearchParams({ limit: "50" });
                if (filterType !== "all") params.set("type", filterType);
                if (filterCategory !== "all") params.set("category", filterCategory);

                const res = await fetch(`/api/tournaments?${params}`);
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
    }, [filterType, filterCategory]);

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

    const getCategoryBadges = (categories: TournamentCategory[]) => {
        // Group categories by type
        const types = [...new Set(categories.map(c => c.type))];
        const ages = [...new Set(categories.map(c => c.category))];

        return (
            <div className="flex flex-wrap gap-1">
                {types.map(type => {
                    const typeItem = BOW_TYPES.find(t => t.id === type);
                    return (
                        <Badge key={type} variant="outline" className="text-xs">
                            {typeItem ? getLocalizedLabel(typeItem, locale) : type}
                        </Badge>
                    );
                })}
                {ages.slice(0, 2).map(age => {
                    const ageItem = CATEGORIES.find(c => c.id === age);
                    return (
                        <Badge key={age} variant="secondary" className="text-xs">
                            {ageItem ? getLocalizedLabel(ageItem, locale) : age}
                        </Badge>
                    );
                })}
                {ages.length > 2 && (
                    <Badge variant="secondary" className="text-xs">+{ages.length - 2}</Badge>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex flex-wrap gap-1">
                    <Button
                        variant={filterType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("all")}
                    >
                        {t("filter_all_disciplines")}
                    </Button>
                    {BOW_TYPES.map((type) => (
                        <Button
                            key={type.id}
                            variant={filterType === type.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType(type.id)}
                        >
                            {getLocalizedLabel(type, locale)}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-1">
                    <Button
                        variant={filterCategory === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterCategory("all")}
                    >
                        {t("all_ages")}
                    </Button>
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={filterCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterCategory(cat.id)}
                        >
                            {getLocalizedLabel(cat, locale)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Calendar List */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{t("th_status")}</TableHead>
                            <TableHead>{t("th_date")}</TableHead>
                            <TableHead>{t("th_title")}</TableHead>
                            <TableHead>{t("th_city")}</TableHead>
                            <TableHead>Категории</TableHead>
                            <TableHead className="text-right">{t("th_docs")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tournaments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t("no_tournaments") || "Турниры не найдены"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tournaments.map((tournament) => {
                                const startDate = new Date(tournament.startDate);
                                const endDate = new Date(tournament.endDate);
                                const status = getTournamentStatus(tournament);

                                return (
                                    <TableRow key={tournament.id} className="group">
                                        <TableCell>
                                            <Badge className={`${getStatusClasses(status)} whitespace-nowrap border-0`}>
                                                {getStatusLabel(status, locale)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {format.dateTime(startDate, { month: 'short', day: 'numeric' })}
                                            {startDate.getTime() !== endDate.getTime() &&
                                                ` - ${format.dateTime(endDate, { month: 'short', day: 'numeric', year: 'numeric' })}`
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/tournaments/${tournament.id}`}
                                                className="font-bold hover:text-primary transition-colors flex items-center gap-1 group-hover:underline"
                                            >
                                                {getLocalizedTitle(tournament)}
                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {getLocalizedLocation(tournament)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {tournament.categories?.length > 0 ? (
                                                getCategoryBadges(tournament.categories)
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                {tournament.categories?.some(c => c.regulationUrl) && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a
                                                            href={tournament.categories.find(c => c.regulationUrl)?.regulationUrl || "#"}
                                                            target="_blank"
                                                            title={t("btn_regulations")}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {isRegistrationAvailable(tournament) && (
                                                    <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                                                        <Link href={`/tournaments/${tournament.id}/register`}>{t("btn_apply")}</Link>
                                                    </Button>
                                                )}
                                                {status === "COMPLETED" && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/tournaments/${tournament.id}`}>
                                                            <FileText className="h-4 w-4 mr-2" /> {t("btn_protocol")}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
