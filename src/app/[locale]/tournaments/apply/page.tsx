"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect, SearchableSelectItem } from "@/components/ui/SearchableSelect";
import { AddCoachDialog, NewCoachData } from "@/components/registration/AddCoachDialog";
import { AddJudgeDialog, NewJudgeData } from "@/components/registration/AddJudgeDialog";
import {
    Calendar,
    MapPin,
    Loader2,
    Shield,
    UserCheck,
    Plus,
    Trash2,
    Lock,
    CheckCircle,
    ClipboardList,
    Trophy,
    ChevronRight,
    Send,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CATEGORIES, BOW_TYPES, GENDERS, getLocalizedLabel } from "@/lib/constants";

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
    location: string;
    locationKk?: string;
    locationEn?: string;
    isActive: boolean;
    status: string;
    registrationDeadline?: string;
    requiresVerification: boolean;
    categories: TournamentCategory[];
}

interface Athlete {
    id: number;
    name: string;
    iin?: string;
    gender: string;
    region?: { name: string };
}

interface Coach {
    id: number;
    name: string;
    region?: { name: string };
}

interface Judge {
    id: number;
    name: string;
    category: string;
    region?: { name: string };
}

interface Participant {
    id: number;
    athleteId: number | null;
    coachId: number | null;
    newCoach?: NewCoachData;
}

interface JudgeEntry {
    id: number;
    judgeId: number | null;
    newJudge?: NewJudgeData;
}

export default function TournamentApplyPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const format = useFormatter();
    const locale = useLocale();
    const t = useTranslations("Common");

    // Loading states
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tournaments
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

    // Selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Data lists
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);

    // Form state - теперь массив судей
    const [judgeEntries, setJudgeEntries] = useState<JudgeEntry[]>([
        { id: 1, judgeId: null }
    ]);
    const [participants, setParticipants] = useState<Participant[]>([
        { id: 1, athleteId: null, coachId: null }
    ]);

    // Default coach for bulk adding
    const [defaultCoachId, setDefaultCoachId] = useState<number | null>(null);

    // Dialog state
    const [showAddCoach, setShowAddCoach] = useState(false);
    const [showAddJudge, setShowAddJudge] = useState(false);
    const [currentParticipantId, setCurrentParticipantId] = useState<number | null>(null);
    const [currentJudgeEntryId, setCurrentJudgeEntryId] = useState<number | null>(null);

    // Existing registration check
    const [existingRegistration, setExistingRegistration] = useState<{ registrationNumber: string } | null>(null);
    const [checkingRegistration, setCheckingRegistration] = useState(false);

    // Fetch tournaments with open registration
    useEffect(() => {
        async function fetchTournaments() {
            try {
                const res = await fetch("/api/tournaments?status=REGISTRATION_OPEN");
                if (res.ok) {
                    const data = await res.json();
                    setTournaments(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch tournaments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTournaments();
    }, []);

    // Fetch athletes, coaches, judges
    useEffect(() => {
        async function fetchData() {
            try {
                const [athletesRes, coachesRes, judgesRes] = await Promise.all([
                    fetch('/api/team?all=true&limit=500'),
                    fetch('/api/coaches?admin=true&limit=500'),
                    fetch('/api/judges?admin=true&limit=500')
                ]);

                if (athletesRes.ok) {
                    const data = await athletesRes.json();
                    setAthletes(data.data || data || []);
                }
                if (coachesRes.ok) {
                    const data = await coachesRes.json();
                    setCoaches(data.data || data || []);
                }
                if (judgesRes.ok) {
                    const data = await judgesRes.json();
                    setJudges(data.data || data || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        }
        fetchData();
    }, []);

    // Selected tournament
    const selectedTournament = useMemo(() =>
        tournaments.find(t => t.id.toString() === selectedTournamentId),
        [tournaments, selectedTournamentId]
    );

    // Helper functions
    const getLocalizedTitle = (item: { title?: string; titleKk?: string; titleEn?: string }) => {
        if (locale === 'kk' && item.titleKk) return item.titleKk;
        if (locale === 'en' && item.titleEn) return item.titleEn;
        return item.title;
    };

    const getLocalizedLocation = (item: { location: string; locationKk?: string; locationEn?: string }) => {
        if (locale === 'kk' && item.locationKk) return item.locationKk;
        if (locale === 'en' && item.locationEn) return item.locationEn;
        return item.location;
    };

    const getCategoryLabel = (cat: TournamentCategory) => {
        const categoryItem = CATEGORIES.find(c => c.id === cat.category);
        const genderItem = GENDERS.find(g => g.id === cat.gender);
        const typeItem = BOW_TYPES.find(t => t.id === cat.type);

        return `${categoryItem ? getLocalizedLabel(categoryItem, locale) : cat.category} ${genderItem ? getLocalizedLabel(genderItem, locale) : cat.gender} - ${typeItem ? getLocalizedLabel(typeItem, locale) : cat.type}`;
    };

    // No filtering - show all athletes
    const filteredAthletes = athletes;

    // Convert to SearchableSelectItem format
    const athleteItems: SearchableSelectItem[] = filteredAthletes.map(a => ({
        id: a.id,
        name: a.name,
        subtitle: a.iin ? `ИИН: ${a.iin}` : a.region?.name,
    }));

    const coachItems: SearchableSelectItem[] = coaches.map(c => ({
        id: c.id,
        name: c.name,
        subtitle: c.region?.name,
    }));

    const judgeItems: SearchableSelectItem[] = judges.map(j => ({
        id: j.id,
        name: j.name,
        subtitle: j.category,
    }));

    // Handlers
    const handleTournamentSelect = (tournamentId: string) => {
        setSelectedTournamentId(tournamentId);
        setSelectedCategoryId("");
        setExistingRegistration(null);
        // Reset form when tournament changes
        setJudgeEntries([{ id: 1, judgeId: null }]);
        setParticipants([{ id: 1, athleteId: null, coachId: null }]);
    };

    // Check for existing registration when category is selected
    const handleCategorySelect = async (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setExistingRegistration(null);

        if (!categoryId) return;

        setCheckingRegistration(true);
        try {
            const res = await fetch(`/api/registrations?my=true`);
            if (res.ok) {
                const registrations = await res.json();
                // Only block if there's a PENDING or APPROVED registration (not REJECTED)
                const existing = registrations.find(
                    (r: any) => r.tournamentCategoryId === parseInt(categoryId) &&
                               r.status !== 'REJECTED'
                );
                if (existing) {
                    setExistingRegistration({ registrationNumber: existing.registrationNumber });
                    toast.error(`Вы уже подали заявку на эту категорию (${existing.registrationNumber})`);
                }
            }
        } catch (error) {
            console.error("Failed to check existing registration:", error);
        } finally {
            setCheckingRegistration(false);
        }
    };

    // Judge handlers
    const addJudgeEntry = () => {
        setJudgeEntries([
            ...judgeEntries,
            { id: Date.now(), judgeId: null }
        ]);
    };

    const removeJudgeEntry = (id: number) => {
        if (judgeEntries.length > 1) {
            setJudgeEntries(judgeEntries.filter(j => j.id !== id));
        }
    };

    const updateJudgeEntry = (id: number, judgeId: number | null) => {
        setJudgeEntries(prev => prev.map(j => {
            if (j.id !== id) return j;
            return { ...j, judgeId, newJudge: undefined };
        }));
    };

    const handleAddNewJudge = (data: NewJudgeData) => {
        if (currentJudgeEntryId !== null) {
            setJudgeEntries(prev => prev.map(j => {
                if (j.id !== currentJudgeEntryId) return j;
                return { ...j, judgeId: null, newJudge: data };
            }));
        }
        setCurrentJudgeEntryId(null);
    };

    const getJudgeEntryDisplay = (entry: JudgeEntry) => {
        if (entry.newJudge) {
            return <Badge variant="secondary">{entry.newJudge.name} (новый)</Badge>;
        }
        if (entry.judgeId) {
            const judge = judges.find(j => j.id === entry.judgeId);
            return judge?.name || `ID: ${entry.judgeId}`;
        }
        return null;
    };

    const addParticipant = () => {
        setParticipants([
            ...participants,
            { id: Date.now(), athleteId: null, coachId: defaultCoachId }
        ]);
    };

    const addMultipleParticipants = (count: number) => {
        const newParticipants = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            athleteId: null,
            coachId: defaultCoachId
        }));
        setParticipants([...participants, ...newParticipants]);
    };

    const applyDefaultCoachToAll = () => {
        if (!defaultCoachId) return;
        setParticipants(prev => prev.map(p => ({
            ...p,
            coachId: p.coachId || defaultCoachId,
            newCoach: p.coachId ? p.newCoach : undefined
        })));
    };

    const removeParticipant = (id: number) => {
        if (participants.length > 1) {
            setParticipants(participants.filter(p => p.id !== id));
        }
    };

    const updateParticipant = (id: number, field: 'athleteId' | 'coachId', value: number | null) => {
        setParticipants(prev => prev.map(p => {
            if (p.id !== id) return p;
            const updated = { ...p, [field]: value };
            if (field === 'coachId' && value !== null) {
                delete updated.newCoach;
            }
            return updated;
        }));
    };

    const handleAddNewCoach = (data: NewCoachData) => {
        if (currentParticipantId !== null) {
            setParticipants(prev => prev.map(p => {
                if (p.id !== currentParticipantId) return p;
                return { ...p, coachId: null, newCoach: data };
            }));
        }
        setCurrentParticipantId(null);
    };

    const getCoachDisplay = (p: Participant) => {
        if (p.newCoach) {
            return <Badge variant="secondary">{p.newCoach.name} (новый)</Badge>;
        }
        if (p.coachId) {
            const coach = coaches.find(c => c.id === p.coachId);
            return coach?.name || `ID: ${p.coachId}`;
        }
        return null;
    };

    // Проверка, есть ли хотя бы один выбранный судья
    const hasValidJudge = judgeEntries.some(j => j.judgeId || j.newJudge);

    const handleSubmit = async () => {
        // Validation
        if (!selectedCategoryId) {
            toast.error("Выберите категорию турнира");
            return;
        }

        // Validate judges
        const validJudges = judgeEntries.filter(j => j.judgeId || j.newJudge);
        if (validJudges.length === 0) {
            toast.error("Добавьте хотя бы одного судью");
            return;
        }

        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            if (!p.athleteId) {
                toast.error(`Участник ${i + 1}: выберите спортсмена`);
                return;
            }
            if (!p.coachId && !p.newCoach) {
                toast.error(`Участник ${i + 1}: выберите или добавьте тренера`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const requestBody = {
                tournamentCategoryId: parseInt(selectedCategoryId),
                judges: validJudges.map(j => ({
                    judgeId: j.judgeId,
                    newJudge: j.newJudge ? {
                        name: j.newJudge.name,
                        category: j.newJudge.category,
                    } : undefined,
                })),
                participants: participants.map(p => ({
                    athleteId: p.athleteId,
                    coachId: p.coachId,
                    newCoach: p.newCoach ? { name: p.newCoach.name } : undefined,
                }))
            };

            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Ошибка при отправке заявки");
                setIsSubmitting(false);
                return;
            }

            toast.success(
                <div className="space-y-1">
                    <p className="font-medium">Заявка успешно отправлена!</p>
                    <p className="text-sm">Номер заявки: {data.registrationNumber}</p>
                </div>
            );
            router.push(`/${locale}/calendar`);
        } catch (error) {
            toast.error("Произошла ошибка сети");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (loading || sessionStatus === "loading") {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Not authenticated
    if (sessionStatus === "unauthenticated") {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="py-12 text-center space-y-4">
                        <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Требуется авторизация</h2>
                        <p className="text-muted-foreground">
                            Для подачи заявки на турнир необходимо войти в систему как региональный представитель.
                        </p>
                        <Button asChild>
                            <Link href="/api/auth/signin">Войти</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No tournaments available
    if (tournaments.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="py-12 text-center space-y-4">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Нет доступных турниров</h2>
                        <p className="text-muted-foreground">
                            В данный момент нет турниров с открытой регистрацией.
                        </p>
                        <Button asChild variant="outline">
                            <Link href={`/${locale}/calendar`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                К календарю
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Подать заявку на турнир</h1>
                        <p className="text-muted-foreground">
                            Выберите турнир и заполните данные участников
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 1: Tournament Selection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            1
                        </div>
                        <div>
                            <CardTitle>Выберите турнир</CardTitle>
                            <CardDescription>Доступные турниры с открытой регистрацией</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {tournaments.map((tournament) => {
                            const isSelected = selectedTournamentId === tournament.id.toString();
                            const startDate = new Date(tournament.startDate);
                            const endDate = new Date(tournament.endDate);

                            return (
                                <div
                                    key={tournament.id}
                                    onClick={() => handleTournamentSelect(tournament.id.toString())}
                                    className={`
                                        p-4 rounded-lg border-2 cursor-pointer transition-all
                                        ${isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{getLocalizedTitle(tournament)}</h3>
                                                {isSelected && (
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format.dateTime(startDate, { day: 'numeric', month: 'short' })}
                                                    {startDate.getTime() !== endDate.getTime() &&
                                                        ` — ${format.dateTime(endDate, { day: 'numeric', month: 'short' })}`
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {getLocalizedLocation(tournament)}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 flex-wrap mt-2">
                                                {tournament.categories.slice(0, 3).map(cat => (
                                                    <Badge key={cat.id} variant="outline" className="text-xs">
                                                        {getCategoryLabel(cat)}
                                                    </Badge>
                                                ))}
                                                {tournament.categories.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{tournament.categories.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Step 2: Category Selection */}
            {selectedTournament && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                2
                            </div>
                            <div>
                                <CardTitle>Выберите категорию</CardTitle>
                                <CardDescription>Категория турнира для участников</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedCategoryId} onValueChange={handleCategorySelect}>
                            <SelectTrigger className="max-w-md">
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedTournament.categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {getCategoryLabel(cat)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Judges Selection */}
            {/* Warning if registration already exists */}
            {selectedCategoryId && existingRegistration && (
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <Lock className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-destructive">Заявка уже подана</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ваш регион уже подал заявку на эту категорию: <strong>{existingRegistration.registrationNumber}</strong>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Выберите другую категорию или отредактируйте существующую заявку.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedCategoryId && !existingRegistration && !checkingRegistration && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                3
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Судьи от региона</h2>
                                    <p className="text-sm text-muted-foreground">Можно добавить несколько судей</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={addJudgeEntry}>
                            <Plus className="mr-2 h-4 w-4" /> Добавить
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {judgeEntries.map((entry, index) => (
                            <Card key={entry.id} className="border">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-primary w-6">#{index + 1}</span>
                                        <div className="flex-1">
                                            {!entry.newJudge ? (
                                                <SearchableSelect
                                                    items={judgeItems}
                                                    value={entry.judgeId}
                                                    onChange={(id) => updateJudgeEntry(entry.id, id)}
                                                    onAddNew={() => {
                                                        setCurrentJudgeEntryId(entry.id);
                                                        setShowAddJudge(true);
                                                    }}
                                                    placeholder="Выберите судью"
                                                    searchPlaceholder="Поиск по имени..."
                                                    addNewLabel="Добавить нового судью"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {getJudgeEntryDisplay(entry)}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setJudgeEntries(prev => prev.map(j =>
                                                            j.id === entry.id ? { ...j, newJudge: undefined } : j
                                                        ))}
                                                        className="h-6 px-2"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeJudgeEntry(entry.id)}
                                            className="text-muted-foreground hover:text-destructive h-9 w-9"
                                            disabled={judgeEntries.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Athletes */}
            {selectedCategoryId && hasValidJudge && !existingRegistration && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                4
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Список спортсменов</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Доступно: {filteredAthletes.length} спортсменов
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => addMultipleParticipants(5)}>
                                +5 строк
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => addMultipleParticipants(10)}>
                                +10 строк
                            </Button>
                            <Button variant="outline" onClick={addParticipant}>
                                <Plus className="mr-2 h-4 w-4" /> Добавить
                            </Button>
                        </div>
                    </div>

                    {/* Default Coach Selector */}
                    <Card className="bg-muted/30">
                        <CardContent className="py-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-2 block">Тренер по умолчанию</label>
                                    <SearchableSelect
                                        items={coachItems}
                                        value={defaultCoachId}
                                        onChange={setDefaultCoachId}
                                        placeholder="Выберите тренера для всех"
                                        searchPlaceholder="Поиск тренера..."
                                    />
                                </div>
                                {defaultCoachId && (
                                    <Button
                                        variant="secondary"
                                        onClick={applyDefaultCoachToAll}
                                        className="whitespace-nowrap"
                                    >
                                        Применить ко всем
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Desktop Table */}
                    <div className="rounded-xl border bg-card shadow-sm hidden md:block">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Спортсмен</TableHead>
                                    <TableHead>Тренер</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {participants.map((p, index) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-bold text-primary">{index + 1}</TableCell>
                                        <TableCell>
                                            <SearchableSelect
                                                items={athleteItems}
                                                value={p.athleteId}
                                                onChange={(id) => updateParticipant(p.id, 'athleteId', id)}
                                                placeholder="Выберите спортсмена"
                                                searchPlaceholder="Поиск по имени или ИИН..."
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                {!p.newCoach ? (
                                                    <SearchableSelect
                                                        items={coachItems}
                                                        value={p.coachId}
                                                        onChange={(id) => updateParticipant(p.id, 'coachId', id)}
                                                        onAddNew={() => {
                                                            setCurrentParticipantId(p.id);
                                                            setShowAddCoach(true);
                                                        }}
                                                        placeholder="Выберите тренера"
                                                        searchPlaceholder="Поиск по имени..."
                                                        addNewLabel="Добавить нового"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {getCoachDisplay(p)}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setParticipants(prev => prev.map(x =>
                                                                x.id === p.id ? { ...x, newCoach: undefined } : x
                                                            ))}
                                                            className="h-6 px-2"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeParticipant(p.id)}
                                                className="text-muted-foreground hover:text-destructive h-9 w-9"
                                                disabled={participants.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {participants.map((p, index) => (
                            <Card key={p.id} className="relative">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-lg text-primary">#{index + 1}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeParticipant(p.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                            disabled={participants.length === 1}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Спортсмен</label>
                                        <SearchableSelect
                                            items={athleteItems}
                                            value={p.athleteId}
                                            onChange={(id) => updateParticipant(p.id, 'athleteId', id)}
                                            placeholder="Выберите спортсмена"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Тренер</label>
                                        {!p.newCoach ? (
                                            <SearchableSelect
                                                items={coachItems}
                                                value={p.coachId}
                                                onChange={(id) => updateParticipant(p.id, 'coachId', id)}
                                                onAddNew={() => {
                                                    setCurrentParticipantId(p.id);
                                                    setShowAddCoach(true);
                                                }}
                                                placeholder="Выберите тренера"
                                                addNewLabel="Добавить нового"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {getCoachDisplay(p)}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setParticipants(prev => prev.map(x =>
                                                        x.id === p.id ? { ...x, newCoach: undefined } : x
                                                    ))}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit Section */}
            {selectedCategoryId && hasValidJudge && !existingRegistration && (
                <>
                    <Separator />

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-6 rounded-xl border">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Турнир: <span className="font-medium text-foreground">{getLocalizedTitle(selectedTournament!)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Судей: <span className="font-medium text-foreground">{judgeEntries.filter(j => j.judgeId || j.newJudge).length}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Спортсменов: <span className="font-medium text-foreground">{participants.length}</span>
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 min-w-[200px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Отправить заявку
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}

            {/* Dialogs */}
            <AddCoachDialog
                open={showAddCoach}
                onOpenChange={setShowAddCoach}
                onSave={handleAddNewCoach}
            />
            <AddJudgeDialog
                open={showAddJudge}
                onOpenChange={setShowAddJudge}
                onSave={handleAddNewJudge}
                locale={locale}
            />
        </div>
    );
}
