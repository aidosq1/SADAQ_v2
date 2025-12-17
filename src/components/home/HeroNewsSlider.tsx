"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SLIDES = [
    {
        id: 1,
        image: "/slides/archer_tokyo.png",
        title: "Республиканский турнир по Садақ Ату",
        description: "В столице прошел масштабный чемпионат среди лучших лучников страны. Узнайте, кто забрал золотой кубок в этом году..."
    },
    {
        id: 2,
        image: "/slides/slide2.jpg",
        title: "Мастер-класс для молодежи",
        description: "Национальные традиции предков: опытные тренеры провели открытый урок по стрельбе из традиционного лука для школьников Кызылорды."
    },
    {
        id: 3,
        image: "/slides/slide3.jpg",
        title: "Новые правила соревнований",
        description: "Федерация утвердила обновленный регламент проведения международных встреч. Ознакомьтесь с изменениями в правилах экипировки."
    }
];

// ... imports

export function HeroNewsSlider() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, []);

    const goToSlide = (index: number) => {
        setCurrent(index);
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-black text-white group rounded-none md:rounded-l-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity ease-in-out ${index === current
                        ? "opacity-100 z-10 duration-700 delay-[250ms]"
                        : "opacity-0 z-0 duration-[250ms]"
                        }`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-end p-6 md:p-8">
                        <div className="w-full">
                            <div className={`transform transition-all duration-700 delay-500 ${index === current ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                                }`}>
                                <h2 className="font-heading text-xl md:text-2xl font-bold mb-3 leading-tight drop-shadow-lg line-clamp-3">
                                    {slide.title}
                                </h2>
                                <p className="font-sans text-sm text-white/90 mb-4 font-light leading-relaxed line-clamp-3">
                                    {slide.description}
                                </p>
                                <Link
                                    href="/media"
                                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-medium uppercase tracking-wider group/link"
                                >
                                    Читать полностью
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots Indicator */}
            <div className="absolute top-4 right-4 z-20 flex justify-end gap-1.5">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${index === current
                            ? "w-4 h-1 bg-white"
                            : "w-1 h-1 bg-white/40 hover:bg-white/70"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
