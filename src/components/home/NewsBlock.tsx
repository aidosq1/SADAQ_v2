import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function NewsBlock() {
    const news = [
        {
            id: 1,
            title: "Казахстанские лучники завоевали 3 золота на Кубке Азии",
            category: "Сборная",
            date: "15 Дек 2025",
            image: "/slides/archer_tokyo.png",
            main: true,
        },
        {
            id: 2,
            title: "Открыта регистрация на Чемпионат РК в закрытых помещениях",
            category: "Регионы",
            date: "14 Дек 2025",
            image: "https://images.unsplash.com/photo-1612872087720-48ca556fa550?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            main: false,
        },
        {
            id: 3,
            title: "World Archery обновил правила квалификации на Олимпиаду",
            category: "World Archery",
            date: "12 Дек 2025",
            image: "https://images.unsplash.com/photo-1599580479132-723a1a0ae636?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            main: false,
        }
    ];

    return (
        <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Новости Федерации</h2>
                <Link href="/media" className="text-sm font-medium text-primary hover:underline flex items-center">
                    Все новости <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
                {/* Main News */}
                <div className="relative group overflow-hidden rounded-xl bg-gray-100 h-full">
                    <Link href={`/media/${news[0].id}`} className="block h-full w-full">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url(${news[0].image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 p-8 text-white">
                            <Badge className="mb-3 bg-primary hover:bg-primary/90">{news[0].category}</Badge>
                            <div className="text-sm opacity-80 mb-2">{news[0].date}</div>
                            <h3 className="text-2xl font-bold leading-tight">{news[0].title}</h3>
                        </div>
                    </Link>
                </div>

                {/* Secondary News */}
                <div className="flex flex-col gap-8 h-full">
                    {news.slice(1).map((item) => (
                        <div key={item.id} className="relative group overflow-hidden rounded-xl bg-gray-100 flex-1">
                            <Link href={`/media/${item.id}`} className="block h-full w-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 p-6 text-white">
                                    <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-white/20 text-white border-none hover:bg-white/30">{item.category}</Badge>
                                    <div className="text-xs opacity-80 mb-1">{item.date}</div>
                                    <h3 className="text-lg font-bold leading-tight">{item.title}</h3>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
