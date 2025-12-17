"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Minus,
    Search,
    Trophy,
    MapPin,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { KAZAKHSTAN_REGIONS } from "@/lib/constants";

// --- Mock Data ---

type Classification = "International" | "National" | "Candidate" | "1st Class";

interface AthleteRanking {
    id: number;
    rank: number;
    prevRank: number;
    name: string;
    region: string;
    gender: "M" | "F";
    category: "Adults" | "Juniors" | "Cadets";
    weapon: "Recurve" | "Compound";
    points: number;
    classification?: Classification;
    avatarUrl?: string;
}

const rankingData: AthleteRanking[] = [
    {
        id: 1,
        rank: 1,
        prevRank: 1,
        name: "Ильфат Абдуллин",
        region: "Алматинская область",
        gender: "M",
        category: "Adults",
        weapon: "Recurve",
        points: 850,
        classification: "International",
        avatarUrl: "https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=100&h=100&fit=crop",
    },
    {
        id: 2,
        rank: 2,
        prevRank: 3,
        name: "Даулеткельди Жанбырбай",
        region: "г. Шымкент",
        gender: "M",
        category: "Adults",
        weapon: "Recurve",
        points: 780,
        classification: "National",
    },
    {
        id: 3,
        rank: 3,
        prevRank: 2,
        name: "Санжар Мусаев",
        region: "г. Астана",
        gender: "M",
        category: "Adults",
        weapon: "Recurve",
        points: 765,
        classification: "International",
    },
    {
        id: 4,
        rank: 1,
        prevRank: 1,
        name: "Андрей Тютюн",
        region: "Алматинская область",
        gender: "M",
        category: "Adults",
        weapon: "Compound",
        points: 920,
        classification: "International",
    },
    {
        id: 5,
        rank: 2,
        prevRank: 2,
        name: "Акбарали Карабаев",
        region: "г. Шымкент",
        gender: "M",
        category: "Adults",
        weapon: "Compound",
        points: 880,
        classification: "National",
    },
    {
        id: 6,
        rank: 1,
        prevRank: 4,
        name: "Алина Ильясова",
        region: "Западно-Казахстанская область",
        gender: "F",
        category: "Adults",
        weapon: "Recurve",
        points: 620,
        classification: "National",
    },
];

// --- Components ---

function TrendIcon({ current, prev }: { current: number; prev: number }) {
    if (current < prev) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (current > prev) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
}



export default function RankingPage() {
    // Filters state
    const [filterCategory, setFilterCategory] = useState<string>("Adults");
    const [filterGender, setFilterGender] = useState<string>("M");
    const [filterWeapon, setFilterWeapon] = useState<string>("Recurve");
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [filterPeriod, setFilterPeriod] = useState<string>("2025");
    const [searchQuery, setSearchQuery] = useState("");

    // Selected Athlete for Modal
    const [selectedAthlete, setSelectedAthlete] = useState<AthleteRanking | null>(null);

    // Filtering Logic
    const filteredRankings = rankingData
        .filter((a) => {
            if (filterCategory !== "all" && a.category !== filterCategory) return false;
            if (filterGender !== "all" && a.gender !== filterGender) return false;
            if (filterWeapon !== "all" && a.weapon !== filterWeapon) return false;
            if (filterRegion !== "all" && a.region !== filterRegion) return false;
            if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => b.points - a.points); // Ensure sorted by points

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div>
                <h1 className="text-4xl font-bold mb-2">Национальный Рейтинг</h1>
                <p className="text-muted-foreground text-lg">
                    Официальный рейтинг спортсменов Федерации. Обновляется автоматически по итогам турниров.
                </p>
            </div>

            {/* Control Panel */}
            <Card className="bg-muted/30">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label>Возрастная категория</Label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Adults">Взрослые</SelectItem>
                                    <SelectItem value="Juniors">Юниоры (U21)</SelectItem>
                                    <SelectItem value="Cadets">Кадеты (U18)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Пол</Label>
                            <Select value={filterGender} onValueChange={setFilterGender}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Мужчины</SelectItem>
                                    <SelectItem value="F">Женщины</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Дисциплина</Label>
                            <Select value={filterWeapon} onValueChange={setFilterWeapon}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Recurve">Классический лук</SelectItem>
                                    <SelectItem value="Compound">Блочный лук</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="space-y-2">
                            <Label>Регион</Label>
                            <Select value={filterRegion} onValueChange={setFilterRegion}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все регионы</SelectItem>
                                    {KAZAKHSTAN_REGIONS.map((region) => (
                                        <SelectItem key={region.id} value={region.name}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Период</Label>
                            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">Сезон 2025 (Текущий)</SelectItem>
                                    <SelectItem value="2024">Архив 2024</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search & Meta */}
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск спортсмена..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground hidden md:block">
                    Показано: {filteredRankings.length}
                </div>
            </div>

            {/* Ranking Grid */}
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Ранг</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                            <TableHead>Спортсмен</TableHead>
                            <TableHead>Регион</TableHead>
                            <TableHead className="text-right">Очки</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRankings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Нет данных для выбранных фильтров</TableCell>
                            </TableRow>
                        ) : (
                            filteredRankings.map((athlete, index) => (
                                <TableRow
                                    key={athlete.id}
                                    className="group cursor-pointer hover:bg-muted/50"
                                    onClick={() => setSelectedAthlete(athlete)}
                                >
                                    <TableCell className="font-bold text-lg text-center">
                                        #{index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center" title="Динамика">
                                            <TrendIcon current={index + 1} prev={athlete.prevRank} />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={athlete.avatarUrl} alt={athlete.name} />
                                                <AvatarFallback>{athlete.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold group-hover:text-primary transition-colors">{athlete.name}</span>
                                                {athlete.classification && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                                                        {athlete.classification}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{athlete.region}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-lg text-primary">
                                        {athlete.points}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/team/${athlete.id}`}>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Athlete Detail Dialog */}
            <Dialog open={!!selectedAthlete} onOpenChange={(open) => !open && setSelectedAthlete(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedAthlete && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-24 w-24 border-4 border-muted">
                                        <AvatarImage src={selectedAthlete.avatarUrl} alt={selectedAthlete.name} />
                                        <AvatarFallback className="text-2xl">{selectedAthlete.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1 pt-1">
                                        <DialogTitle className="text-2xl font-bold">{selectedAthlete.name}</DialogTitle>
                                        <DialogDescription className="text-base flex items-center gap-2">
                                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {selectedAthlete.region}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="font-bold text-primary">Ранг #{selectedAthlete.rank}</span>
                                        </DialogDescription>
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="outline">{selectedAthlete.classification || "Спортсмен"}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Основная информация</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">Тренер</span>
                                            <span className="font-medium text-primary cursor-pointer hover:underline" title="+7 (777) 000-00-00">Константин Ким</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">Вид оружия</span>
                                            <span className="font-medium">{selectedAthlete.weapon === "Recurve" ? "Классический" : "Блочный"}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">Категория</span>
                                            <span className="font-medium">{selectedAthlete.category === "Adults" ? "Взрослые" : "Молодежь"}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">Возраст</span>
                                            <span className="font-medium">26 лет</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">История очков</h3>
                                    <div className="rounded-md border text-sm">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="h-8">Турнир</TableHead>
                                                    <TableHead className="h-8 text-right">Очки</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="py-2">Зимний Чемпионат РК</TableCell>
                                                    <TableCell className="text-right py-2 font-bold text-green-600">+100</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="py-2">Кубок Федерации</TableCell>
                                                    <TableCell className="text-right py-2 font-bold text-green-600">+80</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button className="w-full sm:w-auto" asChild>
                                    <Link href={`/team/${selectedAthlete.id}`}>
                                        Перейти в полный профиль <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
