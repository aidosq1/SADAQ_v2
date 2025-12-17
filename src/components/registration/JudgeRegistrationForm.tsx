"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function JudgeRegistrationForm() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>ИИН</Label>
                    <Input placeholder="12 цифр" />
                </div>
                <div className="space-y-2">
                    <Label>Ф.И.О.</Label>
                    <Input placeholder="Фамилия Имя Отчество" />
                </div>
                <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input placeholder="+7 (___) ___-__-__" />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="judge@example.com" type="email" />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Судейская категория</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="international">Судья международной категории</SelectItem>
                        <SelectItem value="national">Судья национальной категории</SelectItem>
                        <SelectItem value="first">Судья 1-й категории</SelectItem>
                        <SelectItem value="intern">Судья-стажер</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Опыт работы (кратко)</Label>
                <Textarea placeholder="Укажите последние турниры, где вы судили..." className="h-32" />
            </div>

            <div className="flex justify-end pt-4">
                <Button size="lg">Подать заявку</Button>
            </div>
        </div>
    );
}
