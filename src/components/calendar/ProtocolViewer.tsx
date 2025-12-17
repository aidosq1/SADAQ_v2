"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Users, Target, Trophy, X, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProtocolViewerProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentTitle: string;
}

export function ProtocolViewer({ isOpen, onClose, tournamentTitle }: ProtocolViewerProps) {
    const [activeTab, setActiveTab] = useState("qual");
    const [filterWeapon, setFilterWeapon] = useState("Recurve");
    const [filterAge, setFilterAge] = useState("Adults");
    const [filterGender, setFilterGender] = useState("M");

    // --- Mock Data ---

    const judges = [
        { name: "Ким Константин", category: "Международная (WA)", role: "Главный судья" },
        { name: "Ли Сергей", category: "Национальная", role: "Главный секретарь" },
        { name: "Смирнова Елена", category: "1 категория", role: "Судья на линии" },
    ];

    const participants = [
        { name: "Абдуллин Ильфат", region: "Алматинская обл.", rank: "МСМК" },
        { name: "Мусаев Санжар", region: "Астана", rank: "МС" },
        { name: "Жанбырбай Даулеткельди", region: "Шымкент", rank: "МС" },
        { name: "Ганькин Денис", region: "Талдыкорган", rank: "МСМК" },
    ];

    const qualificationData = [
        { rank: 1, name: "Абдуллин Ильфат", region: "Алматинская обл.", dist1: 340, dist2: 335, total: 675, tens: 35, xs: 12 },
        { rank: 2, name: "Мусаев Санжар", region: "Астана", dist1: 338, dist2: 332, total: 670, tens: 30, xs: 10 },
        { rank: 3, name: "Жанбырбай Даулеткельди", region: "Шымкент", dist1: 335, dist2: 330, total: 665, tens: 28, xs: 8 },
        { rank: 4, name: "Ганькин Денис", region: "Талдыкорган", dist1: 330, dist2: 332, total: 662, tens: 25, xs: 9 },
    ];

    const finalRanking = [
        { rank: 1, name: "Абдуллин Ильфат", region: "Алматинская обл.", points: 100 },
        { rank: 2, name: "Мусаев Санжар", region: "Астана", points: 80 },
        { rank: 3, name: "Жанбырбай Даулеткельди", region: "Шымкент", points: 65 },
        { rank: 4, name: "Ганькин Денис", region: "Талдыкорган", points: 55 },
        { rank: 5, name: "Дузельбаев Султан", region: "Алматы", points: 45 },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* 
          Customizing DialogContent to match user's requested style::
          - max-w-5xl, w-full, max-h-[90vh]
          - rounded-xl, shadow-2xl
          - overflow-hidden (we handle scroll inside)
          - p-0 to reset default padding
          - Custom overlay effect is usually handled by <DialogOverlay> in global styles or via Shadcn primitive props.
            Shadcn Dialog primitive usually handles the Overlay. Detailed backdrop customization might need global CSS or prop depending on Shadcn version.
            Here we assume standard Shadcn Dialog behavior but override Content styles. 
       */}
            <DialogContent className="max-w-7xl w-full max-h-[90vh] p-0 rounded-xl shadow-2xl overflow-hidden flex flex-col bg-white border-0">

                {/* --- 1. HEADER (White background, p-6, border-b) --- */}
                <div className="p-6 border-b shrink-0 bg-white relative">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pr-8">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                <FileDown className="h-6 w-6 text-primary" /> {tournamentTitle}
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-1 text-muted-foreground">
                                Официальный протокол соревнований
                            </DialogDescription>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Select value={filterWeapon} onValueChange={setFilterWeapon}>
                                <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Recurve">Классический</SelectItem>
                                    <SelectItem value="Compound">Блочный</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterAge} onValueChange={setFilterAge}>
                                <SelectTrigger className="w-[120px] h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Adults">Взрослые</SelectItem>
                                    <SelectItem value="Youth">Молодёжь</SelectItem>
                                    <SelectItem value="Juniors">Юниоры</SelectItem>
                                    <SelectItem value="Cadets">Юноши</SelectItem>
                                    <SelectItem value="Cubs">Младшие юноши</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterGender} onValueChange={setFilterGender}>
                                <SelectTrigger className="w-[110px] h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Мужчины</SelectItem>
                                    <SelectItem value="F">Женщины</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Close Button Absolute */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* --- 2. TABS & CONTENT CONTAINER (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">

                        {/* Tabs Header - Light gray background as requested */}
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <TabsList className="bg-white border w-full justify-start h-auto p-1">
                                <TabsTrigger value="org" className="px-6 py-2">
                                    <Users className="w-4 h-4 mr-2" /> Организация
                                </TabsTrigger>
                                <TabsTrigger value="qual" className="px-6 py-2">
                                    <Target className="w-4 h-4 mr-2" /> Квалификация
                                </TabsTrigger>
                                <TabsTrigger value="results" className="px-6 py-2">
                                    <Trophy className="w-4 h-4 mr-2" /> Итоговый протокол
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Body */}
                        <div className="p-6">
                            <TabsContent value="org" className="mt-0 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Judges */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Users className="h-5 w-5 text-muted-foreground" /> Судейская коллегия
                                        </h3>
                                        <div className="rounded-lg border overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow>
                                                        <TableHead>ФИО</TableHead>
                                                        <TableHead>Роль</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {judges.map((j, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-medium">{j.name}</TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">{j.role}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Participants */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Users className="h-5 w-5 text-muted-foreground" /> Список участников
                                        </h3>
                                        <div className="rounded-lg border overflow-hidden">
                                            <div className="max-h-[300px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader className="bg-muted/30 sticky top-0">
                                                        <TableRow>
                                                            <TableHead>Спортсмен</TableHead>
                                                            <TableHead>Регион</TableHead>
                                                            <TableHead className="text-right">Разряд</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {participants.map((p, i) => (
                                                            <TableRow key={i}>
                                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                                <TableCell className="text-muted-foreground">{p.region}</TableCell>
                                                                <TableCell className="text-right"><Badge variant="outline">{p.rank}</Badge></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="qual" className="mt-0">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-xl font-bold">Квалификация</h3>
                                            <p className="text-sm text-muted-foreground">70 метров, 72 выстрела</p>
                                        </div>
                                        <div className="text-sm border px-3 py-1 rounded-md bg-muted/20">
                                            {filterWeapon} / {filterAge} / {filterGender === 'M' ? 'Мужчины' : 'Женщины'}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border overflow-hidden">
                                        <Table className="min-w-[700px]">
                                            <TableHeader className="bg-muted/30">
                                                <TableRow>
                                                    <TableHead className="w-[60px] text-center">#</TableHead>
                                                    <TableHead className="w-[30%]">Спортсмен</TableHead>
                                                    <TableHead>Регион</TableHead>
                                                    <TableHead className="text-right">70м (1)</TableHead>
                                                    <TableHead className="text-right">70м (2)</TableHead>
                                                    <TableHead className="text-right font-bold bg-primary/5 text-primary">Сумма</TableHead>
                                                    <TableHead className="text-right w-[80px]">10s</TableHead>
                                                    <TableHead className="text-right w-[80px]">Xs</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {qualificationData.map((q) => (
                                                    <TableRow key={q.rank} className="group">
                                                        <TableCell className="text-center font-bold bg-muted/10">{q.rank}</TableCell>
                                                        <TableCell className="font-bold">
                                                            {q.name}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{q.region}</TableCell>
                                                        <TableCell className="text-right font-mono">{q.dist1}</TableCell>
                                                        <TableCell className="text-right font-mono">{q.dist2}</TableCell>
                                                        <TableCell className="text-right font-bold text-lg bg-primary/5 text-primary">{q.total}</TableCell>
                                                        <TableCell className="text-right font-mono text-muted-foreground">{q.tens}</TableCell>
                                                        <TableCell className="text-right font-mono text-muted-foreground">{q.xs}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="results" className="mt-0">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <h3 className="text-xl font-bold">Итоговое положение</h3>
                                        <Button variant="outline" size="sm">
                                            <FileDown className="mr-2 h-4 w-4" /> Скачать результаты
                                        </Button>
                                    </div>

                                    <div className="rounded-lg border overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow>
                                                    <TableHead className="w-[80px] text-center">Место</TableHead>
                                                    <TableHead>Спортсмен</TableHead>
                                                    <TableHead>Регион</TableHead>
                                                    <TableHead className="text-right">Очки в рейтинг</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {finalRanking.map((r, i) => (
                                                    <TableRow key={r.rank} className="hover:bg-muted/50">
                                                        <TableCell className="text-center">
                                                            {i < 3 ? (
                                                                <Badge className={`text-base px-3 py-1 ${i === 0 ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-600" :
                                                                    i === 1 ? "bg-gray-400 hover:bg-gray-500 border-gray-500" :
                                                                        "bg-amber-700 hover:bg-amber-800 border-amber-800"
                                                                    }`}>
                                                                    {r.rank}
                                                                </Badge>
                                                            ) : (
                                                                <span className="font-bold text-lg text-muted-foreground">#{r.rank}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-lg">{r.name}</TableCell>
                                                        <TableCell className="text-muted-foreground">{r.region}</TableCell>
                                                        <TableCell className="text-right font-bold text-primary text-xl">+{r.points}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
