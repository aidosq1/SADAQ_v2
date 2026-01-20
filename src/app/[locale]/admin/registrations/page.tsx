"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Users,
    Loader2,
    Filter,
    RefreshCcw,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import Link from "next/link";

interface Athlete {
    id: number;
    name: string;
    nameKk?: string;
    nameEn?: string;
    iin?: string;
    dob?: string;
    gender: string;
    type: string;
    category: string;
    region: string;
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

interface AthleteRegistration {
    id: number;
    athlete: Athlete;
    coach?: Coach;
}

interface RegistrationJudge {
    id: number;
    judge: Judge;
}

interface TournamentCategory {
    id: number;
    category: string;
    gender: string;
    type: string;
    tournament: {
        id: number;
        title: string;
        titleKk?: string;
        titleEn?: string;
        startDate: string;
        endDate: string;
        location: string;
    };
}

interface Registration {
    id: number;
    registrationNumber: string;
    registrationJudges: RegistrationJudge[];
    regionName: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    rejectionReason?: string;
    approvedAt?: string;
    approvedBy?: string;
    createdAt: string;
    user: {
        id: number;
        username: string;
        email?: string;
    };
    tournamentCategory?: TournamentCategory;
    athleteRegistrations: AthleteRegistration[];
}

const statusConfig = {
    PENDING: { label: "На проверке", color: "bg-yellow-500", icon: Clock },
    APPROVED: { label: "Одобрено", color: "bg-green-500", icon: CheckCircle },
    REJECTED: { label: "Отклонено", color: "bg-red-500", icon: XCircle },
    WITHDRAWN: { label: "Отозвано", color: "bg-gray-500", icon: XCircle },
};

export default function AdminRegistrationsPage() {
    const locale = useLocale();
    const { data: session } = useSession();
    const isRegionalRep = session?.user?.role === "RegionalRepresentative";

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRegistrations();
    }, [filterStatus]);

    async function fetchRegistrations() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== "all") {
                params.set("status", filterStatus);
            }
            const res = await fetch(`/api/registrations?${params}`);
            const data = await res.json();
            setRegistrations(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Ошибка загрузки заявок");
        } finally {
            setLoading(false);
        }
    }

    function openDetails(reg: Registration) {
        setSelectedRegistration(reg);
        setDetailsOpen(true);
    }

    async function handleApprove(id: number) {
        setProcessing(true);
        try {
            const res = await fetch(`/api/registrations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED" }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Заявка одобрена");
                setDetailsOpen(false);
                fetchRegistrations();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при обработке");
        } finally {
            setProcessing(false);
        }
    }

    function openRejectDialog(reg: Registration) {
        setSelectedRegistration(reg);
        setRejectionReason("");
        setRejectDialogOpen(true);
    }

    async function handleReject() {
        if (!selectedRegistration) return;
        if (!rejectionReason.trim()) {
            toast.error("Укажите причину отклонения");
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`/api/registrations/${selectedRegistration.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "REJECTED",
                    rejectionReason: rejectionReason
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Заявка отклонена");
                setRejectDialogOpen(false);
                setDetailsOpen(false);
                fetchRegistrations();
            } else {
                toast.error(data.error || "Ошибка");
            }
        } catch (error) {
            toast.error("Ошибка при обработке");
        } finally {
            setProcessing(false);
        }
    }

    const getCategoryLabel = (cat: TournamentCategory) => {
        const categoryItem = CATEGORIES.find((c) => c.id === cat.category);
        const genderItem = GENDERS.find((g) => g.id === cat.gender);
        const typeItem = BOW_TYPES.find((t) => t.id === cat.type);

        return `${categoryItem ? getLocalizedLabel(categoryItem, locale) : cat.category} ${genderItem ? getLocalizedLabel(genderItem, locale) : cat.gender} - ${typeItem ? getLocalizedLabel(typeItem, locale) : cat.type}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Stats
    const pendingCount = registrations.filter(r => r.status === "PENDING").length;
    const approvedCount = registrations.filter(r => r.status === "APPROVED").length;
    const rejectedCount = registrations.filter(r => r.status === "REJECTED").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Заявки на турниры</h1>
                <div className="flex gap-2">
                    {isRegionalRep && (
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href={`/${locale}/tournaments/apply`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Подать заявку
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" onClick={fetchRegistrations}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Обновить
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Всего</p>
                                <p className="text-2xl font-bold">{registrations.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-500/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">На проверке</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-500/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Одобрено</p>
                                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-red-500/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Отклонено</p>
                                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все заявки</SelectItem>
                        <SelectItem value="PENDING">На проверке</SelectItem>
                        <SelectItem value="APPROVED">Одобренные</SelectItem>
                        <SelectItem value="REJECTED">Отклонённые</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Номер</TableHead>
                            <TableHead>Регион</TableHead>
                            <TableHead>Турнир</TableHead>
                            <TableHead>Судья</TableHead>
                            <TableHead>Спортсмены</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead className="w-[100px]">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : registrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    Заявок не найдено
                                </TableCell>
                            </TableRow>
                        ) : (
                            registrations.map((reg) => {
                                const StatusIcon = statusConfig[reg.status].icon;
                                return (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-mono text-sm">
                                            {reg.registrationNumber}
                                        </TableCell>
                                        <TableCell>{reg.regionName}</TableCell>
                                        <TableCell className="max-w-[200px]">
                                            {reg.tournamentCategory ? (
                                                <div>
                                                    <div className="font-medium truncate">
                                                        {reg.tournamentCategory.tournament.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {getCategoryLabel(reg.tournamentCategory)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {reg.registrationJudges?.length > 0
                                                ? reg.registrationJudges.map(rj => rj.judge.name).join(", ")
                                                : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {reg.athleteRegistrations.length} чел.
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusConfig[reg.status].color} hover:${statusConfig[reg.status].color}`}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusConfig[reg.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(reg.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link href={`/${locale}/admin/registrations/${reg.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {reg.status === "PENDING" && !isRegionalRep && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-green-600"
                                                            onClick={() => handleApprove(reg.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600"
                                                            onClick={() => openRejectDialog(reg)}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>
                            Заявка {selectedRegistration?.registrationNumber}
                        </DialogTitle>
                        <DialogDescription>
                            Детали регистрации команды
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistration && (
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <Badge className={`${statusConfig[selectedRegistration.status].color}`}>
                                    {statusConfig[selectedRegistration.status].label}
                                </Badge>
                                {selectedRegistration.approvedAt && (
                                    <span className="text-sm text-muted-foreground">
                                        Одобрено: {formatDate(selectedRegistration.approvedAt)} ({selectedRegistration.approvedBy})
                                    </span>
                                )}
                                {selectedRegistration.rejectionReason && (
                                    <span className="text-sm text-red-600">
                                        Причина: {selectedRegistration.rejectionReason}
                                    </span>
                                )}
                            </div>

                            {/* Tournament info */}
                            {selectedRegistration.tournamentCategory && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Турнир</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{selectedRegistration.tournamentCategory.tournament.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {getCategoryLabel(selectedRegistration.tournamentCategory)}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Judge info */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Судьи</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {selectedRegistration.registrationJudges?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedRegistration.registrationJudges.map((rj) => (
                                                <div key={rj.id}>
                                                    <p className="font-medium">{rj.judge.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {rj.judge.category} — {rj.judge.region?.name || selectedRegistration.regionName}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Судьи не назначены</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Athletes */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">
                                        Спортсмены ({selectedRegistration.athleteRegistrations.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>ФИО</TableHead>
                                                <TableHead>ИИН</TableHead>
                                                <TableHead>Пол</TableHead>
                                                <TableHead>Категория</TableHead>
                                                <TableHead>Тип лука</TableHead>
                                                <TableHead>Тренер</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedRegistration.athleteRegistrations.map((ar, idx) => (
                                                <TableRow key={ar.id}>
                                                    <TableCell>{idx + 1}</TableCell>
                                                    <TableCell className="font-medium">{ar.athlete.name}</TableCell>
                                                    <TableCell className="font-mono text-sm">{ar.athlete.iin || "—"}</TableCell>
                                                    <TableCell>{ar.athlete.gender}</TableCell>
                                                    <TableCell>{ar.athlete.category}</TableCell>
                                                    <TableCell>{ar.athlete.type}</TableCell>
                                                    <TableCell>{ar.coach?.name || "—"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Meta */}
                            <div className="text-sm text-muted-foreground">
                                <p>Подано: {formatDate(selectedRegistration.createdAt)}</p>
                                <p>Пользователь: {selectedRegistration.user.username}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-shrink-0 border-t pt-4">
                        {selectedRegistration?.status === "PENDING" && !isRegionalRep && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        openRejectDialog(selectedRegistration);
                                    }}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Отклонить
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(selectedRegistration.id)}
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
                        <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                            Закрыть
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
                            Укажите причину отклонения заявки {selectedRegistration?.registrationNumber}
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
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Отклонить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
