import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

export function MediaBlock() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Медиа-центр</h2>
                <Button variant="ghost" asChild>
                    <Link href="/media">Все альбомы</Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
                {/* Large Item */}
                <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group cursor-pointer">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511370235399-1802c11d2a20?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")' }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-sm font-medium mb-1">Видео-обзор</div>
                        <div className="font-bold text-lg">Финал Кубка Мира 2024</div>
                    </div>
                </div>

                {/* Small Items */}
                <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden group cursor-pointer">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1554188248-986adbb73be4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")' }}
                    />
                </div>
                <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden group cursor-pointer">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1612872087720-48ca556fa550?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80")' }}
                    />
                </div>
                <div className="col-span-2 row-span-1 relative rounded-xl overflow-hidden group cursor-pointer bg-slate-100 flex items-center justify-center p-6 text-center">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Наш YouTube Канал</h3>
                        <p className="text-sm text-muted-foreground mb-4">Смотрите прямые трансляции и интервью</p>
                        <Button size="sm" variant="outline" className="text-primary border-primary/20 hover:bg-primary/5">Подписаться</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
