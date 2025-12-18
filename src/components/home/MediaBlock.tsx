import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function MediaBlock() {
    const t = useTranslations("MediaBlock");

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
                <Button variant="ghost" asChild>
                    <Link href="/media">{t("all_albums")}</Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px] md:h-auto flex-1">
                {/* Large Item */}
                <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group cursor-pointer min-h-[300px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: 'url("/slides/archer_tokyo.png")' }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-sm font-medium mb-1">{t("video_review")}</div>
                        <div className="font-bold text-lg">{t("world_cup_2024")}</div>
                    </div>
                </div>

                {/* Small Items */}
                <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden group cursor-pointer min-h-[150px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: 'url("/slides/archer_tokyo.png")' }}
                    />
                </div>
                <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden group cursor-pointer min-h-[150px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: 'url("/slides/archer_tokyo.png")' }}
                    />
                </div>
                <div className="col-span-2 row-span-1 relative rounded-xl overflow-hidden group cursor-pointer bg-slate-100 flex items-center justify-center p-6 text-center min-h-[150px]">
                    <div>
                        <h3 className="text-xl font-bold mb-2">{t("youtube_channel")}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t("youtube_desc")}</p>
                        <Button size="sm" variant="outline" className="text-primary border-primary/20 hover:bg-primary/5">{t("btn_subscribe")}</Button>
                    </div>
                </div>
            </div>
        </div>
    );

}
