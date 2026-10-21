import type { Metadata } from "next";
import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PersonPlaceholder } from "@/components/ui/person-placeholder";
import { RankBadge } from "@/components/ui/rank-badge";
import { PageContainer } from "@/components/ui/container";
import { BackLink } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { CATEGORIES, BOW_TYPES, GENDERS, getLocalizedLabel } from "@/lib/constants";
import { formatDate } from "@/lib/date-format";
import { buildPageMetadata } from "@/lib/seo";

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

const PROFILE_DESCRIPTIONS = {
    ru: (name: string) => `${name}: профиль спортсмена по стрельбе из лука — регион, места в национальном рейтинге и очки.`,
    kk: (name: string) => `${name}: садақ ату спортшысының профилі — өңірі, ұлттық рейтингтегі орны және ұпайлары.`,
    en: (name: string) => `${name}: archer profile — region, national ranking positions and points.`,
} as const;

function getLocalizedName(athlete: Athlete, locale: string): string {
    if (locale === 'kk' && athlete.nameKk) return athlete.nameKk;
    if (locale === 'en' && athlete.nameEn) return athlete.nameEn;
    return athlete.name;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
    const { id, locale } = await params;
    const athlete = await getAthlete(id);
    if (!athlete) return {};

    const name = getLocalizedName(athlete, locale);
    const describe = PROFILE_DESCRIPTIONS[locale as keyof typeof PROFILE_DESCRIPTIONS] ?? PROFILE_DESCRIPTIONS.ru;
    return buildPageMetadata({
        locale,
        path: `/team/${athlete.slug}`,
        title: name,
        description: describe(name),
        image: athlete.image,
    });
}

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

    const getName = () => getLocalizedName(athlete, locale);

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

            {/* Шапка профиля: портрет, имя, регион и главные цифры на тёмной поверхности */}
            <section className="surface-inverse grid overflow-hidden rounded-2xl md:grid-cols-12">
                <div className="relative aspect-[4/5] bg-white/5 md:col-span-5 lg:col-span-4">
                    {athlete.image ? (
                        <Image
                            src={athlete.image}
                            alt={getName()}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover object-top"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <PersonPlaceholder className="size-1/3 text-white/25" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-end gap-8 p-6 md:col-span-7 md:p-10 lg:col-span-8 lg:p-12">
                    <div>
                        <Eyebrow tone="inverse" className="mb-3">{regionDisplay}</Eyebrow>
                        <h1 className="type-h1 text-white">{getName()}</h1>
                    </div>
                    <dl className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-3">
                        <div>
                            <dt className="type-small text-white/60">{labels.bestRank}</dt>
                            <dd className="type-number mt-1 text-4xl text-gold">
                                {bestRanking?.position ? `#${bestRanking.position}` : '—'}
                            </dd>
                            {bestRanking && (
                                <dd className="type-caption mt-1 text-white/60">{getCategoryLabel(bestRanking.category)}</dd>
                            )}
                        </div>
                        <div>
                            <dt className="type-small text-white/60">{labels.points}</dt>
                            <dd className="type-number mt-1 text-4xl text-white">{bestRanking?.points || 0}</dd>
                        </div>
                        {athlete.dob && (
                            <div>
                                <dt className="type-small text-white/60">
                                    {locale === 'kk' ? 'Туған күні' : locale === 'en' ? 'Date of birth' : 'Дата рождения'}
                                </dt>
                                <dd className="mt-2 font-medium text-white">{formatDate(athlete.dob, locale)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </section>

            {athlete.rankings && athlete.rankings.length > 0 && (
                <section className="mt-10 md:mt-12">
                    <h2 className="type-h3 mb-4 flex items-center gap-2 text-foreground">
                        <Trophy className="size-5 text-primary" /> {labels.rankings}
                    </h2>
                    <div className="overflow-hidden rounded-lg border shadow-card">
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
                                        <TableCell className="type-number text-right text-base">{ranking.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            )}
        </PageContainer>
    );
}
