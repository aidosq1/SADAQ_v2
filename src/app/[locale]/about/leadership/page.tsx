import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function LeadershipPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
            <h1 className="text-4xl font-bold mb-8">Руководство Федерации</h1>

            {/* President Section */}
            <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="shrink-0 mx-auto md:mx-0">
                        <div className="relative w-64 h-80 rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
                            {/* Placeholder for President Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <User className="w-20 h-20 opacity-20" />
                            </div>
                        </div>
                        <div className="mt-4 text-center md:text-left">
                            <h3 className="text-2xl font-bold">Мурзаханов Айдын</h3>
                            <p className="text-primary font-medium">Президент Федерации</p>
                        </div>
                    </div>
                    <div className="space-y-6 flex-1">
                        <h2 className="text-2xl font-semibold">Приветственное слово Президента</h2>
                        <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6 py-2">
                            "Дорогие друзья! Стрельба из лука — это не просто спорт, это наследие Великой Степи, живущее в крови нашего народа.
                            Мы гордимся нашими историческими корнями и современными достижениями наших атлетов на мировой арене.
                            Наша цель — сделать стрельбу из лука массовым и доступным спортом, воспитывая новое поколение чемпионов,
                            которые с честью поднимут флаг Казахстана на Олимпийских пьедесталах.
                            Вместе мы попадем точно в цель!"
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* Executive Committee */}
            <section>
                <h2 className="text-3xl font-bold mb-8">Исполнительный комитет</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { role: "Первый Вице-президент", name: "Имя Фамилия", desc: "Стратегическое развитие" },
                        { role: "Вице-президент (Регионы)", name: "Имя Фамилия", desc: "Координация филиалов" },
                        { role: "Генеральный секретарь", name: "Имя Фамилия", desc: "Операционное управление" },
                        { role: "Финансовый директор", name: "Имя Фамилия", desc: "Финансы и аудит" },
                    ].map((person, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
                                <Avatar className="w-24 h-24">
                                    <AvatarFallback>icon</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-lg">{person.name}</h4>
                                    <p className="text-sm font-medium text-primary">{person.role}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{person.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Coaching Council */}
            <section>
                <h2 className="text-3xl font-bold mb-8">Тренерский совет</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Главный тренер сборной</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar><AvatarFallback>GT</AvatarFallback></Avatar>
                                <div>
                                    <div className="font-bold">Имя Фамилия</div>
                                    <div className="text-sm text-muted-foreground">Главный тренер</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Старшие тренеры по видам</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {["Спринт", "Выносливость", "Прыжки", "Метания"].map((type, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="font-medium">{type}:</span>
                                        <span className="text-muted-foreground">Имя Фамилия</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
