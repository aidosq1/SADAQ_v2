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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Data ---

type Classification = "International" | "National" | "Candidate" | "1st Class";

interface AthleteRanking {
    id: number;
    rank: number;
    prevRank: number;
    name: string;
    region: string;
    gender: "M" | "F";
    category: "Adults" | "Youth" | "Juniors" | "Cadets" | "Cubs";
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
        region: "almaty_reg",
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
        region: "shymkent",
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
        region: "astana",
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
        region: "almaty_reg",
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
        region: "shymkent",
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
        region: "west_kaz",
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



// ... imports
import { useTranslations } from "next-intl";

// ... helper components and types ...

export default function RankingPage() {
    const t = useTranslations("RankingPage");
    const t_regions = useTranslations("Regions");

    // Filters state
    const [filterCategory, setFilterCategory] = useState<string>("Adults");
    const [filterGender, setFilterGender] = useState<string>("M");
    const [filterWeapon, setFilterWeapon] = useState<string>("Recurve");
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [filterPeriod, setFilterPeriod] = useState<string>("2025");
    const [searchQuery, setSearchQuery] = useState("");

    // Selected Athlete for Modal
    const [selectedAthlete, setSelectedAthlete] = useState<AthleteRanking | null>(null);

    // Filtering Logic (same as before)
    const filteredRankings = rankingData
        // ... filter logic ...
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
                <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
                <p className="text-muted-foreground text-lg">
                    {t("subtitle")}
                </p>
            </div>

            {/* Control Panel */}
            <Card className="bg-muted/30">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label>{t("filter_age_category")}</Label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Adults">{t("age_adults")}</SelectItem>
                                    <SelectItem value="Youth">{t("age_youth")}</SelectItem>
                                    <SelectItem value="Juniors">{t("age_juniors")}</SelectItem>
                                    <SelectItem value="Cadets">{t("age_cadets")}</SelectItem>
                                    <SelectItem value="Cubs">{t("age_cubs")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("filter_gender")}</Label>
                            <Select value={filterGender} onValueChange={setFilterGender}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">{t("gender_male")}</SelectItem>
                                    <SelectItem value="F">{t("gender_female")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("filter_discipline")}</Label>
                            <Select value={filterWeapon} onValueChange={setFilterWeapon}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Recurve">{t("disc_recurve")}</SelectItem>
                                    <SelectItem value="Compound">{t("disc_compound")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="space-y-2">
                            <Label>{t("filter_region")}</Label>
                            <Select value={filterRegion} onValueChange={setFilterRegion}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("all_regions")}</SelectItem>
                                    {KAZAKHSTAN_REGIONS.map((region) => (
                                        <SelectItem key={region.id} value={region.name}>
                                            {t_regions(region.id)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("filter_period")}</Label>
                            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">{t("period_current")}</SelectItem>
                                    <SelectItem value="2024">{t("period_archive_2024")}</SelectItem>
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
                        placeholder={t("search_placeholder")}
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground hidden md:block">
                    {t("shown_label")}: {filteredRankings.length}
                </div>
            </div>

            {/* Ranking Grid */}
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px] text-center">{t("th_rank")}</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                            <TableHead>{t("th_athlete")}</TableHead>
                            <TableHead>{t("th_region")}</TableHead>
                            <TableHead className="text-right">{t("th_points")}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRankings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">{t("no_data")}</TableCell>
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
                                        <div className="flex justify-center" title={t("trend_tooltip")}>
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
                                    <TableCell>{t_regions(athlete.region as any)}</TableCell>
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
                                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t_regions(selectedAthlete.region as any)}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="font-bold text-primary">{t("rank_label")} #{selectedAthlete.rank}</span>
                                        </DialogDescription>
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="outline">{selectedAthlete.classification || t("athlete_fallback")}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t("dialog_info_title")}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">{t("dialog_coach")}</span>
                                            <span className="font-medium text-primary cursor-pointer hover:underline" title="+7 (777) 000-00-00">Константин Ким</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">{t("dialog_weapon")}</span>
                                            <span className="font-medium">{selectedAthlete.weapon === "Recurve" ? t("disc_recurve") : t("disc_compound")}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">{t("dialog_category")}</span>
                                            <span className="font-medium">
                                                {selectedAthlete.category === "Adults" ? t("age_adults") :
                                                    selectedAthlete.category === "Youth" ? t("age_youth") :
                                                        selectedAthlete.category === "Juniors" ? t("age_juniors") :
                                                            selectedAthlete.category === "Cadets" ? t("age_cadets") :
                                                                selectedAthlete.category === "Cubs" ? t("age_cubs") : selectedAthlete.category}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="text-muted-foreground">{t("dialog_age")}</span>
                                            <span className="font-medium">26 {t("years")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t("dialog_history_title")}</h3>
                                    <div className="h-[200px] w-full rounded-md border p-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={[
                                                    { name: 'Янв', points: 650 },
                                                    { name: 'Фев', points: 680 },
                                                    { name: 'Мар', points: 720 },
                                                    { name: 'Апр', points: 750 },
                                                    { name: 'Май', points: selectedAthlete.points },
                                                ]}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 12 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    hide
                                                    domain={['dataMin - 100', 'dataMax + 100']}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="points"
                                                    stroke="var(--primary)" // Use CSS variable
                                                    strokeWidth={3}
                                                    dot={{ fill: "var(--primary)", r: 4, strokeWidth: 0 }}
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                    animationDuration={2000}
                                                    animationEasing="ease-in-out"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button className="w-full sm:w-auto" asChild>
                                    <Link href={`/team/${selectedAthlete.id}`}>
                                        {t("btn_full_profile")} <ArrowRight className="ml-2 h-4 w-4" />
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
