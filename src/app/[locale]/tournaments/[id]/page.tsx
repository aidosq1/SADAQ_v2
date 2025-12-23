"use client";

import { useState, useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Download, Users, Trophy, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";

interface TournamentResult {
    id: number;
    place: number;
    points: number;
    score: number | null;
    athlete: {
        id: number;
        name: string;
        nameKk?: string;
        nameEn?: string;
        slug: string;
        region: string;
    };
}

interface Protocol {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    fileUrl: string | null;
}

interface TournamentCategory {
    id: number;
    category: string;
    gender: string;
    type: string;
    results: TournamentResult[];
    protocols: Protocol[];
}

interface Tournament {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    description?: string;
    descriptionKk?: string;
    descriptionEn?: string;
    startDate: string;
    endDate: string;
    location: string;
    locationKk?: string;
    locationEn?: string;
    regulationUrl?: string | null;
    isActive: boolean;
    categories: TournamentCategory[];
}

type EventStatus = "finished" | "ongoing" | "planned";

function getTournamentStatus(startDate: Date, endDate: Date): EventStatus {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now > end) return "finished";
    if (now >= start && now <= end) return "ongoing";
    return "planned";
}

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("TournamentPage");
    const format = useFormatter();
    const locale = useLocale();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("");

    useEffect(() => {
        async function fetchTournament() {
            try {
                const res = await fetch(`/api/tournaments/${id}`);
                const data = await res.json();
                if (data.success) {
                    setTournament(data.data);
                    if (data.data.categories?.length > 0) {
                        setActiveCategory(String(data.data.categories[0].id));
                    }
                } else {
                    setError(data.error || "Tournament not found");
                }
            } catch (err) {
                setError("Failed to load tournament");
            } finally {
                setLoading(false);
            }
        }
        fetchTournament();
    }, [id]);

    const getLocalizedTitle = (item: { title?: string; titleKk?: string; titleEn?: string; name?: string; nameKk?: string; nameEn?: string }) => {
        if (locale === 'kk' && (item.titleKk || item.nameKk)) return item.titleKk || item.nameKk;
        if (locale === 'en' && (item.titleEn || item.nameEn)) return item.titleEn || item.nameEn;
        return item.title || item.name || "";
    };

    const getLocalizedLocation = () => {
        if (!tournament) return "";
        if (locale === 'kk' && tournament.locationKk) return tournament.locationKk;
        if (locale === 'en' && tournament.locationEn) return tournament.locationEn;
        return tournament.location;
    };

    const getLocalizedDescription = () => {
        if (!tournament) return "";
        if (locale === 'kk' && tournament.descriptionKk) return tournament.descriptionKk;
        if (locale === 'en' && tournament.descriptionEn) return tournament.descriptionEn;
        return tournament.description || "";
    };

    const getCategoryLabel = (cat: TournamentCategory) => {
        const categoryItem = CATEGORIES.find((c) => c.id === cat.category);
        const genderItem = GENDERS.find((g) => g.id === cat.gender);
        const typeItem = BOW_TYPES.find((t) => t.id === cat.type);

        const catLabel = categoryItem ? getLocalizedLabel(categoryItem, locale) : cat.category;
        const genLabel = genderItem ? getLocalizedLabel(genderItem, locale) : cat.gender;
        const typeLabel = typeItem ? getLocalizedLabel(typeItem, locale) : cat.type;

        return `${catLabel} ${genLabel} - ${typeLabel}`;
    };

    const getShortCategoryLabel = (cat: TournamentCategory) => {
        const categoryItem = CATEGORIES.find((c) => c.id === cat.category);
        const genderItem = GENDERS.find((g) => g.id === cat.gender);
        const typeItem = BOW_TYPES.find((t) => t.id === cat.type);

        const catLabel = categoryItem ? getLocalizedLabel(categoryItem, locale) : cat.category;
        const genLabel = genderItem ? getLocalizedLabel(genderItem, locale) : cat.gender;
        const typeLabel = typeItem ? getLocalizedLabel(typeItem, locale) : cat.type;

        return `${catLabel} ${genLabel[0]} ${typeLabel}`;
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Турнир не найден</h1>
                <Button asChild>
                    <Link href="/calendar">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Вернуться к календарю
                    </Link>
                </Button>
            </div>
        );
    }

    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    const status = getTournamentStatus(startDate, endDate);

    const statusConfig = {
        finished: { label: "Завершён", color: "bg-gray-500" },
        ongoing: { label: "Идёт", color: "bg-green-500" },
        planned: { label: "Запланирован", color: "bg-blue-500" },
    };

    const activeTab = tournament.categories.find(c => String(c.id) === activeCategory);

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Back button */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/calendar">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Календарь
                </Link>
            </Button>

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Badge className={`${statusConfig[status].color} mb-2`}>
                            {statusConfig[status].label}
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-bold">{getLocalizedTitle(tournament)}</h1>
                    </div>

                    {(status === "planned" || status === "ongoing") && tournament.isActive && (
                        <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                            <Link href={`/tournaments/${tournament.id}/register`}>
                                Регистрация
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>
                            {format.dateTime(startDate, { day: 'numeric', month: 'long', year: 'numeric' })}
                            {startDate.getTime() !== endDate.getTime() &&
                                ` — ${format.dateTime(endDate, { day: 'numeric', month: 'long', year: 'numeric' })}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>{getLocalizedLocation()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>{tournament.categories?.length || 0} категорий</span>
                    </div>
                </div>

                {getLocalizedDescription() && (
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        {getLocalizedDescription()}
                    </p>
                )}

                {tournament.regulationUrl && (
                    <Button variant="outline" asChild>
                        <a href={tournament.regulationUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Регламент (положение)
                        </a>
                    </Button>
                )}
            </div>

            {/* Categories */}
            {tournament.categories?.length > 0 ? (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="h-6 w-6" />
                        Категории и результаты
                    </h2>

                    <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                        <TabsList className="flex flex-wrap h-auto gap-1">
                            {tournament.categories.map((cat) => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={String(cat.id)}
                                    className="text-xs md:text-sm"
                                >
                                    {getShortCategoryLabel(cat)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {tournament.categories.map((cat) => (
                            <TabsContent key={cat.id} value={String(cat.id)} className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{getCategoryLabel(cat)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {cat.results?.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[60px]">Место</TableHead>
                                                        <TableHead>Спортсмен</TableHead>
                                                        <TableHead>Регион</TableHead>
                                                        <TableHead className="text-right">Очки</TableHead>
                                                        {cat.results.some(r => r.score) && (
                                                            <TableHead className="text-right">Счёт</TableHead>
                                                        )}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {cat.results.map((result) => (
                                                        <TableRow key={result.id}>
                                                            <TableCell>
                                                                {result.place <= 3 ? (
                                                                    <Badge
                                                                        className={
                                                                            result.place === 1 ? "bg-yellow-500" :
                                                                            result.place === 2 ? "bg-gray-400" :
                                                                            "bg-amber-600"
                                                                        }
                                                                    >
                                                                        {result.place}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="font-medium">{result.place}</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Link
                                                                    href={`/team/${result.athlete.slug}`}
                                                                    className="font-medium hover:text-primary hover:underline"
                                                                >
                                                                    {getLocalizedTitle(result.athlete)}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {(result.athlete as any).regionRef?.name || result.athlete.region || '—'}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold">
                                                                {result.points}
                                                            </TableCell>
                                                            {cat.results.some(r => r.score) && (
                                                                <TableCell className="text-right">
                                                                    {result.score || "—"}
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">
                                                Результаты ещё не опубликованы
                                            </p>
                                        )}

                                        {/* Protocols */}
                                        {cat.protocols?.length > 0 && (
                                            <div className="mt-6 pt-6 border-t">
                                                <h4 className="font-medium mb-3">Протоколы</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {cat.protocols.map((protocol) => (
                                                        <Button
                                                            key={protocol.id}
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                            disabled={!protocol.fileUrl}
                                                        >
                                                            <a href={protocol.fileUrl || "#"} target="_blank">
                                                                <Download className="h-4 w-4 mr-2" />
                                                                {getLocalizedTitle(protocol)}
                                                            </a>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Категории турнира ещё не добавлены
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
