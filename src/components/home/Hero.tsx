import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

export function Hero() {
    return (
        <section className="relative w-full overflow-hidden bg-[#2b1d16] py-24 lg:py-32 flex flex-col items-center justify-center min-h-[600px]">
            {/* Background Pattern Effects */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 border-r border-b border-[#c26e4e]/30 rounded-br-[100px]" />
                <div className="absolute bottom-0 right-0 w-64 h-64 border-l border-t border-[#c26e4e]/30 rounded-tl-[100px]" />
            </div>

            {/* Ornamental Corners (SVG) */}
            <div className="absolute top-0 left-0 w-48 h-48 lg:w-96 lg:h-96 pointer-events-none text-[#c26e4e]/10">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                    <path d="M0 0 L100 0 C50 0 10 40 0 100 Z" />
                    <path d="M10 10 L80 10 C50 10 20 40 10 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 rotate-180 pointer-events-none text-[#c26e4e]/10">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                    <path d="M0 0 L100 0 C50 0 10 40 0 100 Z" />
                    <path d="M10 10 L80 10 C50 10 20 40 10 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>


            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">

                {/* Main Heading */}
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-[#f0ebe5] leading-none">
                        Чемпионат
                    </h1>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-[#c26e4e] leading-none">
                        Казахстана 2025
                    </h1>
                </div>

                {/* Description */}
                <p className="text-lg md:text-xl text-[#f0ebe5]/80 max-w-2xl mx-auto leading-relaxed font-light">
                    Главное событие года в мире стрельбы из лука.<br className="hidden md:block" />
                    Лучшие спортсмены страны соберутся в Алматы.
                </p>

                {/* Details */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-[#c26e4e] py-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5" />
                        <span className="text-[#f0ebe5] font-medium tracking-wide">15–20 Февраля</span>
                    </div>
                    <div className="hidden md:block text-[#f0ebe5]/20">•</div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" />
                        <span className="text-[#f0ebe5] font-medium tracking-wide">Алматы, Трамплины</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <Button
                        size="lg"
                        className="bg-[#c26e4e] hover:bg-[#a85d40] text-white text-base px-8 h-12 rounded-md font-medium shadow-lg hover:shadow-[#c26e4e]/20 transition-all border border-[#c26e4e]"
                        asChild
                    >
                        <Link href="/calendar/register">
                            Подать заявку
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="bg-transparent border border-[#f0ebe5]/30 text-[#f0ebe5] hover:bg-[#f0ebe5]/10 hover:text-white text-base px-8 h-12 rounded-md font-medium"
                        asChild
                    >
                        <Link href="/calendar">Регламент</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
