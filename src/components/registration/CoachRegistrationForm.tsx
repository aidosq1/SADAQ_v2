"use client";

import { KAZAKHSTAN_REGIONS, CATEGORIES, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Upload, CheckCircle2, AlertTriangle, UserCheck, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Gender = "M" | "F";

interface Participant {
    id: number;
    fullName: string;
    iin: string;
    dob: string;
    gender: Gender;
    category: string;
    weaponClass: string;
    coachName: string;
}

interface JudgeInfo {
    fullName: string;
    category: string;
    region: string;
}

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

export function CoachRegistrationForm() {
    const t_regions = useTranslations("Regions");
    const locale = useLocale();
    const { data: session } = useSession();

    // --- State ---
    const [regionId, setRegionId] = useState<string>("");

    const [judge, setJudge] = useState<JudgeInfo>({
        fullName: "",
        category: "National",
        region: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [participants, setParticipants] = useState<Participant[]>([
        { id: 1, fullName: "", iin: "", dob: "", gender: "M", category: "Adults", weaponClass: "Recurve", coachName: "" }
    ]);

    // Effect to set region from session
    useEffect(() => {
        if (session?.user?.name) {
            setRegionId(session.user.name);
            setJudge(prev => ({ ...prev, region: session.user?.name || "" }));
        }
    }, [session]);

    // --- Validation Logic (Max 4 per Category) ---
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        participants.forEach(p => {
            if (p.category && p.gender && p.weaponClass) {
                const key = `${p.category}-${p.gender}-${p.weaponClass}`;
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        return counts;
    }, [participants]);

    const getCategoryStatus = (p: Participant) => {
        const key = `${p.category}-${p.gender}-${p.weaponClass}`;
        const count = categoryCounts[key] || 0;
        if (count > 4) return "error";
        return "ok";
    };

    // --- Handlers ---
    const addParticipant = () => {
        setParticipants([
            ...participants,
            { id: Date.now(), fullName: "", iin: "", dob: "", gender: "M", category: "Adults", weaponClass: "Recurve", coachName: "" }
        ]);
    };

    const removeParticipant = (id: number) => {
        if (participants.length > 1) {
            setParticipants(participants.filter(p => p.id !== id));
        }
    };

    const handleIINChange = (id: number, value: string) => {
        if (!/^\d*$/.test(value) || value.length > 12) return;

        setParticipants(prev => prev.map(p => {
            if (p.id !== id) return p;

            let updates: Partial<Participant> = { iin: value };

            if (value.length === 12) {
                // Mock IIN parsing logic
                const yearPrefix = parseInt(value.substring(0, 2)) > 30 ? "19" : "20"; // Simple assumption
                const dob = `${value.substring(4, 6)}.${value.substring(2, 4)}.${yearPrefix}${value.substring(0, 2)}`;
                const genderDigit = parseInt(value.charAt(6));
                const gender = genderDigit % 2 !== 0 ? "M" : "F";

                // Estimate Category based on year
                const birthYear = parseInt(`${yearPrefix}${value.substring(0, 2)}`);
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;
                let category = "Adults";
                if (age < 18) category = "Cadets";
                else if (age < 21) category = "Juniors";

                updates = { ...updates, dob, gender, category };
                toast.success("Данные участника загружены");
            }

            return { ...p, ...updates };
        }));
    };

    const updateParticipant = (id: number, field: keyof Participant, value: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    return (
        <div className="space-y-10">
            {/* 1. Header & Region */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-heading font-bold text-primary">Регион / Команда</h2>
                    <p className="text-sm text-muted-foreground">Выберите регион, который вы представляете.</p>
                </div>
                <div className="w-full md:w-72">
                    <Select value={regionId} onValueChange={(v) => {
                        setRegionId(v);
                        setJudge(prev => ({ ...prev, region: v })); // Auto-set judge region
                    }}>
                        <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Выберите регион" />
                        </SelectTrigger>
                        <SelectContent>
                            {KAZAKHSTAN_REGIONS.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                    {t_regions(region.id as any)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 2. Judge Section (Mandatory) */}
            <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-secondary/30 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Судейский состав</CardTitle>
                            <CardTitle className="text-sm font-normal text-muted-foreground mt-1">
                                От каждого региона обязательно участие одного судьи.
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Ф.И.О. Судьи <span className="text-destructive">*</span></Label>
                            <Input
                                value={judge.fullName}
                                onChange={(e) => setJudge({ ...judge, fullName: e.target.value })}
                                placeholder="Введите ФИО судьи"
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Судейская категория</Label>
                            <Select value={judge.category} onValueChange={(v) => setJudge({ ...judge, category: v })}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="International">Международная категория</SelectItem>
                                    <SelectItem value="National">Национальная категория</SelectItem>
                                    <SelectItem value="First">1-я категория</SelectItem>
                                    <SelectItem value="Second">2-я категория</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Athletes Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-primary">Список спортсменов</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={addParticipant} className="border-primary/20 hover:bg-primary/5 text-primary">
                            <Plus className="mr-2 h-4 w-4" /> Добавить
                        </Button>
                        <Button variant="outline" className="hidden sm:flex">
                            <Upload className="mr-2 h-4 w-4" /> Загрузить Excel
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead className="w-[140px]">ИИН</TableHead>
                                <TableHead className="min-w-[200px]">Ф.И.О.</TableHead>
                                <TableHead className="w-[120px]">Дисциплина</TableHead>
                                <TableHead className="w-[140px]">Категория</TableHead>
                                <TableHead className="w-[200px]">Тренер</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {participants.map((p, index) => {
                                const status = getCategoryStatus(p);
                                const isError = status === "error";

                                return (
                                    <TableRow key={p.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="relative group">
                                                <Input
                                                    value={p.iin}
                                                    onChange={(e) => handleIINChange(p.id, e.target.value)}
                                                    placeholder="12 цифр"
                                                    className={cn(
                                                        "h-9 font-mono text-sm",
                                                        p.iin.length === 12 ? "border-green-500/50 bg-green-50/50" : ""
                                                    )}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Input
                                                    value={p.fullName}
                                                    onChange={(e) => updateParticipant(p.id, "fullName", e.target.value)}
                                                    placeholder="Фамилия Имя"
                                                    className="h-9"
                                                />
                                                {/* Mobile-only extra info could go here */}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={p.weaponClass} onValueChange={(v) => updateParticipant(p.id, "weaponClass", v)}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BOW_TYPES.map((t) => (
                                                        <SelectItem key={t.id} value={t.id}>{getLocalizedLabel(t, locale)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Select value={p.category} onValueChange={(v) => updateParticipant(p.id, "category", v)}>
                                                    <SelectTrigger className={cn("h-9", isError && "border-destructive ring-destructive/20")}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATEGORIES.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id}>{getLocalizedLabel(cat, locale)}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {isError && (
                                                    <div className="text-[10px] text-destructive font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Превышен лимит (4)
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={p.coachName}
                                                onChange={(e) => updateParticipant(p.id, "coachName", e.target.value)}
                                                placeholder="ФИО Тренера"
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-destructive h-9 w-9">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Participants Cards (Mobile) */}
                <div className="md:hidden space-y-4">
                    {participants.map((p, index) => (
                        <div key={p.id} className="border rounded-lg p-4 space-y-4 shadow-sm relative bg-card">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-lg text-primary">#{index + 1}</span>
                                <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-destructive -mt-2 -mr-2">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>

                            <Input
                                value={p.iin}
                                onChange={(e) => handleIINChange(p.id, e.target.value)}
                                placeholder="ИИН (12 цифр)"
                                className={cn("font-mono", p.iin.length === 12 ? "border-green-500/50 bg-green-50/50" : "")}
                            />

                            <Input
                                value={p.fullName}
                                onChange={(e) => updateParticipant(p.id, "fullName", e.target.value)}
                                placeholder="Ф.И.О."
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Select value={p.weaponClass} onValueChange={(v) => updateParticipant(p.id, "weaponClass", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Дисциплина" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BOW_TYPES.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>{getLocalizedLabel(t, locale)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={p.category} onValueChange={(v) => updateParticipant(p.id, "category", v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Категория" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{getLocalizedLabel(cat, locale)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Input
                                value={p.coachName}
                                onChange={(e) => updateParticipant(p.id, "coachName", e.target.value)}
                                placeholder="ФИО Тренера"
                            />
                        </div>
                    ))}
                </div>

                {/* Validation Summary */}
                {Object.entries(categoryCounts).map(([key, count]) => {
                    if (count > 4) {
                        const [cat, gen, weap] = key.split("-");
                        return (
                            <div key={key} className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>
                                    Внимание: В категории <b>{weap} {cat} ({gen})</b> заявлено <b>{count}</b> участников. Максимум допускается 4.
                                </span>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            <Separator />

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    Всего участников: <span className="font-medium text-foreground">{participants.length}</span>
                </div>
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-accent hover:bg-accent/90 text-white min-w-[200px] text-lg h-12"
                >
                    {isSubmitting ? "Отправка..." : "Отправить заявку"}
                </Button>
            </div>
        </div>
    );

    async function handleSubmit() {
        // Basic Client Validation
        if (!judge.fullName.trim()) {
            toast.error("Заполните ФИО судьи");
            return;
        }
        if (participants.some(p => !p.fullName.trim())) {
            toast.error("У всех участников должно быть заполнено ФИО");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    judge,
                    participants
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Ошибка при отправке");
                setIsSubmitting(false);
                return;
            }

            toast.success("Заявка успешно отправлена!");
            // Optional: Redirect or Clear form
        } catch (error) {
            toast.error("Произошла ошибка сети");
        } finally {
            setIsSubmitting(false);
        }
    }
}
