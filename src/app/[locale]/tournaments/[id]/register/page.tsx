"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect, SearchableSelectItem } from "@/components/ui/SearchableSelect";
import { AddCoachDialog, NewCoachData } from "@/components/registration/AddCoachDialog";
import { AddJudgeDialog, NewJudgeData } from "@/components/registration/AddJudgeDialog";
import {
    Calendar,
    MapPin,
    ArrowLeft,
    Loader2,
    Shield,
    UserCheck,
    Plus,
    Trash2,
    AlertTriangle,
    Lock,
    CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale } from "next-intl";
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
    category: string;
    type: string;
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

export default function TournamentRegisterPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { status: sessionStatus } = useSession();
    const router = useRouter();
    const format = useFormatter();
    const locale = useLocale();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data lists
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);

    // Form state
    const [judgeId, setJudgeId] = useState<number | null>(null);
    const [newJudge, setNewJudge] = useState<NewJudgeData | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([
        { id: 1, athleteId: null, coachId: null }
    ]);

    // Dialog state
    const [showAddCoach, setShowAddCoach] = useState(false);
    const [showAddJudge, setShowAddJudge] = useState(false);
    const [currentParticipantId, setCurrentParticipantId] = useState<number | null>(null);

    // Fetch tournament data
    useEffect(() => {
        async function fetchTournament() {
            try {
                const res = await fetch(`/api/tournaments/${resolvedParams.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const tournamentData = data.data || data;
                    setTournament(tournamentData);
                    if (tournamentData.categories?.length > 0) {
                        setSelectedCategoryId(String(tournamentData.categories[0].id));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch tournament:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTournament();
    }, [resolvedParams.id]);

    // Fetch athletes, coaches, judges
    useEffect(() => {
        async function fetchData() {
            try {
                const [athletesRes, coachesRes, judgesRes] = await Promise.all([
                    fetch('/api/team?all=true&limit=500'),
                    fetch('/api/coaches?limit=500'),
                    fetch('/api/judges?limit=500')
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

    // Convert to SearchableSelectItem format
    const athleteItems: SearchableSelectItem[] = athletes.map(a => ({
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
    const addParticipant = () => {
        setParticipants([
            ...participants,
            { id: Date.now(), athleteId: null, coachId: null }
        ]);
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

    const handleAddNewJudge = (data: NewJudgeData) => {
        setJudgeId(null);
        setNewJudge(data);
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

    const getJudgeDisplay = () => {
        if (newJudge) {
            return <Badge variant="secondary">{newJudge.name} (новый)</Badge>;
        }
        if (judgeId) {
            const judge = judges.find(j => j.id === judgeId);
            return judge?.name || `ID: ${judgeId}`;
        }
        return null;
    };

    const handleSubmit = async () => {
        // Validation
        if (!judgeId && !newJudge) {
            toast.error("Выберите или добавьте судью");
            return;
        }
        if (!selectedCategoryId) {
            toast.error("Выберите категорию турнира");
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
                judgeId: judgeId,
                newJudge: newJudge ? {
                    name: newJudge.name,
                    category: newJudge.category,
                } : undefined,
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

            toast.success(`Заявка ${data.registrationNumber} успешно отправлена на модерацию!`);
            router.push(`/tournaments/${resolvedParams.id}`);
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
            <div className="container mx-auto py-8">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="py-12 text-center space-y-4">
                        <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Требуется авторизация</h2>
                        <p className="text-muted-foreground">
                            Для регистрации команды необходимо войти в систему как региональный представитель.
                        </p>
                        <Button asChild>
                            <Link href="/api/auth/signin">Войти</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Tournament not found or registration closed
    if (!tournament) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center py-16">
                    <h1 className="text-2xl font-bold mb-4">Турнир не найден</h1>
                    <Button asChild>
                        <Link href="/calendar">
                            <ArrowLeft className="h-4 w-4 mr-2" /> К календарю
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (tournament.status !== 'REGISTRATION_OPEN' || !tournament.isActive) {
        return (
            <div className="container mx-auto py-8">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="py-12 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
                        <h2 className="text-2xl font-bold">Регистрация закрыта</h2>
                        <p className="text-muted-foreground">
                            Регистрация на этот турнир в данный момент недоступна.
                        </p>
                        <Button asChild>
                            <Link href={`/tournaments/${tournament.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> К турниру
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Back button */}
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/tournaments/${tournament.id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад к турниру
                </Link>
            </Button>

            {/* Tournament header */}
            <div className="bg-card border rounded-xl p-6 space-y-4">
                <Badge className="bg-green-500 hover:bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" /> Регистрация открыта
                </Badge>
                <h1 className="text-3xl font-bold">{getLocalizedTitle(tournament)}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>
                            {format.dateTime(startDate, { day: 'numeric', month: 'long' })}
                            {startDate.getTime() !== endDate.getTime() &&
                                ` — ${format.dateTime(endDate, { day: 'numeric', month: 'long', year: 'numeric' })}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>{getLocalizedLocation(tournament)}</span>
                    </div>
                </div>
                {tournament.requiresVerification && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        <Shield className="inline h-4 w-4 mr-1" />
                        Заявки проходят модерацию. После отправки вы получите номер заявки для отслеживания статуса.
                    </p>
                )}
            </div>

            {/* Category Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Выберите категорию турнира</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                            {tournament.categories.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {getCategoryLabel(cat)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Judge Section */}
            <Card>
                <CardHeader className="bg-secondary/30 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Судейский состав</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Выберите судью из базы или добавьте нового
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <SearchableSelect
                                    items={judgeItems}
                                    value={judgeId}
                                    onChange={(id) => {
                                        setJudgeId(id);
                                        if (id) setNewJudge(null);
                                    }}
                                    onAddNew={() => setShowAddJudge(true)}
                                    placeholder="Выберите судью"
                                    searchPlaceholder="Поиск по имени..."
                                    addNewLabel="Добавить нового судью"
                                    disabled={!!newJudge}
                                />
                            </div>
                        </div>
                        {getJudgeDisplay() && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Выбран:</span>
                                {getJudgeDisplay()}
                                {newJudge && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setNewJudge(null)}
                                        className="h-6 px-2"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Athletes Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Список спортсменов</h2>
                    </div>
                    <Button variant="outline" onClick={addParticipant}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить
                    </Button>
                </div>

                {/* Desktop Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden hidden md:block">
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
                                    <TableCell>{index + 1}</TableCell>
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

            <Separator />

            {/* Footer */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Всего участников: <span className="font-medium text-foreground">{participants.length}</span>
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
                        "Отправить заявку"
                    )}
                </Button>
            </div>

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
