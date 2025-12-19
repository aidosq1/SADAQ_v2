"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Slide {
  id: number;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  image: string;
  imageClass?: string | null;
}

function getLocalizedField(item: Slide, field: 'title' | 'description', locale: string): string {
  const fieldMap = {
    ru: field,
    kk: `${field}Kk` as keyof Slide,
    en: `${field}En` as keyof Slide,
  };
  const localizedField = fieldMap[locale as keyof typeof fieldMap] || field;
  return (item[localizedField] as string) || (item[field] as string) || '';
}

export function HeroNewsSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch('/api/slides?isActive=true');
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setSlides(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch slides:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const readMoreText = locale === 'kk' ? 'Толық оқу' : locale === 'en' ? 'Read more' : 'Читать полностью';

  if (loading) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black text-white flex items-center justify-center rounded-none md:rounded-l-none">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black text-white group rounded-none md:rounded-l-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
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
              alt={getLocalizedField(slide, 'title', locale)}
              fill
              className={slide.imageClass || "object-cover"}
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
                  {getLocalizedField(slide, 'title', locale)}
                </h2>
                <p className="font-sans text-sm text-white/90 mb-4 font-light leading-relaxed line-clamp-3">
                  {getLocalizedField(slide, 'description', locale)}
                </p>
                <Link
                  href="/media"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-medium uppercase tracking-wider group/link"
                >
                  {readMoreText}
                  <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots Indicator */}
      <div className="absolute top-4 right-4 z-20 flex justify-end gap-1.5">
        {slides.map((_, index) => (
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
