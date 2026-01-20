"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Users,
    Scale,
    FileText,
    History,
    Pencil,
    Trash2,
    Plus,
    Printer,
    Download,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";

interface Athlete {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    iin?: string;
    dob?: string;
    gender: string;
    regionRef?: { name: string };
}

interface Coach {
    id: number;
    name: string;
    nameKk?: string;
    region?: { name: string };
}

interface Judge {
    id: number;
    name: string;
    category: string;
    region?: { name: string };
}

interface AthleteRegistration {
    id: number;
    athlete: Athlete;
    coach?: Coach;
}

interface RegistrationJudge {
    id: number;
    judge: Judge;
}

interface RegistrationDocument {
    id: number;
    fileName: string;
    fileUrl: string;
    createdAt: string;
}

interface AuditLog {
    id: number;
    action: string;
    entityType: string;
    description: string;
    createdAt: string;
    user: { username: string };
    previousData?: any;
    newData?: any;
}

interface Registration {
    id: number;
    registrationNumber: string;
    regionName: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    rejectionReason?: string;
    approvedAt?: string;
    approvedBy?: string;
    createdAt: string;
    regionId?: number;
    user: {
        id: number;
        username: string;
        email?: string;
    };
    tournamentCategory?: {
        id: number;
        category: string;
        gender: string;
        type: string;
        tournament: {
            id: number;
            title: string;
            titleKk?: string;
            startDate: string;
            endDate: string;
            location: string;
            organizingRegionId?: number;
        };
    };
    athleteRegistrations: AthleteRegistration[];
    registrationJudges: RegistrationJudge[];
    documents: RegistrationDocument[];
}

const statusConfig = {
    PENDING: { label: "На проверке", color: "bg-yellow-500", icon: Clock },
    APPROVED: { label: "Одобрено", color: "bg-green-500", icon: CheckCircle },
    REJECTED: { label: "Отклонено", color: "bg-red-500", icon: XCircle },
    WITHDRAWN: { label: "Отозвано", color: "bg-gray-500", icon: XCircle },
};

export default function RegistrationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const { data: session } = useSession();
    const registrationId = params.id as string;

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState("athletes");

    // Athletes state
    const [athletes, setAthletes] = useState<AthleteRegistration[]>([]);
    const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
    const [allCoaches, setAllCoaches] = useState<Coach[]>([]);
    const [editingAthlete, setEditingAthlete] = useState<AthleteRegistration | null>(null);
    const [addAthleteOpen, setAddAthleteOpen] = useState(false);
    const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
    const [selectedCoachId, setSelectedCoachId] = useState<string>("");

    // History state
    const [history, setHistory] = useState<AuditLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Reject dialog
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const isAdmin = session?.user?.role === "Admin" || session?.user?.role === "Editor";
    const isOwner = registration?.user?.id === parseInt((session?.user as any)?.id || "0");
    const canEdit = isAdmin || (isOwner && registration?.status === "PENDING");

    const fetchRegistration = useCallback(async () => {
        try {
            const res = await fetch(`/api/registrations/${registrationId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setRegistration(data);
            setAthletes(data.athleteRegistrations || []);
        } catch (error) {
            toast.error("Ошибка загрузки заявки");
            router.push(`/${locale}/admin/registrations`);
        } finally {
            setLoading(false);
        }
    }, [registrationId, locale, router]);

    const fetchAthletes = useCallback(async () => {
        try {
            const res = await fetch(`/api/registrations/${registrationId}/athletes`);
            const data = await res.json();
            if (data.success) {
                setAthletes(data.data);
            }
        } catch (error) {
            console.error("Error fetching athletes:", error);
        }
    }, [registrationId]);

    const fetchAllAthletes = useCallback(async () => {
        try {
            const res = await fetch("/api/team?all=true&isActive=true");
            const data = await res.json();
            setAllAthletes(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching all athletes:", error);
        }
    }, []);

    const fetchAllCoaches = useCallback(async () => {
        try {
            const res = await fetch("/api/coaches?isActive=true");
            const data = await res.json();
            setAllCoaches(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Error fetching coaches:", error);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/registrations/${registrationId}/history`);
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setHistoryLoading(false);
        }
    }, [registrationId]);

    useEffect(() => {
        fetchRegistration();
        fetchAllAthletes();
        fetchAllCoaches();
    }, [fetchRegistration, fetchAllAthletes, fetchAllCoaches]);

    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [activeTab, fetchHistory]);

    const handleApprove = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/registrations/${registrationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED" }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Заявка одобрена");
                fetchRegistration();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при обработке");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Укажите причину отклонения");
            return;
        }
        setProcessing(true);
        try {
            const res = await fetch(`/api/registrations/${registrationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED", rejectionReason }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Заявка отклонена");
                setRejectDialogOpen(false);
                fetchRegistration();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при обработке");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateCoach = async () => {
        if (!editingAthlete) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/registrations/${registrationId}/athletes`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    athleteRegistrationId: editingAthlete.id,
                    coachId: selectedCoachId && selectedCoachId !== "none" ? selectedCoachId : null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Тренер обновлён");
                setEditingAthlete(null);
                fetchAthletes();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при обновлении");
        } finally {
            setProcessing(false);
        }
    };

    const handleAddAthlete = async () => {
        if (!selectedAthleteId) {
            toast.error("Выберите спортсмена");
            return;
        }
        setProcessing(true);
        try {
            const res = await fetch(`/api/registrations/${registrationId}/athletes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    athleteId: selectedAthleteId,
                    coachId: selectedCoachId && selectedCoachId !== "none" ? selectedCoachId : null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Спортсмен добавлен");
                setAddAthleteOpen(false);
                setSelectedAthleteId(null);
                setSelectedCoachId("");
                fetchAthletes();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при добавлении");
        } finally {
            setProcessing(false);
        }
    };

    const handleRemoveAthlete = async (athleteRegId: number) => {
        if (!confirm("Удалить спортсмена из заявки?")) return;
        setProcessing(true);
        try {
            const res = await fetch(
                `/api/registrations/${registrationId}/athletes?id=${athleteRegId}`,
                { method: "DELETE" }
            );
            const data = await res.json();
            if (data.success) {
                toast.success("Спортсмен удалён");
                fetchAthletes();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при удалении");
        } finally {
            setProcessing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        // Use print functionality for PDF
        window.print();
    };

    const handleExportDoc = async () => {
        try {
            const response = await fetch(`/api/registrations/${registrationId}/export/doc`);
            if (!response.ok) {
                throw new Error("Export failed");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${registration?.registrationNumber || "registration"}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Файл скачан");
        } catch (error) {
            toast.error("Ошибка при экспорте");
        }
    };

    const getCategoryLabel = (cat: Registration["tournamentCategory"]) => {
        if (!cat) return "";
        const categoryItem = CATEGORIES.find((c) => c.id === cat.category);
        const genderItem = GENDERS.find((g) => g.id === cat.gender);
        const typeItem = BOW_TYPES.find((t) => t.id === cat.type);
        return `${categoryItem ? getLocalizedLabel(categoryItem, locale) : cat.category} ${genderItem ? getLocalizedLabel(genderItem, locale) : cat.gender
            } - ${typeItem ? getLocalizedLabel(typeItem, locale) : cat.type}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getGenderLabel = (gender: string) => {
        const item = GENDERS.find((g) => g.id === gender);
        return item ? getLocalizedLabel(item, locale) : gender;
    };

    // Filter out already added athletes
    const availableAthletes = allAthletes.filter(
        (a) => !athletes.some((ar) => ar.athlete.id === a.id)
    );

    // Calculate max athletes
    const isHostRegion =
        registration?.tournamentCategory?.tournament.organizingRegionId === registration?.regionId;
    const maxAthletes = isHostRegion ? 6 : 4;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Заявка не найдена</p>
            </div>
        );
    }

    const StatusIcon = statusConfig[registration.status].icon;

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${locale}/admin/registrations`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Заявка {registration.registrationNumber}
                        </h1>
                        <p className="text-muted-foreground">{registration.regionName}</p>
                    </div>
                    <Badge className={statusConfig[registration.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[registration.status].label}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Печать
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportDoc}>
                        <Download className="h-4 w-4 mr-2" />
                        DOC
                    </Button>

                    {registration.status === "PENDING" && isAdmin && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600"
                                onClick={() => setRejectDialogOpen(true)}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Отклонить
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleApprove}
                                disabled={processing}
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Одобрить
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Print header */}
            <div className="hidden print:block">
                <h1 className="text-xl font-bold text-center">
                    Заявка {registration.registrationNumber}
                </h1>
                <p className="text-center text-sm">{registration.regionName}</p>
            </div>

            {/* Tournament Info */}
            {registration.tournamentCategory && (
                <Card className="print:border-0 print:shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Турнир</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-medium">
                            {registration.tournamentCategory.tournament.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {getCategoryLabel(registration.tournamentCategory)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {registration.tournamentCategory.tournament.location} •{" "}
                            {new Date(
                                registration.tournamentCategory.tournament.startDate
                            ).toLocaleDateString("ru-RU")}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Approval info */}
            {registration.status === "APPROVED" && registration.approvedAt && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md print:bg-transparent">
                    Одобрено {formatDate(registration.approvedAt)}
                </div>
            )}
            {registration.status === "REJECTED" && registration.rejectionReason && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md print:bg-transparent">
                    Отклонено. Причина: {registration.rejectionReason}
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
                <TabsList>
                    <TabsTrigger value="athletes" className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Спортсмены ({athletes.length})
                    </TabsTrigger>
                    <TabsTrigger value="judges" className="flex items-center gap-1">
                        <Scale className="h-4 w-4" />
                        Судьи ({registration.registrationJudges?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Документы ({registration.documents?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-1">
                        <History className="h-4 w-4" />
                        История
                    </TabsTrigger>
                </TabsList>

                {/* Athletes Tab */}
                <TabsContent value="athletes" className="space-y-4">
                    {canEdit && athletes.length < maxAthletes && (
                        <div className="flex justify-end">
                            <Button onClick={() => setAddAthleteOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить спортсмена
                            </Button>
                        </div>
                    )}

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>ФИО</TableHead>
                                    <TableHead>ИИН</TableHead>
                                    <TableHead>Пол</TableHead>
                                    <TableHead>Тренер</TableHead>
                                    {canEdit && <TableHead className="w-24">Действия</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {athletes.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={canEdit ? 6 : 5}
                                            className="text-center text-muted-foreground"
                                        >
                                            Нет спортсменов
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    athletes.map((ar, idx) => (
                                        <TableRow key={ar.id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {ar.athlete.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {ar.athlete.iin || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {getGenderLabel(ar.athlete.gender)}
                                            </TableCell>
                                            <TableCell>{ar.coach?.name || "—"}</TableCell>
                                            {canEdit && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingAthlete(ar);
                                                                setSelectedCoachId(
                                                                    ar.coach?.id?.toString() || "none"
                                                                );
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600"
                                                            onClick={() =>
                                                                handleRemoveAthlete(ar.id)
                                                            }
                                                            disabled={
                                                                processing || athletes.length <= 1
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Максимум спортсменов: {maxAthletes} (
                        {isHostRegion ? "регион-организатор" : "гостевой регион"})
                    </p>
                </TabsContent>

                {/* Judges Tab */}
                <TabsContent value="judges" className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>ФИО</TableHead>
                                    <TableHead>Категория</TableHead>
                                    <TableHead>Регион</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registration.registrationJudges?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            Нет судей
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registration.registrationJudges?.map((rj, idx) => (
                                        <TableRow key={rj.id}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {rj.judge.name}
                                            </TableCell>
                                            <TableCell>{rj.judge.category}</TableCell>
                                            <TableCell>
                                                {rj.judge.region?.name || registration.regionName}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    {registration.documents?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Нет прикреплённых документов
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {registration.documents?.map((doc) => (
                                <Card key={doc.id}>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{doc.fileName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Загружен: {formatDate(doc.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Открыть
                                                </a>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={doc.fileUrl} download>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Скачать
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    {historyLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            История изменений пуста
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {history.map((log) => (
                                <Card key={log.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium">{log.description}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {log.user.username} •{" "}
                                                    {formatDate(log.createdAt)}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">{log.action}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Print content - Athletes table */}
            <div className="hidden print:block">
                <h2 className="text-lg font-semibold mt-6 mb-2">
                    Спортсмены ({athletes.length})
                </h2>
                <table className="w-full border-collapse border">
                    <thead>
                        <tr>
                            <th className="border p-2 text-left">#</th>
                            <th className="border p-2 text-left">ФИО</th>
                            <th className="border p-2 text-left">ИИН</th>
                            <th className="border p-2 text-left">Пол</th>
                            <th className="border p-2 text-left">Тренер</th>
                        </tr>
                    </thead>
                    <tbody>
                        {athletes.map((ar, idx) => (
                            <tr key={ar.id}>
                                <td className="border p-2">{idx + 1}</td>
                                <td className="border p-2">{ar.athlete.name}</td>
                                <td className="border p-2">{ar.athlete.iin || "—"}</td>
                                <td className="border p-2">{getGenderLabel(ar.athlete.gender)}</td>
                                <td className="border p-2">{ar.coach?.name || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2 className="text-lg font-semibold mt-6 mb-2">
                    Судьи ({registration.registrationJudges?.length || 0})
                </h2>
                <table className="w-full border-collapse border">
                    <thead>
                        <tr>
                            <th className="border p-2 text-left">#</th>
                            <th className="border p-2 text-left">ФИО</th>
                            <th className="border p-2 text-left">Категория</th>
                            <th className="border p-2 text-left">Регион</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registration.registrationJudges?.map((rj, idx) => (
                            <tr key={rj.id}>
                                <td className="border p-2">{idx + 1}</td>
                                <td className="border p-2">{rj.judge.name}</td>
                                <td className="border p-2">{rj.judge.category}</td>
                                <td className="border p-2">
                                    {rj.judge.region?.name || registration.regionName}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="text-sm mt-4">
                    Подано: {formatDate(registration.createdAt)}
                </p>
            </div>

            {/* Meta info */}
            <div className="text-sm text-muted-foreground print:hidden">
                <p>Подано: {formatDate(registration.createdAt)}</p>
            </div>

            {/* Edit Coach Dialog */}
            <Dialog open={!!editingAthlete} onOpenChange={() => setEditingAthlete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Редактировать тренера</DialogTitle>
                        <DialogDescription>
                            Спортсмен: {editingAthlete?.athlete.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Тренер</label>
                            <Select
                                value={selectedCoachId}
                                onValueChange={setSelectedCoachId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите тренера" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Не назначен</SelectItem>
                                    {allCoaches.map((coach) => (
                                        <SelectItem
                                            key={coach.id}
                                            value={coach.id.toString()}
                                        >
                                            {coach.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingAthlete(null)}>
                            Отмена
                        </Button>
                        <Button onClick={handleUpdateCoach} disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Athlete Dialog */}
            <Dialog open={addAthleteOpen} onOpenChange={setAddAthleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить спортсмена</DialogTitle>
                        <DialogDescription>
                            Выберите спортсмена и назначьте тренера
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Спортсмен *</label>
                            <SearchableSelect
                                items={availableAthletes.map((a) => ({
                                    id: a.id,
                                    name: a.name,
                                }))}
                                value={selectedAthleteId}
                                onChange={setSelectedAthleteId}
                                placeholder="Поиск спортсмена..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Тренер</label>
                            <Select
                                value={selectedCoachId}
                                onValueChange={setSelectedCoachId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите тренера" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Не назначен</SelectItem>
                                    {allCoaches.map((coach) => (
                                        <SelectItem
                                            key={coach.id}
                                            value={coach.id.toString()}
                                        >
                                            {coach.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setAddAthleteOpen(false);
                                setSelectedAthleteId(null);
                                setSelectedCoachId("");
                            }}
                        >
                            Отмена
                        </Button>
                        <Button onClick={handleAddAthlete} disabled={processing}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Добавить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Отклонить заявку</DialogTitle>
                        <DialogDescription>
                            Укажите причину отклонения заявки {registration.registrationNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder="Причина отклонения..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={processing || !rejectionReason.trim()}
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Отклонить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
