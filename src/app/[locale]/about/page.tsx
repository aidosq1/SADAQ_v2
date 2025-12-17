import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, MapPin, Globe, Medal, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative h-[500px] w-full flex items-center justify-center bg-gradient-to-b from-[#7B1B1B] to-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20 z-10" />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                    <div className="mb-8 animate-fade-in-up">
                        <Image src="/logo_federation_circular.png" alt="Logo" width={160} height={160} className="w-36 h-36 object-contain drop-shadow-2xl" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#D4AF37] drop-shadow-lg">
                        Национальная Федерация стрельбы из лука <br />
                        <span className="text-white">Республики Казахстан</span>
                    </h1>

                </div>
            </section>

            {/* Navigation Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { title: "Руководство", icon: <Users className="w-6 h-6" />, href: "/about/leadership" },
                        { title: "Регионы", icon: <MapPin className="w-6 h-6" />, href: "/about/regions" },
                        { title: "История", icon: <Trophy className="w-6 h-6" />, href: "/about/history" },
                        { title: "Документы", icon: <Activity className="w-6 h-6" />, href: "/documents" },
                    ].map((item, index) => (
                        <Link key={index} href={item.href} className="block group">
                            <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white text-foreground">
                                <CardContent className="flex items-center gap-4 p-6">
                                    <div className="bg-primary/5 text-primary p-4 rounded-full group-hover:bg-[#B54B35]/10 group-hover:text-[#B54B35] transition-colors duration-300">
                                        {item.icon}
                                    </div>
                                    <div className="font-bold text-lg group-hover:text-[#B54B35] transition-colors">{item.title}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                    }
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
                {/* Mission Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full font-medium text-sm">
                            Наша Миссия
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            Формирование здоровой и сильной нации
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Наша миссия — формирование здоровой и сильной нации через развитие массового спорта и воспитание чемпионов мирового уровня.
                            Мы стремимся сделать легкую атлетику самым доступным и популярным видом спорта в Казахстане,
                            создавая условия для раскрытия потенциала каждого атлета — от школьного стадиона до Олимпийского пьедестала.
                            Мы верим, что победы наших спортсменов вдохновляют молодежь и укрепляют дух всего народа.
                        </p>
                    </div>
                    <div className="bg-muted rounded-2xl h-[400px] relative overflow-hidden group">
                        {/* Placeholder for inspiring sport image */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/50">
                            <Activity className="w-16 h-16 opacity-20" />
                            {/* Consider adding <Image /> here later */}
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-12">Федерация в цифрах</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { number: "20+", label: "Регионов и филиалов", icon: <MapPin className="w-6 h-6" /> },
                            { number: "15 000+", label: "Активных спортсменов", icon: <Users className="w-6 h-6" /> },
                            { number: "350+", label: "Тренеров и судей", icon: <BadgeIcon className="w-6 h-6" /> },
                            { number: "50+", label: "Лет истории", icon: <Trophy className="w-6 h-6" /> },
                        ].map((stat, index) => (
                            <Card key={index} className="border-none shadow-lg bg-card text-card-foreground">
                                <CardContent className="pt-6 text-center space-y-4">
                                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl font-bold text-primary">{stat.number}</div>
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* International Recognition */}
                <section className="bg-secondary/30 rounded-3xl p-8 md:p-12">
                    <div className="text-center max-w-3xl mx-auto space-y-8">
                        <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h2 className="text-3xl font-bold">Международное признание</h2>
                        <p className="text-lg text-muted-foreground">
                            Федерация является полноправным членом <span className="font-semibold text-foreground">World Athletics</span> и <span className="font-semibold text-foreground">Asian Athletics Association</span>.
                            Мы соблюдаем высочайшие стандарты честной игры, антидопинговой политики и спортивной этики, представляя интересы Казахстана на мировой арене.
                        </p>

                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholders for Partner Logos */}
                            <div className="font-bold text-xl flex items-center gap-2"><Globe className="w-6 h-6" /> World Athletics</div>
                            <div className="font-bold text-xl flex items-center gap-2"><Medal className="w-6 h-6" /> Asian Athletics</div>
                            <div className="font-bold text-xl flex items-center gap-2"><Trophy className="w-6 h-6" /> НОК РК</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function BadgeIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z" />
        </svg>
    )
}

