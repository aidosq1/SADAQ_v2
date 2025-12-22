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

export interface NewCoachData {
    name: string;
    phone?: string;
    email?: string;
}

interface AddCoachDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: NewCoachData) => void;
}

export function AddCoachDialog({
    open,
    onOpenChange,
    onSave,
}: AddCoachDialogProps) {
    const [formData, setFormData] = useState<NewCoachData>({
        name: "",
        phone: "",
        email: "",
    });

    const handleSave = () => {
        if (!formData.name) {
            return;
        }
        onSave(formData);
        setFormData({
            name: "",
            phone: "",
            email: "",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Добавить тренера</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="coach-name">ФИО *</Label>
                        <Input
                            id="coach-name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Иванов Иван Иванович"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="coach-phone">Телефон (необязательно)</Label>
                        <Input
                            id="coach-phone"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="+7 (777) 123-45-67"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="coach-email">Email (необязательно)</Label>
                        <Input
                            id="coach-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="coach@example.com"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.name}>
                        Добавить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
