"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  linkUrl?: string | null;
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
      } catch {
        // silently fail
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

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const readMoreText = locale === 'kk' ? 'Толық оқу' : locale === 'en' ? 'Read more' : 'Подробнее';

  if (loading) {
    return (
      <div className="relative w-full h-full bg-[hsl(var(--light-cream))] flex items-center justify-center">
        <div className="text-[hsl(var(--muted-foreground))]">...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-full bg-[hsl(var(--official-maroon))] flex items-center justify-center text-white">
        <div className="text-center px-8">
          <h2 className="text-2xl font-heading font-bold mb-2">
            {locale === 'kk' ? 'Қазақстан Садақ Ату Федерациясы' : locale === 'en' ? 'Kazakhstan Archery Federation' : 'Федерация Стрельбы из Лука Казахстана'}
          </h2>
          <p className="text-white/70">
            {locale === 'kk' ? 'Ресми веб-сайт' : locale === 'en' ? 'Official Website' : 'Официальный сайт'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
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
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-end p-6 md:p-8">
            <div className="w-full max-w-xl">
              {/* Category Badge */}
              <span className="official-badge mb-3 inline-block">
                {locale === 'kk' ? 'Жаңалықтар' : locale === 'en' ? 'News' : 'Новости'}
              </span>

              <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight line-clamp-2">
                {getLocalizedField(slide, 'title', locale)}
              </h2>

              {getLocalizedField(slide, 'description', locale) && (
                <p className="text-sm md:text-base text-white/80 mb-4 line-clamp-2">
                  {getLocalizedField(slide, 'description', locale)}
                </p>
              )}

              <Link
                href={slide.linkUrl || "/media/news"}
                className="inline-flex items-center gap-2 text-[hsl(var(--official-gold))] hover:text-white transition-colors text-sm font-medium"
              >
                {readMoreText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === current
                  ? "w-6 h-2 bg-[hsl(var(--official-gold))]"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
