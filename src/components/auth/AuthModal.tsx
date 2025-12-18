"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Target, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import { KAZAKHSTAN_REGIONS } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type UserRole = "coach" | "judge" | null;

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const t_regions = useTranslations("Regions");
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [role, setRole] = useState<UserRole>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fio: "",
        iin: "",
        phone: "",
        region: "",
        coachCategory: "",
        organization: "",
        judgeCategory: "",
        uniformSize: "",
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md w-full p-0 rounded-2xl shadow-2xl bg-white border-0 overflow-hidden sm:max-w-lg">
                <div className="p-8">
                    <DialogTitle className="sr-only">Authentication</DialogTitle>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger
                                value="login"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium transition-all"
                            >
                                Вход
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium transition-all"
                            >
                                Регистрация
                            </TabsTrigger>
                        </TabsList>

                        {/* LOGIN TAB */}
                        <TabsContent value="login" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Email или ИИН</Label>
                                    <Input
                                        placeholder="user@example.com"
                                        className="h-12 rounded-xl border-gray-200 focus:border-black focus:ring-black transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-semibold text-gray-700">Пароль</Label>
                                        <Button variant="link" className="p-0 h-auto text-xs text-gray-500 hover:text-black">Забыли пароль?</Button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            className="h-12 rounded-xl border-gray-200 focus:border-black focus:ring-black transition-all pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl">
                                Войти
                            </Button>
                        </TabsContent>

                        {/* REGISTER TAB */}
                        <TabsContent value="register" className="space-y-6 mt-0">
                            {/* Role Selection */}
                            {!role ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setRole("coach")}
                                        className="cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white p-6 hover:border-black transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center"
                                    >
                                        <div className="p-4 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors duration-300">
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <span className="font-bold text-lg group-hover:scale-105 transition-transform">Я Тренер</span>
                                    </div>

                                    <div
                                        onClick={() => setRole("judge")}
                                        className="cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-white p-6 hover:border-black transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center"
                                    >
                                        <div className="p-4 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors duration-300">
                                            <Gavel className="w-8 h-8" />
                                        </div>
                                        <span className="font-bold text-lg group-hover:scale-105 transition-transform">Я Судья</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {role === "coach" ? <Target className="w-5 h-5" /> : <Gavel className="w-5 h-5" />}
                                            Регистрация {role === "coach" ? "Тренера" : "Судьи"}
                                        </h3>
                                        <Button variant="ghost" size="sm" onClick={() => setRole(null)} className="text-xs text-muted-foreground hover:text-black">
                                            Сменить роль
                                        </Button>
                                    </div>

                                    {/* Common Fields */}
                                    <div className="space-y-3">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">ФИО</Label>
                                            <Input placeholder="Иванов Иван Иванович" className="rounded-lg focus:border-black focus:ring-black" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">ИИН</Label>
                                            <Input type="tel" placeholder="000000000000" maxLength={12} className="rounded-lg focus:border-black focus:ring-black" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Телефон</Label>
                                                <Input type="tel" placeholder="+7..." className="rounded-lg focus:border-black focus:ring-black" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</Label>
                                                <Input type="email" placeholder="example@mail.com" className="rounded-lg focus:border-black focus:ring-black" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditional Fields: Coach */}
                                    {role === "coach" && (
                                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Регион</Label>
                                                <Select>
                                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Выберите регион" /></SelectTrigger>
                                                    <SelectContent>
                                                        {KAZAKHSTAN_REGIONS.map((region) => (
                                                            <SelectItem key={region.id} value={region.id}>
                                                                {t_regions(region.id as any)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Организация</Label>
                                                <Input placeholder="ДЮСШ №..." className="bg-white rounded-lg focus:border-black focus:ring-black" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Conditional Fields: Judge */}
                                    {role === "judge" && (
                                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Категория</Label>
                                                <Select>
                                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="nat">Национальная</SelectItem>
                                                        <SelectItem value="int">Международная</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Размер формы</Label>
                                                <div className="flex gap-2">
                                                    {["S", "M", "L", "XL", "XXL"].map(size => (
                                                        <button
                                                            key={size}
                                                            onClick={() => setFormData(prev => ({ ...prev, uniformSize: size }))}
                                                            className={cn(
                                                                "flex-1 h-10 rounded-md border text-sm font-medium transition-all hover:border-black",
                                                                formData.uniformSize === size ? "bg-black text-white border-black" : "bg-white text-gray-700"
                                                            )}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Придумайте Пароль</Label>
                                        <Input type="password" className="rounded-lg focus:border-black focus:ring-black" />
                                    </div>

                                    <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold text-base transition-all shadow-lg">
                                        Зарегистрироваться
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
