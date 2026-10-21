"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const SLIDE_INTERVAL_MS = 7000;

function getLocalizedField(item: Slide, field: 'title' | 'description', locale: string): string {
  const fieldMap = {
    ru: field,
    kk: `${field}Kk` as keyof Slide,
    en: `${field}En` as keyof Slide,
  };
  const localizedField = fieldMap[locale as keyof typeof fieldMap] || field;
  return (item[localizedField] as string) || (item[field] as string) || '';
}

interface HeroNewsSliderProps {
  // Слайды, загруженные на сервере: картинка первого слайда сразу попадает в HTML
  initialSlides?: Slide[];
  // Блок справа от текста слайда: ближайший турнир
  aside?: React.ReactNode;
}

function SlideControls({ count, current, onPrev, onNext, onSelect }: {
  count: number;
  current: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white/60 hover:bg-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white/60 hover:bg-white/10"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current ? "true" : undefined}
            className="flex h-6 cursor-pointer items-center"
          >
            <span
              className={cn(
                "block h-1 rounded-full transition-all duration-300",
                index === current ? "w-8 bg-gold" : "w-4 bg-white/35 hover:bg-white/60"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// Hero главной: новости-слайды на всю ширину поверх тёмной поверхности бренда
export function HeroNewsSlider({ initialSlides, aside }: HeroNewsSliderProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides ?? []);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(!initialSlides);
  const locale = useLocale();
  const tNews = useTranslations("NewsPage");
  const tHeader = useTranslations("Header");
  const tHero = useTranslations("Hero");

  useEffect(() => {
    if (initialSlides) return;
    async function fetchSlides() {
      try {
        const res = await fetch('/api/slides?isActive=true');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setSlides(data.data);
        }
      } catch (err) {
        console.error('Failed to load slides:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, [initialSlides]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;
    const interval = setInterval(nextSlide, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  const slide = slides[current];

  return (
    <div
      className="relative isolate overflow-hidden surface-inverse"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Фото слайдов: плавная смена, затемнение слева и снизу под текст */}
      <div className="absolute inset-0 -z-10" aria-hidden={loading}>
        {loading && <div className="h-full w-full animate-pulse bg-white/5" />}
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === current ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={item.image}
              alt=""
              fill
              className={cn(item.imageClass || "object-cover", index === current && "motion-safe:animate-hero-zoom")}
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-deep from-10% via-primary-deep/80 via-50% to-primary-deep/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/20 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[540px] w-full max-w-7xl flex-col justify-end px-4 pt-16 pb-28 sm:px-6 md:min-h-[620px] md:pb-32 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {slide ? (
              <div key={slide.id} className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
                <Badge variant="inverse" className="mb-5">{tHeader("news")}</Badge>
                <h2 className="type-h1 line-clamp-3 max-w-3xl text-white lg:text-[3.25rem] lg:leading-[1.08]">
                  {getLocalizedField(slide, 'title', locale)}
                </h2>
                {getLocalizedField(slide, 'description', locale) && (
                  <p className="type-lead mt-5 line-clamp-2 max-w-2xl text-white/75">
                    {getLocalizedField(slide, 'description', locale)}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                  <Button variant="inverse" size="lg" asChild>
                    <Link href={slide.linkUrl || "/media/news"}>
                      {tNews("read_more")}
                      <ArrowRight />
                    </Link>
                  </Button>
                  {slides.length > 1 && (
                    <SlideControls
                      count={slides.length}
                      current={current}
                      onPrev={prevSlide}
                      onNext={nextSlide}
                      onSelect={setCurrent}
                    />
                  )}
                </div>
              </div>
            ) : (
              !loading && <p className="type-display max-w-3xl text-white">{tHero("federation_name")}</p>
            )}
          </div>
          {aside && <div className="lg:col-span-4">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
