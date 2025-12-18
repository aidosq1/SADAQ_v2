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
import { useTranslations, useFormatter } from "next-intl";

type EventStatus = "finished" | "ongoing" | "planned" | "canceled";

export default function CalendarPage() {
    const t = useTranslations("CalendarPage");
    const format = useFormatter();
    const [filterDiscipline, setFilterDiscipline] = useState<string>("all");
    const [filterAge, setFilterAge] = useState<string>("all");
    const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

    // In a real app, this would come from an API based on the locale.
    // Simulating localized data for the demo:
    const tournaments = [
        {
            id: 1,
            title: t("event_winter_champ"),
            startDate: new Date(2024, 11, 16),
            endDate: new Date(2024, 11, 20),
            location: t("city_shymkent"),
            discipline: "Recurve",
            age: "Adults",
            status: "finished" as EventStatus
        },
        {
            id: 2,
            title: t("event_fed_cup"),
            startDate: new Date(2024, 11, 10),
            endDate: new Date(2024, 11, 15),
            location: t("city_astana"),
            discipline: "Compound",
            age: "Juniors",
            status: "finished" as EventStatus
        },
        {
            id: 3,
            title: t("event_asian_champ"),
            startDate: new Date(2025, 2, 5),
            endDate: new Date(2025, 2, 12),
            location: t("city_bangkok"),
            discipline: "Recurve",
            age: "Adults",
            status: "planned" as EventStatus
        },
        {
            id: 4,
            title: t("event_youth"),
            startDate: new Date(2025, 3, 20),
            endDate: new Date(2025, 3, 25),
            location: t("city_almaty"),
            discipline: "Recurve",
            age: "Cadets",
            status: "planned" as EventStatus
        },
    ];

    const filteredTournaments = tournaments.filter(t => {
        if (filterDiscipline !== "all" && t.discipline !== filterDiscipline) return false;
        if (filterAge !== "all" && t.age !== filterAge) return false;
        return true;
    });

    const statusMap: Record<EventStatus, { label: string; color: string }> = {
        finished: { label: t("status_finished"), color: "bg-gray-500" },
        ongoing: { label: t("status_ongoing"), color: "bg-green-500" },
        planned: { label: t("status_planned"), color: "bg-blue-500" },
        canceled: { label: t("status_canceled"), color: "bg-red-500" },
    };

    const getStatusLabel = (status: EventStatus) => {
        switch (status) {
            case "finished": return t("status_finished");
            case "ongoing": return t("status_ongoing");
            case "planned": return t("status_planned");
            case "canceled": return t("status_canceled");
            default: return status;
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 bg-card p-6 rounded-lg border shadow-sm">
                <div className="space-y-2 w-full md:w-64">
                    <Label>{t("filter_discipline")}</Label>
                    <Select onValueChange={setFilterDiscipline} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder={t("filter_all_disciplines")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("filter_all_disciplines")}</SelectItem>
                            <SelectItem value="Recurve">{t("disc_recurve")}</SelectItem>
                            <SelectItem value="Compound">{t("disc_compound")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 w-full md:w-64">
                    <Label>{t("filter_age")}</Label>
                    <Select onValueChange={setFilterAge} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder={t("all_ages")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("all_ages")}</SelectItem>
                            <SelectItem value="Adults">{t("age_adults")}</SelectItem>
                            <SelectItem value="Juniors">{t("age_juniors")}</SelectItem>
                            <SelectItem value="Cadets">{t("age_cadets")}</SelectItem>
                            <SelectItem value="Youth">{t("age_youth")}</SelectItem>
                            <SelectItem value="Cubs">{t("age_cubs")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Calendar List */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{t("th_status")}</TableHead>
                            <TableHead>{t("th_date")}</TableHead>
                            <TableHead>{t("th_title")}</TableHead>
                            <TableHead>{t("th_city")}</TableHead>
                            <TableHead>{t("th_discipline")}</TableHead>
                            <TableHead className="text-right">{t("th_docs")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTournaments.map((tournament) => (
                            <TableRow key={tournament.id}>
                                <TableCell>
                                    <Badge className={`${statusMap[tournament.status].color} hover:${statusMap[tournament.status].color} whitespace-nowrap`}>
                                        {getStatusLabel(tournament.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">
                                    {format.dateTime(tournament.startDate, { month: 'short', day: 'numeric' })}
                                    {tournament.startDate.getTime() !== tournament.endDate.getTime() &&
                                        ` - ${format.dateTime(tournament.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}`
                                    }
                                </TableCell>
                                <TableCell className="font-bold">{tournament.title}</TableCell>
                                <TableCell><span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" />{tournament.location}</span></TableCell>
                                <TableCell>
                                    {tournament.discipline === "Recurve" ? t("disc_recurve") :
                                        tournament.discipline === "Compound" ? t("disc_compound") : tournament.discipline}
                                    {" / "}
                                    {tournament.age === "Adults" ? t("age_adults") :
                                        tournament.age === "Juniors" ? t("age_juniors") :
                                            tournament.age === "Cadets" ? t("age_cadets") :
                                                tournament.age === "Youth" ? t("age_youth") :
                                                    tournament.age === "Cubs" ? t("age_cubs") : tournament.age}
                                </TableCell>
                                <TableCell className="text-right">
                                    {tournament.status === "finished" ? (
                                        <Button variant="outline" size="sm" onClick={() => setSelectedProtocol(tournament.title)}>
                                            <FileText className="h-4 w-4 mr-2" /> {t("btn_protocol")}
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" title={t("btn_regulations")}><FileText className="h-4 w-4" /></Button>
                                            {tournament.status === "ongoing" || tournament.status === "planned" ? (
                                                <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                                                    <Link href="/calendar/register">{t("btn_apply")}</Link>
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
