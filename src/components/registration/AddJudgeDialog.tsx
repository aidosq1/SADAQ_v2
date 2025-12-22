"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const JUDGE_CATEGORIES = [
    { id: "international", ru: "Международный", kk: "Халықаралық", en: "International" },
    { id: "national", ru: "Национальный", kk: "Ұлттық", en: "National" },
    { id: "first", ru: "Первая категория", kk: "Бірінші санат", en: "First Category" },
    { id: "second", ru: "Вторая категория", kk: "Екінші санат", en: "Second Category" },
    { id: "third", ru: "Третья категория", kk: "Үшінші санат", en: "Third Category" },
];

export interface NewJudgeData {
    name: string;
    category: string;
    phone?: string;
    email?: string;
}

interface AddJudgeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: NewJudgeData) => void;
    locale?: string;
}

export function AddJudgeDialog({
    open,
    onOpenChange,
    onSave,
    locale = "ru",
}: AddJudgeDialogProps) {
    const [formData, setFormData] = useState<NewJudgeData>({
        name: "",
        category: "",
        phone: "",
        email: "",
    });

    const handleSave = () => {
        if (!formData.name || !formData.category) {
            return;
        }
        onSave(formData);
        setFormData({
            name: "",
            category: "",
            phone: "",
            email: "",
        });
        onOpenChange(false);
    };

    const getLabel = (item: { ru: string; kk: string; en: string }) => {
        if (locale === "kk") return item.kk;
        if (locale === "en") return item.en;
        return item.ru;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Добавить судью</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="judge-name">ФИО *</Label>
                        <Input
                            id="judge-name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Иванов Иван Иванович"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Категория судьи *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {JUDGE_CATEGORIES.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {getLabel(c)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="judge-phone">Телефон (необязательно)</Label>
                        <Input
                            id="judge-phone"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="+7 (777) 123-45-67"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="judge-email">Email (необязательно)</Label>
                        <Input
                            id="judge-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="judge@example.com"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.name || !formData.category}>
                        Добавить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
