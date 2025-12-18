"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Data from user's snippet
const SLIDES = [
    {
        id: 1,
        image: "/slides/slide1.jpg",
        title: "Республиканский турнир по Садақ Ату",
        description: "В столице прошел масштабный чемпионат среди лучших лучников страны. Узнайте, кто забрал золотой кубок в этом году..."
    },
    {
        id: 2,
        image: "/slides/archer_tokyo.png",
        title: "Мастер-класс для молодежи",
        description: "Национальные традиции предков: опытные тренеры провели открытый урок по стрельбе из традиционного лука для школьников Кызылорды."
    },
    {
        id: 3,
        image: "/slides/archer_tokyo.png",
        title: "Новые правила соревнований",
        description: "Федерация утвердила обновленный регламент проведения международных встреч. Ознакомьтесь с изменениями в правилах экипировки."
    }
];

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = useCallback(() => {
        setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
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
        <section className="w-full bg-[#f4f4f4] py-5">
            <div
                className="relative w-full max-w-[1200px] mx-auto overflow-hidden bg-white shadow-xl rounded-lg group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Slides Container */}
                <div
                    className="flex transition-transform duration-600 ease-in-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {SLIDES.map((slide) => (
                        <div key={slide.id} className="min-w-full flex-shrink-0">
                            {/* Image Part */}
                            <div className="relative w-full h-[300px] md:h-[500px]">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority={slide.id === 1}
                                />
                            </div>

                            {/* Content Part */}
                            <div className="p-6 bg-white border-t-4 border-[#C5A059]">
                                <h2 className="text-[#7B1B1B] text-xl md:text-2xl font-bold uppercase mb-2.5">
                                    {slide.title}
                                </h2>
                                <p className="text-[#222222] text-base leading-relaxed">
                                    {slide.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-5 top-[40%] -translate-y-1/2 bg-[#7B1B1B]/70 text-white p-4 rounded-full hover:bg-[#C5A059] transition-all z-10"
                    aria-label="Previous slide"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-5 top-[40%] -translate-y-1/2 bg-[#7B1B1B]/70 text-white p-4 rounded-full hover:bg-[#C5A059] transition-all z-10"
                    aria-label="Next slide"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>

                {/* Dots */}
                <div className="pb-6 pt-2 text-center bg-white">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`inline-block h-3 mx-1.5 rounded-full cursor-pointer transition-all duration-300 ${index === current
                                ? "w-[25px] bg-[#7B1B1B]"
                                : "w-3 bg-[#bbb] hover:bg-[#999]"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
