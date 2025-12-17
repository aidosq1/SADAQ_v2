"use client";

import { KAZAKHSTAN_REGIONS } from "@/lib/constants";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Gender = "M" | "F";

interface Participant {
    id: number;
    fullName: string;
    iin: string;
    dob: string;
    gender: Gender;
    category: string;
    weaponClass: string;
}

export function CoachRegistrationForm() {
    const [participants, setParticipants] = useState<Participant[]>([
        { id: 1, fullName: "", iin: "", dob: "", gender: "M", category: "", weaponClass: "" }
    ]);

    const addParticipant = () => {
        setParticipants([
            ...participants,
            { id: Date.now(), fullName: "", iin: "", dob: "", gender: "M", category: "", weaponClass: "" }
        ]);
    };

    const removeParticipant = (id: number) => {
        if (participants.length > 1) {
            setParticipants(participants.filter(p => p.id !== id));
        }
    };

    const handleIINChange = (id: number, value: string) => {
        // Basic validation: digits only, max 12
        if (!/^\d*$/.test(value) || value.length > 12) return;

        setParticipants(prev => prev.map(p => {
            if (p.id !== id) return p;

            // Auto-fill logic from IIN
            let updates: Partial<Participant> = { iin: value };

            if (value.length === 12) {
                // Mock extraction logic
                const yearPrefix = parseInt(value.substring(0, 2)) > 20 ? "19" : "20";
                const dob = `${value.substring(4, 6)}.${value.substring(2, 4)}.${yearPrefix}${value.substring(0, 2)}`;
                const genderDigit = parseInt(value.charAt(6));
                const gender = genderDigit % 2 !== 0 ? "M" : "F";

                // Check Age Category Logic (Simplified)
                // Real implementation would calculate exact age
                const birthYear = parseInt(`${yearPrefix}${value.substring(0, 2)}`);
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;
                let category = "Adults";
                if (age < 18) category = "Cadets";
                else if (age < 21) category = "Juniors";

                updates = { ...updates, dob, gender, category };
                toast.success(`Данные для ИИН ${value} загружены`);
            }

            return { ...p, ...updates };
        }));
    };

    const updateField = (id: number, field: keyof Participant, value: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    return (
        <div className="space-y-8">
            {/* Coach Info Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                    <Label>Регион / Город</Label>



                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите регион" />
                        </SelectTrigger>
                        <SelectContent>
                            {KAZAKHSTAN_REGIONS.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                    {region.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Телефон тренера</Label>
                    <Input placeholder="+7 (___) ___-__-__" />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="coach@example.com" type="email" />
                </div>
            </div>

            {/* Participants Grid (Desktop) */}
            <div className="hidden md:block rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead className="w-[180px]">ИИН</TableHead>
                            <TableHead>Ф.И.О.</TableHead>
                            <TableHead className="w-[120px]">Дата рожд.</TableHead>
                            <TableHead className="w-[80px]">Пол</TableHead>
                            <TableHead className="w-[150px]">Категория</TableHead>
                            <TableHead className="w-[180px]">Класс оружия</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((p, index) => (
                            <TableRow key={p.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <div className="relative">
                                        <Input
                                            value={p.iin}
                                            onChange={(e) => handleIINChange(p.id, e.target.value)}
                                            placeholder="12 цифр"
                                            className={cn(
                                                p.iin.length === 12 ? "border-green-500 pr-8" : "",
                                                p.iin.length > 0 && p.iin.length < 12 ? "border-red-500" : ""
                                            )}
                                        />
                                        {p.iin.length === 12 && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-2 top-2.5" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={p.fullName}
                                        onChange={(e) => updateField(p.id, "fullName", e.target.value)}
                                        placeholder="Фамилия Имя"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input value={p.dob} readOnly className="bg-muted text-muted-foreground" />
                                </TableCell>
                                <TableCell>
                                    <Select value={p.gender} onValueChange={(v) => updateField(p.id, "gender", v as Gender)}>
                                        <SelectTrigger className="bg-muted" disabled>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">М</SelectItem>
                                            <SelectItem value="F">Ж</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select value={p.category} onValueChange={(v) => updateField(p.id, "category", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Adults">Взрослые</SelectItem>
                                            <SelectItem value="Juniors">Юниоры</SelectItem>
                                            <SelectItem value="Cadets">Кадеты</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select value={p.weaponClass} onValueChange={(v) => updateField(p.id, "weaponClass", v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Класс" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Recurve">Классический</SelectItem>
                                            <SelectItem value="Compound">Блочный</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Participants Cards (Mobile) */}
            <div className="md:hidden space-y-4">
                {participants.map((p, index) => (
                    <div key={p.id} className="border rounded-lg p-4 space-y-4 shadow-sm relative">
                        <div className="absolute top-2 right-2">
                            <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)} className="text-muted-foreground hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="font-bold text-lg mb-2">Участник #{index + 1}</div>

                        <div className="space-y-2">
                            <Label>ИИН</Label>
                            <div className="relative">
                                <Input
                                    value={p.iin}
                                    onChange={(e) => handleIINChange(p.id, e.target.value)}
                                    placeholder="12 цифр"
                                    className={cn(
                                        p.iin.length === 12 ? "border-green-500 pr-8" : "",
                                        p.iin.length > 0 && p.iin.length < 12 ? "border-red-500" : ""
                                    )}
                                />
                                {p.iin.length === 12 && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-2 top-2.5" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Ф.И.О.</Label>
                            <Input
                                value={p.fullName}
                                onChange={(e) => updateField(p.id, "fullName", e.target.value)}
                                placeholder="Фамилия Имя"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Дата рожд.</Label>
                                <Input value={p.dob} readOnly className="bg-muted text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label>Пол</Label>
                                <Select value={p.gender} onValueChange={(v) => updateField(p.id, "gender", v as Gender)}>
                                    <SelectTrigger className="bg-muted" disabled>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">М</SelectItem>
                                        <SelectItem value="F">Ж</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Категория</Label>
                            <Select value={p.category} onValueChange={(v) => updateField(p.id, "category", v)}>
                                <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Adults">Взрослые</SelectItem>
                                    <SelectItem value="Juniors">Юниоры</SelectItem>
                                    <SelectItem value="Cadets">Кадеты</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Класс оружия</Label>
                            <Select value={p.weaponClass} onValueChange={(v) => updateField(p.id, "weaponClass", v)}>
                                <SelectTrigger><SelectValue placeholder="Класс" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Recurve">Классический</SelectItem>
                                    <SelectItem value="Compound">Блочный</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={addParticipant}>
                        <Plus className="mr-2 h-4 w-4" /> Добавить строку
                    </Button>
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" /> Импорт Excel
                    </Button>
                </div>
                <Button size="lg">Подать заявку</Button>
            </div>
        </div>
    );
}
