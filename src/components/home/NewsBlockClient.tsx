"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";

interface NewsItem {
  id: number;
  slug: string;
  image: string | null;
  category: string;
  publishedAt: Date;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
}

interface NewsBlockClientProps {
  news: NewsItem[];
  locale: string;
  translations: {
    sectionTitle: string;
    allNewsText: string;
    pressCenter: string;
    readMore: string;
  };
}

function getLocalizedTitle(item: NewsItem, locale: string): string {
  if (locale === 'kk' && item.titleKk) return item.titleKk;
  if (locale === 'en' && item.titleEn) return item.titleEn;
  return item.title;
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(
    locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU',
    { day: 'numeric', month: 'long', year: 'numeric' }
  ).format(new Date(date));
}

export function NewsBlockClient({ news, locale, translations }: NewsBlockClientProps) {
  if (news.length === 0) return null;

  return (
    <section className="py-16 bg-[hsl(var(--light-gray))]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-medium text-[hsl(var(--official-gold))] uppercase tracking-wider mb-2 block">
              {translations.pressCenter}
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[hsl(var(--official-navy))] gold-accent">
              {translations.sectionTitle}
            </h2>
          </div>
          <Link
            href="/media/news"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[hsl(var(--official-blue))] hover:underline"
          >
            {translations.allNewsText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* News Grid - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/media/news/${item.slug}`}
              className="group bg-white border border-[hsl(var(--border-light))] rounded-lg overflow-hidden hover-lift"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image || '/slides/archer_tokyo.png'}
                  alt={getLocalizedTitle(item, locale)}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="official-badge">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
                  <Calendar className="w-3 h-3" />
                  {formatDate(item.publishedAt, locale)}
                </div>
                <h3 className="font-heading font-semibold text-[hsl(var(--official-navy))] leading-snug line-clamp-2 group-hover:text-[hsl(var(--official-blue))] transition-colors">
                  {getLocalizedTitle(item, locale)}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 md:hidden text-center">
          <Link
            href="/media/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--official-navy))] text-white font-medium rounded-lg hover:bg-[hsl(var(--official-navy))]/90 transition-colors"
          >
            {translations.allNewsText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
