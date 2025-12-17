import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, FileText, Play, Trophy } from "lucide-react";

export function CalendarWidget() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Past Event */}
                <Card className="border-l-4 border-l-gray-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Прошедшее</CardTitle>
                        <Trophy className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">Кубок Федерации 2024</div>
                        <p className="text-xs text-muted-foreground mb-4">10-15 Декабря, Астана</p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/results"><FileText className="mr-2 h-3 w-3" /> Протокол</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Current Event */}
                <Card className="border-l-4 border-l-green-500 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Идет сейчас
                        </CardTitle>
                        <Play className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">Зимний Чемпионат РК</div>
                        <p className="text-xs text-muted-foreground mb-4">16-20 Декабря, Шымкент</p>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" asChild>
                            <Link href="/media"><Play className="mr-2 h-3 w-3" /> Смотреть Live</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Future Event */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Будущее</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">Чемпионат Азии 2025</div>
                        <p className="text-xs text-muted-foreground mb-4">5-12 Марта, Бангкок</p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/calendar"><FileText className="mr-2 h-3 w-3" /> Положение</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
