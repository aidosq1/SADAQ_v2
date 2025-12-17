import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target, Calendar, Medal, TrendingUp } from "lucide-react";

export default function AthleteProfile({ params }: { params: { id: string } }) {
    // Mock data - in real app fetch by params.id
    const athlete = {
        name: "Ильфат Абдуллин",
        photo: "https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=300&h=300&fit=crop",
        region: "Алматинская обл.",
        dob: "09.01.1998",
        height: "178 см",
        bowType: "Классический (Recurve)",
        equipment: "Hoyt Formula Xi / Easton X10",
        classification: "МСМК (International)",
        rank: 1,
        totalPoints: 850,
        coach: "Константин Ким",
        pb: {
            m70: 680,
            m18: 592
        },
        medals: {
            gold: 12,
            silver: 5,
            bronze: 3
        },
        history: [
            { date: "16.12.2024", event: "Зимний Чемпионат РК", discipline: "Recurve", place: "1 место", points: 100, score: "675" },
            { date: "15.11.2024", event: "Кубок Федерации", discipline: "Recurve", place: "2 место", points: 80, score: "670" },
            { date: "10.08.2024", event: "Кубок Азии 2024", discipline: "Recurve", place: "1 место", points: 150, score: "678" },
            { date: "05.05.2024", event: "Гран-при Шымкент", discipline: "Recurve", place: "3 место", points: 60, score: "665" },
            { date: "12.12.2023", event: "Чемпионат Мира 2023", discipline: "Recurve", place: "9 место", points: 40, score: "668" }
        ]
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Bio & Equipment */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <Avatar className="w-48 h-48 mb-4 border-4 border-muted">
                                <AvatarImage src={athlete.photo} alt={athlete.name} />
                                <AvatarFallback>{athlete.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-2xl font-bold text-center mb-1">{athlete.name}</h1>
                            <div className="flex gap-2 mb-4">
                                <Badge variant="secondary">{athlete.region}</Badge>
                                <Badge className="bg-amber-500 hover:bg-amber-600">{athlete.classification}</Badge>
                            </div>

                            <div className="w-full space-y-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Дата рождения</span>
                                    <span className="font-medium">{athlete.dob}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Рост</span>
                                    <span className="font-medium">{athlete.height}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Тип лука</span>
                                    <span className="font-medium">{athlete.bowType}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Тренер</span>
                                    <span className="font-medium text-primary underline cursor-pointer">{athlete.coach}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> Экипировка</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{athlete.equipment}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Stats & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Rank & Points Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-primary/5 border-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Нац. Рейтинг</div>
                                <div className="text-4xl font-extrabold text-primary">#{athlete.rank}</div>
                            </CardContent>
                        </Card>
                        <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Очки</div>
                                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                                    {athlete.totalPoints} <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">PB (70m)</div>
                                <div className="text-3xl font-bold">{athlete.pb.m70}</div>
                            </CardContent>
                        </Card>
                        <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Карьера</div>
                                <div className="flex justify-center gap-1">
                                    <div className="flex flex-col items-center">
                                        <Medal className="h-5 w-5 text-yellow-500" />
                                        <span className="text-sm font-bold">{athlete.medals.gold}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Medal className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-bold">{athlete.medals.silver}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Medal className="h-5 w-5 text-amber-700" />
                                        <span className="text-sm font-bold">{athlete.medals.bronze}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> История выступлений (Activity Log)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Дата</TableHead>
                                        <TableHead>Турнир</TableHead>
                                        <TableHead>Дисциплина</TableHead>
                                        <TableHead>Место</TableHead>
                                        <TableHead className="text-right">Очки</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {athlete.history.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-muted-foreground font-mono text-xs">{item.date}</TableCell>
                                            <TableCell className="font-medium">{item.event}</TableCell>
                                            <TableCell>{item.discipline}</TableCell>
                                            <TableCell>
                                                <Badge variant={i === 0 ? "default" : "secondary"}>{item.place}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary">+{item.points}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Медиа</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="aspect-square bg-muted rounded-md relative overflow-hidden group cursor-pointer">
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs bg-black/5 group-hover:bg-black/20 transition-colors">
                                            Media {i}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
