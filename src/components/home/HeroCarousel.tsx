"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

interface Slide {
    id: number;
    title: string;
    titleKk?: string;
    titleEn?: string;
    description?: string;
    descriptionKk?: string;
    descriptionEn?: string;
    image: string;
    imageClass?: string;
    linkUrl?: string;
    isActive: boolean;
}

export function HeroCarousel() {
    const locale = useLocale();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSlides() {
            try {
                const res = await fetch('/api/slides');
                const data = await res.json();
                if (data.data) {
                    setSlides(data.data.filter((s: Slide) => s.isActive));
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }
        fetchSlides();
    }, []);

    const getLocalizedTitle = (slide: Slide) => {
        if (locale === 'kk' && slide.titleKk) return slide.titleKk;
        if (locale === 'en' && slide.titleEn) return slide.titleEn;
        return slide.title;
    };

    const getLocalizedDescription = (slide: Slide) => {
        if (locale === 'kk' && slide.descriptionKk) return slide.descriptionKk;
        if (locale === 'en' && slide.descriptionEn) return slide.descriptionEn;
        return slide.description || '';
    };

    const nextSlide = useCallback(() => {
        if (slides.length === 0) return;
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length === 0) return;
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    const goToSlide = (index: number) => {
        setCurrent(index);
    };

    useEffect(() => {
        if (isPaused || slides.length === 0) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide, slides.length]);

    if (loading) {
        return (
            <section className="w-full bg-[#f4f4f4] py-5">
                <div className="w-full max-w-[1200px] mx-auto h-[400px] md:h-[600px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    if (slides.length === 0) {
        return null;
    }

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
                    {slides.map((slide) => (
                        <div key={slide.id} className="min-w-full flex-shrink-0">
                            {slide.linkUrl ? (
                                <Link href={slide.linkUrl} className="block">
                                    {/* Image Part */}
                                    <div className="relative w-full h-[300px] md:h-[500px]">
                                        <Image
                                            src={slide.image}
                                            alt={getLocalizedTitle(slide)}
                                            fill
                                            className={slide.imageClass || "object-cover"}
                                            priority={slide.id === slides[0]?.id}
                                        />
                                    </div>

                                    {/* Content Part */}
                                    <div className="p-6 bg-white border-t-4 border-[#C5A059] hover:bg-gray-50 transition-colors">
                                        <h2 className="text-[#7B1B1B] text-xl md:text-2xl font-bold uppercase mb-2.5">
                                            {getLocalizedTitle(slide)}
                                        </h2>
                                        <p className="text-[#222222] text-base leading-relaxed">
                                            {getLocalizedDescription(slide)}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <>
                                    {/* Image Part */}
                                    <div className="relative w-full h-[300px] md:h-[500px]">
                                        <Image
                                            src={slide.image}
                                            alt={getLocalizedTitle(slide)}
                                            fill
                                            className={slide.imageClass || "object-cover"}
                                            priority={slide.id === slides[0]?.id}
                                        />
                                    </div>

                                    {/* Content Part */}
                                    <div className="p-6 bg-white border-t-4 border-[#C5A059]">
                                        <h2 className="text-[#7B1B1B] text-xl md:text-2xl font-bold uppercase mb-2.5">
                                            {getLocalizedTitle(slide)}
                                        </h2>
                                        <p className="text-[#222222] text-base leading-relaxed">
                                            {getLocalizedDescription(slide)}
                                        </p>
                                    </div>
                                </>
                            )}
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
                    {slides.map((_, index) => (
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
