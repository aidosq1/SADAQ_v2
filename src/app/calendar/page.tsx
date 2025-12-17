"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { ProtocolViewer } from "@/components/calendar/ProtocolViewer";

type EventStatus = "finished" | "ongoing" | "planned" | "canceled";

interface Tournament {
    id: number;
    title: string;
    date: string;
    location: string;
    discipline: string;
    age: string;
    status: EventStatus;
}

const tournaments: Tournament[] = [
    { id: 1, title: "Зимний Чемпионат РК", date: "16-20 Декабря 2024", location: "Шымкент", discipline: "Recurve", age: "Adults", status: "finished" },
    { id: 2, title: "Кубок Федерации", date: "10-15 Декабря 2024", location: "Астана", discipline: "Compound", age: "Juniors", status: "finished" },
    { id: 3, title: "Чемпионат Азии", date: "05-12 Марта 2025", location: "Бангкок", discipline: "Recurve", age: "Adults", status: "planned" },
    { id: 4, title: "Молодежный турнир", date: "20-25 Апреля 2025", location: "Алматы", discipline: "Recurve", age: "Cadets", status: "planned" },
    { id: 5, title: "Открытый турнир 3D", date: "15 Мая 2025", location: "Алматинская обл.", discipline: "3D", age: "Adults", status: "canceled" },
];

const statusMap: Record<EventStatus, { label: string; color: string }> = {
    finished: { label: "Завершен", color: "bg-gray-500" },
    ongoing: { label: "Идет сейчас", color: "bg-green-500" },
    planned: { label: "Планируется", color: "bg-blue-500" },
    canceled: { label: "Отменен", color: "bg-red-500" },
};

export default function CalendarPage() {
    const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
    const [filterAge, setFilterAge] = useState<string>("all");
    const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

    const filteredTournaments = tournaments.filter(t => {
        if (filterDiscipline !== "all" && t.discipline !== filterDiscipline) return false;
        if (filterAge !== "all" && t.age !== filterAge) return false;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold mb-8">Календарь соревнований</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 bg-card p-6 rounded-lg border shadow-sm">
                <div className="space-y-2 w-full md:w-64">
                    <Label>Дисциплина</Label>
                    <Select onValueChange={setFilterDiscipline} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder="Все дисциплины" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все дисциплины</SelectItem>
                            <SelectItem value="Recurve">Классический лук</SelectItem>
                            <SelectItem value="Compound">Блочный лук</SelectItem>
                            <SelectItem value="3D">3D Archery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 w-full md:w-64">
                    <Label>Возраст</Label>
                    <Select onValueChange={setFilterAge} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder="Все возраста" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все возраста</SelectItem>
                            <SelectItem value="Adults">Взрослые</SelectItem>
                            <SelectItem value="Juniors">Юниоры (U21)</SelectItem>
                            <SelectItem value="Cadets">Кадеты (U18)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Calendar List */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Статус</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Название турнира</TableHead>
                            <TableHead>Город</TableHead>
                            <TableHead>Дисциплина</TableHead>
                            <TableHead className="text-right">Документы</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTournaments.map((tournament) => (
                            <TableRow key={tournament.id}>
                                <TableCell>
                                    <Badge className={`${statusMap[tournament.status].color} hover:${statusMap[tournament.status].color} whitespace-nowrap`}>
                                        {statusMap[tournament.status].label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">{tournament.date}</TableCell>
                                <TableCell className="font-bold">{tournament.title}</TableCell>
                                <TableCell><span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" />{tournament.location}</span></TableCell>
                                <TableCell>{tournament.discipline} / {tournament.age}</TableCell>
                                <TableCell className="text-right">
                                    {tournament.status === "finished" ? (
                                        <Button variant="outline" size="sm" onClick={() => setSelectedProtocol(tournament.title)}>
                                            <FileText className="h-4 w-4 mr-2" /> Протокол
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" title="Положение"><FileText className="h-4 w-4" /></Button>
                                            {tournament.status === "ongoing" || tournament.status === "planned" ? (
                                                <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                                                    <Link href="/calendar/register">Заявка</Link>
                                                </Button>
                                            ) : null}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ProtocolViewer
                isOpen={!!selectedProtocol}
                onClose={() => setSelectedProtocol(null)}
                tournamentTitle={selectedProtocol || ""}
            />
        </div>
    );
}
