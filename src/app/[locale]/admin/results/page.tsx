"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Trophy,
    Save,
    Loader2,
    Plus,
    Trash2,
    RefreshCcw,
    FileText,
    Download
} from "lucide-react";
import { FileUpload } from "@/components/admin/FileUpload";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";

interface Athlete {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    region: string;
}

interface TournamentCategory {
    id: number;
    category: string;
    gender: string;
    type: string;
}

interface Tournament {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    startDate: string;
    endDate: string;
    categories: TournamentCategory[];
}

interface ResultEntry {
    athleteId: number;
    athleteName?: string;
    place: number;
    points: number;
    score?: number;
}

interface ProtocolData {
    id?: number;
    fileUrl: string;
}

// Calculate points based on place: 1=100, 2=90, 3=80... 8=30, rest=0
function calculatePoints(place: number): number {
    if (place < 1 || place > 8) return 0;
    return 100 - (place - 1) * 10;
}

export default function AdminResultsPage() {
    const locale = useLocale();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [savedResults, setSavedResults] = useState<ResultEntry[]>([]); // Track saved state
    const [protocol, setProtocol] = useState<ProtocolData>({ fileUrl: "" });
    const [savingProtocol, setSavingProtocol] = useState(false);

    // Check if there are unsaved changes
    const hasUnsavedChanges = JSON.stringify(results) !== JSON.stringify(savedResults);

    // Load tournaments
    useEffect(() => {
        async function fetchData() {
            try {
                const tournamentsRes = await fetch("/api/tournaments?limit=100");
                const tournamentsData = await tournamentsRes.json();

                if (tournamentsData.success) {
                    setTournaments(tournamentsData.data);
                }
            } catch (error) {
                toast.error("Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Load results when category changes
    useEffect(() => {
        if (selectedTournamentId && selectedCategoryId) {
            loadResults();
            loadProtocol();
        } else {
            setProtocol({ fileUrl: "" });
        }
    }, [selectedCategoryId]);

    async function loadResults() {
        try {
            const res = await fetch(`/api/tournaments/${selectedTournamentId}/results?categoryId=${selectedCategoryId}`);
            const data = await res.json();

            if (data && data.categories) {
                const category = data.categories.find((c: any) => c.id === parseInt(selectedCategoryId));
                if (category) {
                    // Extract registered athletes from approved registrations
                    const registeredAthletes: Athlete[] = [];
                    if (category.registrations) {
                        for (const reg of category.registrations) {
                            if (reg.athleteRegistrations) {
                                for (const ar of reg.athleteRegistrations) {
                                    if (ar.athlete && !registeredAthletes.some(a => a.id === ar.athlete.id)) {
                                        registeredAthletes.push({
                                            id: ar.athlete.id,
                                            name: ar.athlete.name,
                                            nameKk: ar.athlete.nameKk,
                                            nameEn: ar.athlete.nameEn,
                                            region: ar.athlete.regionRef?.name || ar.athlete.region || ''
                                        });
                                    }
                                }
                            }
                        }
                    }
                    setAthletes(registeredAthletes);

                    // Load existing results
                    if (category.results && category.results.length > 0) {
                        const loadedResults = category.results.map((r: any) => ({
                            athleteId: r.athlete.id,
                            athleteName: r.athlete.name,
                            place: r.place,
                            points: r.points,
                            score: r.score
                        }));
                        setResults(loadedResults);
                        setSavedResults(loadedResults);
                    } else {
                        // No results yet, but athletes are loaded
                        setResults([]);
                        setSavedResults([]);
                    }
                    return; // Don't reset athletes!
                }
            }
            // Only reset if no category found
            setResults([]);
            setSavedResults([]);
            setAthletes([]);
        } catch (error) {
            console.error("Error loading results:", error);
            setResults([]);
            setSavedResults([]);
            setAthletes([]);
        }
    }

    async function loadProtocol() {
        try {
            const res = await fetch(`/api/protocols?tournamentCategoryId=${selectedCategoryId}`);
            const data = await res.json();

            if (data.success && data.data.protocols.length > 0) {
                const p = data.data.protocols[0];
                setProtocol({ id: p.id, fileUrl: p.fileUrl || "" });
            } else {
                setProtocol({ fileUrl: "" });
            }
        } catch (error) {
            console.error("Error loading protocol:", error);
            setProtocol({ fileUrl: "" });
        }
    }

    async function handleSaveProtocol() {
        if (!selectedCategoryId || !protocol.fileUrl) {
            toast.error("Загрузите файл протокола");
            return;
        }

        setSavingProtocol(true);
        try {
            const tournamentData = selectedTournament;
            const categoryData = selectedCategory;

            const body = {
                title: tournamentData?.title || "Протокол",
                titleKk: tournamentData?.titleKk || "",
                titleEn: tournamentData?.titleEn || "",
                eventDate: tournamentData?.startDate || new Date().toISOString(),
                location: "Казахстан",
                year: new Date(tournamentData?.startDate || Date.now()).getFullYear(),
                fileUrl: protocol.fileUrl,
                tournamentCategoryId: parseInt(selectedCategoryId),
                isPublished: true,
            };

            const url = protocol.id ? `/api/protocols/${protocol.id}` : "/api/protocols";
            const method = protocol.id ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Протокол сохранён");
                if (!protocol.id && data.data?.id) {
                    setProtocol({ ...protocol, id: data.data.id });
                }
            } else {
                toast.error(data.error || "Ошибка сохранения протокола");
            }
        } catch (error) {
            toast.error("Ошибка сохранения протокола");
        } finally {
            setSavingProtocol(false);
        }
    }

    async function handleDeleteProtocol() {
        if (!protocol.id) return;

        try {
            const res = await fetch(`/api/protocols/${protocol.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Протокол удалён");
                setProtocol({ fileUrl: "" });
            }
        } catch (error) {
            toast.error("Ошибка удаления");
        }
    }

    const selectedTournament = tournaments.find(t => t.id === parseInt(selectedTournamentId));
    const selectedCategory = selectedTournament?.categories.find(c => c.id === parseInt(selectedCategoryId));

    const getCategoryLabel = (cat: TournamentCategory) => {
        const categoryItem = CATEGORIES.find(c => c.id === cat.category);
        const genderItem = GENDERS.find(g => g.id === cat.gender);
        const typeItem = BOW_TYPES.find(t => t.id === cat.type);

        return `${categoryItem ? getLocalizedLabel(categoryItem, locale) : cat.category} ${genderItem ? getLocalizedLabel(genderItem, locale) : cat.gender} - ${typeItem ? getLocalizedLabel(typeItem, locale) : cat.type}`;
    };

    const getLocalizedTitle = (item: { title?: string; titleKk?: string; titleEn?: string; name?: string; nameKk?: string; nameEn?: string }) => {
        if (locale === 'kk' && (item.titleKk || item.nameKk)) return item.titleKk || item.nameKk;
        if (locale === 'en' && (item.titleEn || item.nameEn)) return item.titleEn || item.nameEn;
        return item.title || item.name || "";
    };

    // Filter athletes based on selected category
    const filteredAthletes = selectedCategory
        ? athletes.filter(a =>
            // Show all athletes, but could filter by category/gender/type if needed
            !results.some(r => r.athleteId === a.id)
        )
        : [];

    function addResult() {
        const nextPlace = results.length + 1;
        setResults([
            ...results,
            {
                athleteId: 0,
                place: nextPlace,
                points: calculatePoints(nextPlace),
                score: undefined
            }
        ]);
    }

    function removeResult(index: number) {
        const newResults = results.filter((_, i) => i !== index);
        // Recalculate places
        setResults(newResults.map((r, i) => ({
            ...r,
            place: i + 1,
            points: calculatePoints(i + 1)
        })));
    }

    function updateResult(index: number, field: keyof ResultEntry, value: any) {
        setResults(prev => prev.map((r, i) => {
            if (i !== index) return r;

            const updated = { ...r, [field]: value };

            // Auto-calculate points when place changes
            if (field === 'place') {
                updated.points = calculatePoints(parseInt(value) || 0);
            }

            // Update athlete name if athleteId changes
            if (field === 'athleteId') {
                const athlete = athletes.find(a => a.id === parseInt(value));
                updated.athleteName = athlete?.name;
            }

            return updated;
        }));
    }

    async function handleSave() {
        if (!selectedCategoryId) {
            toast.error("Выберите категорию");
            return;
        }

        // Validate
        const validResults = results.filter(r => r.athleteId > 0);
        if (validResults.length === 0) {
            toast.error("Добавьте хотя бы один результат");
            return;
        }

        // Check for duplicate athletes
        const athleteIds = validResults.map(r => r.athleteId);
        if (new Set(athleteIds).size !== athleteIds.length) {
            toast.error("Один спортсмен не может быть указан дважды");
            return;
        }

        // Check for duplicate places
        const places = validResults.map(r => r.place);
        if (new Set(places).size !== places.length) {
            toast.error("Места не должны повторяться");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/tournaments/${selectedTournamentId}/results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId: parseInt(selectedCategoryId),
                    results: validResults.map(r => ({
                        athleteId: r.athleteId,
                        place: r.place,
                        score: r.score || null
                    }))
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Результаты сохранены");
                setSavedResults([...results]); // Mark as saved
            } else {
                toast.error(data.error || "Ошибка сохранения");
            }
        } catch (error) {
            toast.error("Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8" />
                Результаты турниров
            </h1>

            {/* Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Выберите турнир и категорию</CardTitle>
                    <CardDescription>
                        Результаты вводятся по категориям турнира
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Турнир</Label>
                            <Select
                                value={selectedTournamentId}
                                onValueChange={(v) => {
                                    setSelectedTournamentId(v);
                                    setSelectedCategoryId("");
                                    setResults([]);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите турнир" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tournaments.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {getLocalizedTitle(t)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Категория</Label>
                            <Select
                                value={selectedCategoryId}
                                onValueChange={setSelectedCategoryId}
                                disabled={!selectedTournament}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedTournament?.categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {getCategoryLabel(c)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Points formula info */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        <div>
                            <p className="font-medium">Формула начисления очков:</p>
                            <p className="text-sm text-muted-foreground">
                                1 место = 100, 2 = 90, 3 = 80, 4 = 70, 5 = 60, 6 = 50, 7 = 40, 8 = 30 очков.
                                Очки присваиваются автоматически.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results entry */}
            {selectedCategoryId && (
                <>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Результаты</CardTitle>
                                <CardDescription>
                                    {selectedCategory && getCategoryLabel(selectedCategory)}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={loadResults}>
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    Обновить
                                </Button>
                                <Button size="sm" onClick={addResult}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Добавить
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {results.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Нажмите "Добавить" чтобы ввести результаты
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Место</TableHead>
                                        <TableHead>Спортсмен</TableHead>
                                        <TableHead className="w-[100px]">Очки</TableHead>
                                        <TableHead className="w-[120px]">Баллы (опц.)</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={result.place}
                                                    onChange={(e) => updateResult(index, 'place', parseInt(e.target.value) || 1)}
                                                    className="w-16"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={String(result.athleteId || "")}
                                                    onValueChange={(v) => updateResult(index, 'athleteId', parseInt(v))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите спортсмена" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* Show current selection first if exists */}
                                                        {result.athleteId > 0 && (
                                                            <SelectItem value={String(result.athleteId)}>
                                                                {result.athleteName || athletes.find(a => a.id === result.athleteId)?.name}
                                                            </SelectItem>
                                                        )}
                                                        {filteredAthletes.map((a) => (
                                                            <SelectItem key={a.id} value={String(a.id)}>
                                                                {a.name} ({a.region})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={result.points > 0 ? "default" : "secondary"}
                                                    className={result.place <= 3 ? "bg-yellow-500" : ""}
                                                >
                                                    {result.points}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder="678"
                                                    value={result.score || ""}
                                                    onChange={(e) => updateResult(index, 'score', parseInt(e.target.value) || undefined)}
                                                    className="w-24"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => removeResult(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {results.length > 0 && (
                            <div className="flex items-center justify-end gap-4 mt-6">
                                {hasUnsavedChanges && (
                                    <span className="text-sm text-amber-600 font-medium">
                                        Есть несохранённые изменения
                                    </span>
                                )}
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !hasUnsavedChanges}
                                    variant={hasUnsavedChanges ? "default" : "outline"}
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {hasUnsavedChanges ? "Сохранить результаты" : "Сохранено"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Protocol Upload */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Протокол
                                </CardTitle>
                                <CardDescription>
                                    Загрузите файл протокола для этой категории
                                </CardDescription>
                            </div>
                            {protocol.fileUrl && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={protocol.fileUrl} target="_blank">
                                        <Download className="h-4 w-4 mr-2" />
                                        Скачать
                                    </a>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <FileUpload
                            value={protocol.fileUrl}
                            onChange={(url) => setProtocol({ ...protocol, fileUrl: url })}
                            label="Файл протокола"
                            folder="protocols"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />

                        <div className="flex justify-end gap-2 mt-4">
                            {protocol.id && (
                                <Button
                                    variant="outline"
                                    className="text-destructive"
                                    onClick={handleDeleteProtocol}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Удалить
                                </Button>
                            )}
                            <Button onClick={handleSaveProtocol} disabled={savingProtocol || !protocol.fileUrl}>
                                {savingProtocol ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Сохранить протокол
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                </>
            )}
        </div>
    );
}
