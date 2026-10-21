import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { RankBadge } from "@/components/ui/rank-badge";
import { PageContainer } from "@/components/ui/container";
import { BackLink } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { CATEGORIES, BOW_TYPES, GENDERS, getLocalizedLabel } from "@/lib/constants";
import { formatDate } from "@/lib/date-format";

interface NationalTeamMembership {
    id: number;
    category: string;
    gender: string;
    type: string;
    isActive: boolean;
}

interface Ranking {
    id: number;
    category: string;
    gender: string;
    type: string;
    points: number;
    rank: number;
    // Место в группе рейтинга; null — спортсмен неактивен и в рейтинге не показывается
    position: number | null;
}

interface Region {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
}

interface Athlete {
    id: number;
    slug: string;
    name: string;
    nameKk?: string;
    nameEn?: string;
    type: string;
    gender: string;
    category: string;
    dob?: string;
    regionRef?: Region;
    image?: string;
    nationalTeamMemberships?: NationalTeamMembership[];
    isActive: boolean;
    rankings: Ranking[];
}

async function getAthlete(id: string): Promise<Athlete | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/team/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data.data;
    } catch (error) {
        return null;
    }
}

const LABELS = {
    ru: { back: "Сборная команда", bestRank: "Лучший рейтинг", points: "Очки", rankings: "Рейтинги по категориям", category: "Категория", gender: "Пол", discipline: "Дисциплина", place: "Место" },
    kk: { back: "Ұлттық құрама", bestRank: "Үздік рейтинг", points: "Ұпай", rankings: "Санаттар бойынша рейтинг", category: "Санат", gender: "Жынысы", discipline: "Пән", place: "Орын" },
    en: { back: "National Team", bestRank: "Best ranking", points: "Points", rankings: "Rankings by category", category: "Category", gender: "Gender", discipline: "Discipline", place: "Place" },
} as const;

export default async function AthleteProfile({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const labels = LABELS[locale as keyof typeof LABELS] ?? LABELS.ru;
    const athlete = await getAthlete(id);

    if (!athlete) {
        notFound();
    }

    // Лучшее место среди всех групп рейтинга
    const bestRanking = athlete.rankings?.reduce((best, r) =>
        r.position !== null && (!best || best.position === null || r.position < best.position) ? r : best
    , null as Ranking | null);

    // Get region display with localization
    const getRegionDisplay = () => {
        if (athlete.regionRef) {
            if (locale === 'kk' && athlete.regionRef.nameKk) return athlete.regionRef.nameKk;
            if (locale === 'en' && athlete.regionRef.nameEn) return athlete.regionRef.nameEn;
            return athlete.regionRef.name;
        }
        return locale === 'kk' ? 'Көрсетілмеген' : locale === 'en' ? 'Not specified' : 'Не указан';
    };
    const regionDisplay = getRegionDisplay();

    const getName = () => {
        if (locale === 'kk' && athlete.nameKk) return athlete.nameKk;
        if (locale === 'en' && athlete.nameEn) return athlete.nameEn;
        return athlete.name;
    };

    const getCategoryLabel = (categoryId: string) => {
        const cat = CATEGORIES.find(c => c.id === categoryId);
        return cat ? getLocalizedLabel(cat, locale) : categoryId;
    };

    const getBowTypeLabel = (typeId: string) => {
        const type = BOW_TYPES.find(t => t.id === typeId);
        return type ? getLocalizedLabel(type, locale) : typeId;
    };

    const getGenderLabel = (genderId: string) => {
        const gender = GENDERS.find(g => g.id === genderId);
        return gender ? getLocalizedLabel(gender, locale) : genderId;
    };

    return (
        <PageContainer>
            <BackLink href="/team" label={labels.back} className="mb-6" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                {/* Left Column: Bio */}
                <div className="md:col-span-1">
                    <Card className="items-center px-6 text-center">
                        <PersonAvatar src={athlete.image} alt={getName()} className="size-48 border-4" />
                        <div className="space-y-3">
                            <h1 className="type-h2 text-foreground">{getName()}</h1>
                            <Badge variant="secondary">{regionDisplay}</Badge>
                        </div>

                        {athlete.dob && (
                            <dl className="type-small w-full border-t pt-4">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        {locale === 'kk' ? 'Туған күні' : locale === 'en' ? 'Date of birth' : 'Дата рождения'}
                                    </dt>
                                    <dd className="font-medium">{formatDate(athlete.dob, locale)}</dd>
                                </div>
                            </dl>
                        )}
                    </Card>
                </div>

                {/* Right Column: Stats & History */}
                <div className="space-y-6 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="items-center gap-2 border-primary/20 bg-secondary px-4 text-center">
                            <p className="type-eyebrow text-muted-foreground">{labels.bestRank}</p>
                            <p className="type-number text-4xl text-primary">{bestRanking?.position ? `#${bestRanking.position}` : '—'}</p>
                            {bestRanking && (
                                <p className="type-caption">{getCategoryLabel(bestRanking.category)}</p>
                            )}
                        </Card>
                        <Card className="items-center gap-2 px-4 text-center">
                            <p className="type-eyebrow text-muted-foreground">{labels.points}</p>
                            <p className="type-number text-4xl text-foreground">{bestRanking?.points || 0}</p>
                        </Card>
                    </div>

                    {athlete.rankings && athlete.rankings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="size-5 text-primary" /> {labels.rankings}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-hidden rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{labels.category}</TableHead>
                                                <TableHead>{labels.gender}</TableHead>
                                                <TableHead>{labels.discipline}</TableHead>
                                                <TableHead>{labels.place}</TableHead>
                                                <TableHead className="text-right">{labels.points}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {athlete.rankings.map((ranking) => (
                                                <TableRow key={ranking.id}>
                                                    <TableCell className="font-medium">{getCategoryLabel(ranking.category)}</TableCell>
                                                    <TableCell>{getGenderLabel(ranking.gender)}</TableCell>
                                                    <TableCell>{getBowTypeLabel(ranking.type)}</TableCell>
                                                    <TableCell>
                                                        {ranking.position ? <RankBadge position={ranking.position} /> : '—'}
                                                    </TableCell>
                                                    <TableCell className="type-number text-right text-primary">{ranking.points}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
