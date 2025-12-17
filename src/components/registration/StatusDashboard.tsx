"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";

export function StatusDashboard() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");
    const [result, setResult] = useState<any>(null);

    const checkStatus = () => {
        if (!query) return;
        setStatus("loading");

        // Simulate API call
        setTimeout(() => {
            if (query === "123456789012" || query === "APP-001") {
                setResult({
                    id: "APP-001",
                    event: "Чемпионат РК 2025",
                    applicant: "Ильфат Абдуллин",
                    role: "Спортсмен",
                    status: "approved",
                    comment: "Допущен мандатной комиссией"
                });
                setStatus("found");
            } else if (query === "APP-002") {
                setResult({
                    id: "APP-002",
                    event: "Чемпионат РК 2025",
                    applicant: "Сборная Алматы",
                    role: "Тренер",
                    status: "rejected",
                    comment: "Некорректные данные в заявке №3"
                });
                setStatus("found");
            } else {
                setStatus("not-found");
            }
        }, 1000);
    };

    const statusMap: any = {
        pending: { label: "На проверке", color: "bg-yellow-500", variant: "secondary" },
        approved: { label: "Принята", color: "bg-green-500", variant: "default" },
        rejected: { label: "Отклонена", color: "bg-red-500", variant: "destructive" }
    };

    return (
        <section className="mt-16 pt-16 border-t">
            <div className="max-w-xl mx-auto text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Проверка статуса заявки</h2>
                <p className="text-muted-foreground">Введите ИИН участника или номер заявки, чтобы узнать текущий статус.</p>
            </div>

            <div className="max-w-md mx-auto flex gap-2 mb-8">
                <Input
                    placeholder="ИИН или Номер заявки"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button onClick={checkStatus} disabled={status === "loading"}>
                    {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>

            {status === "not-found" && (
                <div className="text-center text-muted-foreground">Заявка не найдена. Проверьте данные.</div>
            )}

            {status === "found" && result && (
                <Card className="max-w-2xl mx-auto border-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Заявка #{result.id}</CardTitle>
                            <CardDescription>{result.event}</CardDescription>
                        </div>
                        <Badge className={statusMap[result.status].color}>{statusMap[result.status].label}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Заявитель</span>
                            <span className="font-medium">{result.applicant}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Роль</span>
                            <span className="font-medium">{result.role}</span>
                        </div>
                        {result.comment && (
                            <div className="bg-muted p-3 rounded-md text-sm mt-4">
                                <span className="font-bold block mb-1">Примечание модератора:</span>
                                {result.comment}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
