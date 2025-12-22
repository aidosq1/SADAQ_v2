import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target } from "lucide-react";
import { notFound } from "next/navigation";

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
    classification?: string;
}

interface Region {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
}

interface Coach {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    region?: Region;
}

interface AthleteCoach {
    id: number;
    coachId: number;
    isPrimary: boolean;
    coach: Coach;
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
    region: string;
    regionRef?: Region;
    birthYear?: number;
    image?: string;
    bio?: string;
    bioKk?: string;
    bioEn?: string;
    nationalTeamMemberships?: NationalTeamMembership[];
    coaches?: AthleteCoach[];
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

const regionNames: Record<string, string> = {
    'almaty_reg': 'Алматинская обл.',
    'astana': 'г. Астана',
    'almaty': 'г. Алматы',
    'shymkent': 'г. Шымкент',
    'west_kaz': 'Западно-Казахстанская обл.',
    'east_kaz': 'Восточно-Казахстанская обл.',
    'north_kaz': 'Северо-Казахстанская обл.',
    'karaganda': 'Карагандинская обл.',
    'kostanay': 'Костанайская обл.',
    'pavlodar': 'Павлодарская обл.',
    'akmola': 'Акмолинская обл.',
    'aktobe': 'Актюбинская обл.',
    'atyrau': 'Атырауская обл.',
    'mangystau': 'Мангистауская обл.',
    'kyzylorda': 'Кызылординская обл.',
    'turkistan': 'Туркестанская обл.',
    'zhambyl': 'Жамбылская обл.',
    'zhetisu': 'Жетісу обл.',
    'abai': 'Абайская обл.',
    'ulytau': 'Ұлытау обл.',
};

const classificationNames: Record<string, string> = {
    'International': 'МСМК (International)',
    'National': 'МС (National)',
    'Candidate': 'КМС (Candidate)',
    '1st Class': '1 разряд',
};

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
        return regionNames[athlete.region] || athlete.region || 'Не указан';
    };
    const regionDisplay = getRegionDisplay();
    const classificationDisplay = currentRanking?.classification
        ? classificationNames[currentRanking.classification] || currentRanking.classification
        : 'Не определено';

    const getName = () => {
        if (locale === 'kk' && athlete.nameKk) return athlete.nameKk;
        if (locale === 'en' && athlete.nameEn) return athlete.nameEn;
        return athlete.name;
    };

    const getCoachName = (coach: Coach) => {
        if (locale === 'kk' && coach.nameKk) return coach.nameKk;
        if (locale === 'en' && coach.nameEn) return coach.nameEn;
        return coach.name;
    };

    const getCoachesDisplay = () => {
        if (!athlete.coaches || athlete.coaches.length === 0) {
            return locale === 'kk' ? 'Көрсетілмеген' : locale === 'en' ? 'Not specified' : 'Не указан';
        }
        return athlete.coaches.map(ac => getCoachName(ac.coach)).join(', ');
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
                                <Badge className="bg-amber-500 hover:bg-amber-600">{classificationDisplay}</Badge>
                            </div>

                            <div className="w-full space-y-3 text-sm">
                                {athlete.birthYear && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Год рождения</span>
                                        <span className="font-medium">{athlete.birthYear}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Тип лука</span>
                                    <span className="font-medium">{athlete.type === 'Recurve' ? 'Классический (Recurve)' : 'Блочный (Compound)'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Категория</span>
                                    <span className="font-medium">{athlete.category}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">
                                        {locale === 'kk' ? 'Жаттықтырушы' : locale === 'en' ? 'Coach' : 'Тренер'}
                                        {athlete.coaches && athlete.coaches.length > 1 && (locale === 'kk' ? 'лар' : locale === 'en' ? 'es' : 'ы')}
                                    </span>
                                    <span className="font-medium text-primary text-right">{getCoachesDisplay()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {athlete.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> О спортсмене</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {locale === 'kk' && athlete.bioKk ? athlete.bioKk :
                                     locale === 'en' && athlete.bioEn ? athlete.bioEn :
                                     athlete.bio}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Stats & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Rank & Points Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Категория</div>
                                <div className="text-xl font-bold">{currentRanking?.category || '-'}</div>
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
                                            <TableHead>Классификация</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {athlete.rankings.map((ranking) => (
                                            <TableRow key={ranking.id}>
                                                <TableCell className="font-medium">{ranking.category}</TableCell>
                                                <TableCell>{ranking.gender === 'M' ? 'Муж' : 'Жен'}</TableCell>
                                                <TableCell>{ranking.type === 'Recurve' ? 'Классический' : 'Блочный'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={ranking.rank <= 3 ? "default" : "secondary"}>
                                                        #{ranking.rank}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-primary">{ranking.points}</TableCell>
                                                <TableCell>
                                                    {ranking.classification
                                                        ? classificationNames[ranking.classification] || ranking.classification
                                                        : '-'}
                                                </TableCell>
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
