import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { CATEGORIES, BOW_TYPES, GENDERS, getLocalizedLabel } from "@/lib/constants";

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

export default async function AthleteProfile({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params;
    const athlete = await getAthlete(id);

    if (!athlete) {
        notFound();
    }

    const currentRanking = athlete.rankings?.[0];

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
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Bio & Equipment */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <Avatar className="w-48 h-48 mb-4 border-4 border-muted">
                                <AvatarImage src={athlete.image || undefined} alt={getName()} />
                                <AvatarFallback className="text-4xl">{getName().charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-2xl font-bold text-center mb-1">{getName()}</h1>
                            <div className="flex gap-2 mb-4 flex-wrap justify-center">
                                <Badge variant="secondary">{regionDisplay}</Badge>
                            </div>

                            <div className="w-full space-y-3 text-sm">
                                {athlete.dob && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">
                                            {locale === 'kk' ? 'Туған күні' : locale === 'en' ? 'Date of birth' : 'Дата рождения'}
                                        </span>
                                        <span className="font-medium">{athlete.dob}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Stats & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Rank & Points Dashboard */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Нац. Рейтинг</div>
                                <div className="text-4xl font-extrabold text-primary">
                                    #{currentRanking?.rank || '-'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Очки</div>
                                <div className="text-3xl font-bold">
                                    {currentRanking?.points || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rankings by Category */}
                    {athlete.rankings && athlete.rankings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Рейтинги по категориям</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Категория</TableHead>
                                            <TableHead>Пол</TableHead>
                                            <TableHead>Дисциплина</TableHead>
                                            <TableHead>Место</TableHead>
                                            <TableHead>Очки</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {athlete.rankings.map((ranking) => (
                                            <TableRow key={ranking.id}>
                                                <TableCell className="font-medium">{getCategoryLabel(ranking.category)}</TableCell>
                                                <TableCell>{getGenderLabel(ranking.gender)}</TableCell>
                                                <TableCell>{getBowTypeLabel(ranking.type)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={ranking.rank <= 3 ? "default" : "secondary"}>
                                                        #{ranking.rank}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-primary">{ranking.points}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    );
}
