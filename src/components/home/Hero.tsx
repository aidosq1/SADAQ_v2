"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { HeroNewsSlider } from "@/components/home/HeroNewsSlider";
import { useTranslations } from "next-intl";

export function Hero() {
    const t = useTranslations("Hero");

    // This data would ideally come from a CMS or API
    const NEXT_EVENT = {
        badge: t("badge"),
        title: {
            prefix: "Чемпионат",
            highlight: "Казахстана 2025"
        },
        description: "Главное событие года в мире стрельбы из лука. Лучшие спортсмены страны соберутся в Алматы.",
        date: "15–20 Февраля",
        location: "Алматы, Трамплины",
        disciplines: "Recurve & Compound",
        link: "/calendar/register",
        regulationsLink: "/calendar"
    };

    return (
        <section className="relative w-full overflow-hidden bg-[#F9F7F2] min-h-[600px] flex items-center">
            {/* Background Pattern Effects - Gold/Bronze */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top Left Pattern */}
                <svg className="absolute top-0 left-0 w-[400px] h-[400px] text-[#C5A572]/20" viewBox="0 0 400 400" fill="none">
                    <path d="M0 0L200 0L100 100L0 200Z" fill="currentColor" />
                    <path d="M0 0L0 200L100 100L200 0Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M50 50L150 50L100 100L50 150Z" stroke="currentColor" strokeWidth="1" />
                    <circle cx="20" cy="20" r="4" fill="#B54B35" />
                </svg>

                {/* Bottom Right Pattern */}
                <svg className="absolute bottom-0 right-0 w-[500px] h-[500px] text-[#C5A572]/30" viewBox="0 0 500 500" fill="none">
                    <path d="M500 500L300 500L400 400L500 300Z" fill="currentColor" />
                    <path d="M400 400L300 300M450 450L350 350" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">

                {/* Left Content */}
                <div className="space-y-8 text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#B54B35]/30 bg-[#B54B35]/5 text-[#B54B35] text-xs font-bold tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B54B35]" />
                        {NEXT_EVENT.badge}
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-0">
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 leading-[0.9] tracking-tight">
                            {NEXT_EVENT.title.prefix}
                        </h1>
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[#B54B35] leading-[0.9] tracking-tight italic">
                            {NEXT_EVENT.title.highlight}
                        </h1>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                        <div className="h-px w-24 bg-[#B54B35]/30" />
                        <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed font-light">
                            {NEXT_EVENT.description}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-6 text-gray-700">
                        <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-lg border border-[#C5A572]/20">
                            <Calendar className="w-5 h-5 text-[#B54B35]" />
                            <span className="font-medium">{NEXT_EVENT.date}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-lg border border-[#C5A572]/20">
                            <MapPin className="w-5 h-5 text-[#B54B35]" />
                            <span className="font-medium">{NEXT_EVENT.location}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <Button
                            size="lg"
                            className="bg-[#EADBC8] hover:bg-[#EADBC8]/80 text-[#5A3A2A] text-base px-8 h-12 rounded-lg font-bold shadow-md transition-all border border-[#C5A572]/30"
                            asChild
                        >
                            <Link href={NEXT_EVENT.link} className="flex items-center gap-2">
                                {t("apply")} <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-transparent border border-[#5A3A2A]/20 text-[#5A3A2A] hover:bg-[#5A3A2A]/5 text-base px-8 h-12 rounded-lg font-medium"
                            asChild
                        >
                            <Link href={NEXT_EVENT.regulationsLink}>{t("regulations")}</Link>
                        </Button>
                    </div>
                </div>

                {/* Right Visual - Frosted Card */}
                <div className="hidden lg:flex justify-end relative h-[500px]">
                    {/* The large frosted card container */}
                    <div className="absolute right-0 top-0 bottom-0 w-[400px] md:w-[500px] lg:w-[600px] h-full rounded-[30px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-end border border-white/60">
                        {/* News Slider Component */}
                        <HeroNewsSlider />
                    </div>
                </div>

            </div>
        </section>
    );
}
