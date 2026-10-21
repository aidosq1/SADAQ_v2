"use client";

import { useState, useEffect, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Download, Users, Trophy, Building, Phone, Mail, ListX } from "lucide-react";
import { Link } from "@/navigation";
import { PageContainer } from "@/components/ui/container";
import { BackLink } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { RankBadge } from "@/components/ui/rank-badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useTranslations, useLocale } from "next-intl";
import { formatDateRange } from "@/lib/date-format";
import { getRegionName } from "@/lib/localization";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import { isRegistrationAvailable } from "@/lib/tournament-utils";

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

interface OrganizingRegion {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    address: string;
    addressKk?: string;
    addressEn?: string;
    phone: string;
    email?: string | null;
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
    isRegistrationOpen: boolean;
    registrationDeadline?: string | null;
    organizingRegion?: OrganizingRegion | null;
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

    const getLocalizedRegionName = (region: OrganizingRegion) => {
        if (locale === 'kk' && region.nameKk) return region.nameKk;
        if (locale === 'en' && region.nameEn) return region.nameEn;
        return region.name;
    };

    const getLocalizedRegionAddress = (region: OrganizingRegion) => {
        if (locale === 'kk' && region.addressKk) return region.addressKk;
        if (locale === 'en' && region.addressEn) return region.addressEn;
        return region.address;
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
            <PageContainer>
                <LoadingState className="min-h-[400px]" />
            </PageContainer>
        );
    }

    if (error || !tournament) {
        return (
            <PageContainer>
                <EmptyState
                    icon={ListX}
                    title={t("not_found")}
                    action={
                        <Button variant="outline" asChild>
                            <Link href="/calendar">{t("back_to_calendar")}</Link>
                        </Button>
                    }
                />
            </PageContainer>
        );
    }

    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    const status = getTournamentStatus(startDate, endDate);
    const canApply = isRegistrationAvailable(tournament);

    const statusConfig = {
        finished: { label: t("status_finished"), variant: "neutral" },
        ongoing: { label: t("status_ongoing"), variant: "info" },
        planned: { label: t("status_planned"), variant: "secondary" },
    } as const;

    const activeTab = tournament.categories.find(c => String(c.id) === activeCategory);
    const hasScore = activeTab?.results.some(r => r.score) ?? false;
    const protocolsWithFile = activeTab?.protocols?.filter(p => p.fileUrl) ?? [];

    return (
        <PageContainer className="space-y-8 md:space-y-10">
            {/* Header: тёмная карточка с названием, датами и действиями */}
            <div className="space-y-5">
                <BackLink href="/calendar" label={t("back_to_calendar")} />

                <section className="surface-inverse space-y-6 rounded-2xl p-6 md:p-10">
                    <div className="space-y-4">
                        <Badge variant="inverse">{statusConfig[status].label}</Badge>
                        <h1 className="type-h1 max-w-4xl text-white">{getLocalizedTitle(tournament)}</h1>
                    </div>

                    <div className="type-small flex flex-wrap gap-x-6 gap-y-2 text-white/75">
                        <span className="flex items-center gap-2">
                            <Calendar className="size-4 text-gold" />
                            {formatDateRange(startDate, endDate, locale)}
                        </span>
                        <span className="flex items-center gap-2">
                            <MapPin className="size-4 text-gold" />
                            {getLocalizedLocation()}
                        </span>
                        <span className="flex items-center gap-2">
                            <Users className="size-4 text-gold" />
                            {tournament.categories?.length || 0} {t("categories_count")}
                        </span>
                    </div>

                    {getLocalizedDescription() && (
                        <p className="type-body max-w-3xl text-white/70">{getLocalizedDescription()}</p>
                    )}

                    {(tournament.regulationUrl || canApply) && (
                        <div className="flex flex-wrap gap-3 pt-2">
                            {canApply && (
                                <Button variant="inverse" size="lg" asChild>
                                    <Link href={`/tournaments/apply?tournamentId=${tournament.id}`}>
                                        {t("registration")}
                                    </Link>
                                </Button>
                            )}
                            {tournament.regulationUrl && (
                                <Button variant="inverse-outline" size="lg" asChild>
                                    <a href={tournament.regulationUrl} target="_blank" rel="noopener noreferrer">
                                        <Download />
                                        {t("regulation")}
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Organizing Region */}
            {tournament.organizingRegion && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="size-5 text-primary" />
                            {t("organizer")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="font-semibold">{getLocalizedRegionName(tournament.organizingRegion)}</p>
                            <p className="type-small text-muted-foreground">{getLocalizedRegionAddress(tournament.organizingRegion)}</p>
                        </div>
                        <div className="type-small flex flex-wrap gap-4">
                            {tournament.organizingRegion.phone && (
                                <a
                                    href={`tel:${tournament.organizingRegion.phone}`}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                                >
                                    <Phone className="size-4" />
                                    {tournament.organizingRegion.phone}
                                </a>
                            )}
                            {tournament.organizingRegion.email && (
                                <a
                                    href={`mailto:${tournament.organizingRegion.email}`}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                                >
                                    <Mail className="size-4" />
                                    {tournament.organizingRegion.email}
                                </a>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Categories */}
            {tournament.categories?.length > 0 ? (
                <section>
                    <SectionHeader title={t("categories_title")} />

                    <ChipGroup className="mb-6">
                        {tournament.categories.map((cat) => (
                            <Chip
                                key={cat.id}
                                active={String(cat.id) === activeCategory}
                                onClick={() => setActiveCategory(String(cat.id))}
                            >
                                {getShortCategoryLabel(cat)}
                            </Chip>
                        ))}
                    </ChipGroup>

                    {activeTab && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="size-5 text-primary" />
                                    {getCategoryLabel(activeTab)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activeTab.results?.length > 0 ? (
                                    <div className="overflow-hidden rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-16">{t("place")}</TableHead>
                                                    <TableHead>{t("athlete")}</TableHead>
                                                    <TableHead>{t("region")}</TableHead>
                                                    <TableHead className="text-right">{t("points")}</TableHead>
                                                    {hasScore && <TableHead className="text-right">{t("score")}</TableHead>}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activeTab.results.map((result) => (
                                                    <TableRow key={result.id}>
                                                        <TableCell>
                                                            <RankBadge position={result.place} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Link
                                                                href={`/team/${result.athlete.slug}`}
                                                                className="font-medium text-foreground hover:text-primary"
                                                            >
                                                                {getLocalizedTitle(result.athlete)}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {getRegionName(result.athlete, locale)}
                                                        </TableCell>
                                                        <TableCell className="type-number text-right">
                                                            {result.points}
                                                        </TableCell>
                                                        {hasScore && (
                                                            <TableCell className="text-right">
                                                                {result.score || "—"}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <EmptyState title={t("results_not_published")} />
                                )}

                                {protocolsWithFile.length > 0 && (
                                    <div className="mt-6 border-t pt-6">
                                        <h3 className="type-h4 mb-3 text-foreground">{t("protocols")}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {protocolsWithFile.map((protocol) => (
                                                <Button key={protocol.id} variant="outline" size="sm" asChild>
                                                    <a href={protocol.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer">
                                                        <Download />
                                                        {getLocalizedTitle(protocol)}
                                                    </a>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </section>
            ) : (
                <EmptyState icon={ListX} title={t("no_categories")} />
            )}
        </PageContainer>
    );
}
