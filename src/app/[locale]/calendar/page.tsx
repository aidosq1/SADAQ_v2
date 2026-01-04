"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, MapPin, Loader2, ChevronRight, Download, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    regulationUrl?: string | null;
    isFeatured: boolean;
    categories: TournamentCategory[];
}

export default function CalendarPage() {
    const t = useTranslations("CalendarPage");
    const format = useFormatter();
    const locale = useLocale();
    const router = useRouter();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="container mx-auto px-4 py-6 lg:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">{t("title")}</h1>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {tournaments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                        {t("no_tournaments") || "Турниры не найдены"}
                    </p>
                ) : (
                    tournaments.map((tournament) => {
                        const startDate = new Date(tournament.startDate);
                        const endDate = new Date(tournament.endDate);
                        const status = getTournamentStatus(tournament);

                        return (
                            <Card key={tournament.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge className={`${getStatusClasses(status)} border-0`}>
                                            {getStatusLabel(status, locale)}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {format.dateTime(startDate, { month: 'short', day: 'numeric' })}
                                            {startDate.getTime() !== endDate.getTime() &&
                                                ` - ${format.dateTime(endDate, { month: 'short', day: 'numeric' })}`
                                            }
                                        </span>
                                    </div>
                                    <Link
                                        href={`/tournaments/${tournament.id}`}
                                        className="font-bold text-lg hover:text-primary transition-colors block mb-2"
                                    >
                                        {getLocalizedTitle(tournament)}
                                    </Link>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                                        <MapPin className="h-4 w-4" />
                                        {getLocalizedLocation(tournament)}
                                    </p>
                                    {tournament.categories?.length > 0 && (
                                        <div className="mb-3">
                                            {getCategoryBadges(tournament.categories)}
                                        </div>
                                    )}
                                    <div className="flex gap-2 flex-wrap">
                                        {tournament.categories?.some(c => c.regulationUrl) && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={tournament.categories.find(c => c.regulationUrl)?.regulationUrl || "#"}
                                                    target="_blank"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    {t("btn_regulations")}
                                                </a>
                                            </Button>
                                        )}
                                        {isRegistrationAvailable(tournament) && (
                                            <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
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
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{t("th_status")}</TableHead>
                            <TableHead>{t("th_date")}</TableHead>
                            <TableHead>{t("th_title")}</TableHead>
                            <TableHead>{t("th_city")}</TableHead>
                            <TableHead>{locale === 'kk' ? 'Санаттар' : locale === 'en' ? 'Categories' : 'Категории'}</TableHead>
                            <TableHead className="text-right">{t("btn_regulations")}</TableHead>
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
                                    <TableRow
                                        key={tournament.id}
                                        className="group cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/tournaments/${tournament.id}`)}
                                    >
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
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            {(tournament.regulationUrl || isRegistrationAvailable(tournament)) ? (
                                                <div className="flex gap-2 justify-end">
                                                    {tournament.regulationUrl && (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a
                                                                href={tournament.regulationUrl}
                                                                target="_blank"
                                                                title={t("btn_regulations")}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {isRegistrationAvailable(tournament) && (
                                                        <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                                                            <Link href={`/tournaments/apply?tournamentId=${tournament.id}`}>{t("btn_apply")}</Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
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
