"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Users, ClipboardCheck } from "lucide-react";
import { CoachRegistrationForm } from "@/components/registration/CoachRegistrationForm";
import { JudgeRegistrationForm } from "@/components/registration/JudgeRegistrationForm";
import { StatusDashboard } from "@/components/registration/StatusDashboard";

export default function RegistrationPage() {
    const [activeTab, setActiveTab] = useState("coach");

    return (
        <div className="container py-10 max-w-5xl">
            <Toaster />
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Регистрация на турнир</h1>
                <p className="text-muted-foreground text-lg">
                    Чемпионат Республики Казахстан 2025 • 15–20 Февраля, Алматы
                </p>
            </div>

            <Tabs defaultValue="coach" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-16 items-center bg-muted/50 p-1">
                    <TabsTrigger value="coach" className="h-full flex gap-2 text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="h-5 w-5" />
                        Тренер / Команда
                    </TabsTrigger>
                    <TabsTrigger value="judge" className="h-full flex gap-2 text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <ClipboardCheck className="h-5 w-5" />
                        Судья
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">

                    <TabsContent value="coach">
                        <Card>
                            <CardHeader>
                                <CardTitle>Командная заявка</CardTitle>
                                <CardDescription>Массовая регистрация спортсменов от региона.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CoachRegistrationForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="judge">
                        <Card>
                            <CardHeader>
                                <CardTitle>Заявка на судейство</CardTitle>
                                <CardDescription>Регистрация в судейскую коллегию турнира.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <JudgeRegistrationForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            <StatusDashboard />
        </div>
    );
}
