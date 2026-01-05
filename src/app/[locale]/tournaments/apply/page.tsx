"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchableSelect, SearchableSelectItem } from "@/components/ui/SearchableSelect";
import { Stepper, Step } from "@/components/ui/stepper";
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
    ChevronLeft,
    Send,
    ArrowLeft,
    Paperclip,
    FileText,
    Upload,
    X
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
    organizingRegion?: {
        id: number;
        name?: string;
    };
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
}

interface JudgeEntry {
    id: number;
    judgeId: number | null;
}

const STEPS: Step[] = [
    { id: "tournament", label: "Турнир" },
    { id: "category", label: "Категория" },
    { id: "judges", label: "Судьи" },
    { id: "athletes", label: "Спортсмены" },
    { id: "documents", label: "Документы" },
];

export default function TournamentApplyPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const format = useFormatter();
    const locale = useLocale();
    const t = useTranslations("Common");

    // Get tournamentId from URL params (for direct links from calendar/tournament pages)
    const urlTournamentId = searchParams.get('tournamentId');

    // Current step in wizard
    const [currentStep, setCurrentStep] = useState(0);

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

    // Existing registration check
    const [existingRegistration, setExistingRegistration] = useState<{ registrationNumber: string } | null>(null);
    const [checkingRegistration, setCheckingRegistration] = useState(false);

    // Documents state
    const [uploadedDocuments, setUploadedDocuments] = useState<{ fileName: string; fileUrl: string }[]>([]);
    const [isUploadingDocument, setIsUploadingDocument] = useState(false);

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

    // Auto-select tournament from URL param
    useEffect(() => {
        if (urlTournamentId && tournaments.length > 0 && !selectedTournamentId) {
            const tournament = tournaments.find(t => t.id.toString() === urlTournamentId);
            if (tournament) {
                setSelectedTournamentId(urlTournamentId);
            }
        }
    }, [urlTournamentId, tournaments, selectedTournamentId]);

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

    // User's region ID from session
    const userRegionId = (session?.user as any)?.regionId as number | undefined;

    // Max participants: 6 for host region, 4 for others
    const maxParticipants = useMemo(() => {
        if (selectedTournament?.organizingRegion?.id && userRegionId) {
            return selectedTournament.organizingRegion.id === userRegionId ? 6 : 4;
        }
        return 4; // Default for non-host regions
    }, [selectedTournament, userRegionId]);

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
            return { ...j, judgeId };
        }));
    };

    const addParticipant = () => {
        if (participants.length >= maxParticipants) {
            toast.error(`Максимум ${maxParticipants} спортсмен${maxParticipants === 6 ? 'ов' : 'а'} на категорию`);
            return;
        }
        setParticipants([
            ...participants,
            { id: Date.now(), athleteId: null, coachId: defaultCoachId }
        ]);
    };

    const applyDefaultCoachToAll = () => {
        if (!defaultCoachId) return;
        setParticipants(prev => prev.map(p => ({
            ...p,
            coachId: p.coachId || defaultCoachId
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
            return { ...p, [field]: value };
        }));
    };

    // Проверка, есть ли хотя бы один выбранный судья
    const hasValidJudge = judgeEntries.some(j => j.judgeId);

    // Document upload handler
    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingDocument(true);

        for (const file of Array.from(files)) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "registrations");

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    setUploadedDocuments(prev => [...prev, {
                        fileName: file.name,
                        fileUrl: data.data.url,
                    }]);
                    toast.success(`Файл "${file.name}" загружен`);
                } else {
                    toast.error(data.error || `Ошибка загрузки файла "${file.name}"`);
                }
            } catch {
                toast.error(`Ошибка загрузки файла "${file.name}"`);
            }
        }

        setIsUploadingDocument(false);
        // Reset input
        e.target.value = '';
    };

    const removeDocument = (index: number) => {
        setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
    };

    // Step validation
    const canProceedFromStep = (step: number): boolean => {
        switch (step) {
            case 0: return !!selectedTournamentId;
            case 1: return !!selectedCategoryId && !existingRegistration;
            case 2: return hasValidJudge;
            case 3: return participants.every(p => p.athleteId && p.coachId);
            case 4: return true; // Documents are optional
            default: return false;
        }
    };

    const handleNext = () => {
        if (canProceedFromStep(currentStep) && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        // Allow clicking on completed steps or current step
        if (stepIndex <= currentStep) {
            setCurrentStep(stepIndex);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!selectedCategoryId) {
            toast.error("Выберите категорию турнира");
            return;
        }

        // Validate judges
        const validJudges = judgeEntries.filter(j => j.judgeId);
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
            if (!p.coachId) {
                toast.error(`Участник ${i + 1}: выберите тренера`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const requestBody = {
                tournamentCategoryId: parseInt(selectedCategoryId),
                judges: validJudges.map(j => ({
                    judgeId: j.judgeId,
                })),
                participants: participants.map(p => ({
                    athleteId: p.athleteId,
                    coachId: p.coachId,
                })),
                documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
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

    // Check role - only RegionalRepresentative can submit applications
    const userRole = (session?.user as any)?.role;
    if (userRole !== "RegionalRepresentative") {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="py-12 text-center space-y-4">
                        <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Доступ запрещён</h2>
                        <p className="text-muted-foreground">
                            Подача заявок доступна только региональным представителям.
                        </p>
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

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="font-semibold">Выберите турнир</h3>
                                <p className="text-sm text-muted-foreground">Доступные турниры с открытой регистрацией</p>
                            </div>
                        </div>
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
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="font-semibold">Выберите категорию</h3>
                                <p className="text-sm text-muted-foreground">Категория турнира для участников</p>
                            </div>
                        </div>

                        {selectedTournament && (
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
                        )}

                        {/* Warning if registration already exists */}
                        {existingRegistration && (
                            <div className="mt-4 p-4 rounded-lg border border-destructive bg-destructive/5">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-destructive" />
                                    <div>
                                        <h4 className="font-semibold text-destructive">Заявка уже подана</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Номер заявки: <strong>{existingRegistration.registrationNumber}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Судьи от региона</h3>
                                    <p className="text-sm text-muted-foreground">Можно добавить несколько судей</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={addJudgeEntry}>
                                <Plus className="mr-2 h-4 w-4" /> Добавить
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {judgeEntries.map((entry, index) => (
                                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                    <span className="font-bold text-primary w-6">#{index + 1}</span>
                                    <div className="flex-1">
                                        <SearchableSelect
                                            items={judgeItems}
                                            value={entry.judgeId}
                                            onChange={(id) => updateJudgeEntry(entry.id, id)}
                                            placeholder="Выберите судью"
                                            searchPlaceholder="Поиск по имени..."
                                        />
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
                            ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Список спортсменов</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Доступно: {filteredAthletes.length} спортсменов
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {participants.length} / {maxParticipants}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addParticipant}
                                    disabled={participants.length >= maxParticipants}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Добавить
                                </Button>
                            </div>
                        </div>

                        {/* Default Coach Selector */}
                        <div className="p-4 rounded-lg bg-muted/30 mb-4">
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
                        </div>

                        {/* Desktop Table */}
                        <div className="rounded-lg border hidden md:block">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead>Спортсмен</TableHead>
                                        <TableHead>Тренер</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
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
                                                <SearchableSelect
                                                    items={coachItems}
                                                    value={p.coachId}
                                                    onChange={(id) => updateParticipant(p.id, 'coachId', id)}
                                                    placeholder="Выберите тренера"
                                                    searchPlaceholder="Поиск по имени..."
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeParticipant(p.id)}
                                                    className="text-muted-foreground hover:text-destructive h-8 w-8"
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
                        <div className="md:hidden space-y-3">
                            {participants.map((p, index) => (
                                <div key={p.id} className="p-4 rounded-lg border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-primary">#{index + 1}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeParticipant(p.id)}
                                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                                            disabled={participants.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
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
                                        <SearchableSelect
                                            items={coachItems}
                                            value={p.coachId}
                                            onChange={(id) => updateParticipant(p.id, 'coachId', id)}
                                            placeholder="Выберите тренера"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <Paperclip className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="font-semibold">Документы</h3>
                                <p className="text-sm text-muted-foreground">Прикрепите файлы (опционально)</p>
                            </div>
                        </div>

                        {/* Uploaded Documents List */}
                        {uploadedDocuments.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {uploadedDocuments.map((doc, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                                        <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/10">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                            <p className="text-xs text-muted-foreground">PDF</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeDocument(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Zone */}
                        <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer border-muted-foreground/25 hover:border-primary/50">
                            {isUploadingDocument ? (
                                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Нажмите для выбора файлов
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PDF до 10MB
                                    </p>
                                </>
                            )}

                            <input
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={handleDocumentUpload}
                                className="hidden"
                                disabled={isUploadingDocument}
                            />
                        </label>

                        {/* Summary before submit */}
                        <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
                            <h4 className="font-medium">Итого:</h4>
                            <p className="text-sm text-muted-foreground">
                                Турнир: <span className="font-medium text-foreground">{getLocalizedTitle(selectedTournament!)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Судей: <span className="font-medium text-foreground">{judgeEntries.filter(j => j.judgeId).length}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Спортсменов: <span className="font-medium text-foreground">{participants.length}</span>
                            </p>
                            {uploadedDocuments.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Документов: <span className="font-medium text-foreground">{uploadedDocuments.length}</span>
                                </p>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                    <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Подать заявку на турнир</h1>
                    <p className="text-sm text-muted-foreground">
                        Выберите турнир и заполните данные участников
                    </p>
                </div>
            </div>

            {/* Stepper */}
            <Stepper
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={handleStepClick}
            />

            {/* Content Card */}
            <Card>
                <CardContent className="pt-6">
                    {renderStepContent()}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Назад
                </Button>

                <span className="text-sm text-muted-foreground hidden md:block">
                    Шаг {currentStep + 1} из {STEPS.length}
                </span>

                {currentStep < 4 ? (
                    <Button
                        onClick={handleNext}
                        disabled={!canProceedFromStep(currentStep)}
                    >
                        Далее
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canProceedFromStep(3)}
                        className="bg-green-600 hover:bg-green-700"
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
                )}
            </div>
        </div>
    );
}
