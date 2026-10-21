"use client";

import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/date-format";
import { getNewsCategoryLabel } from "@/lib/constants";
import { Section, SectionHeader } from "@/components/ui/section";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Badge } from "@/components/ui/badge";
import { MediaCard } from "@/components/ui/media-card";

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
  };
}

function getLocalizedTitle(item: NewsItem, locale: string): string {
  if (locale === 'kk' && item.titleKk) return item.titleKk;
  if (locale === 'en' && item.titleEn) return item.titleEn;
  return item.title;
}


export function NewsBlockClient({ news, locale, translations }: NewsBlockClientProps) {
  if (news.length === 0) return null;

  return (
    <Section>
      <SectionHeader
        title={translations.sectionTitle}
        action={<ArrowLink href="/media/news">{translations.allNewsText}</ArrowLink>}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {news.map((item) => (
          <MediaCard
            key={item.id}
            href={`/media/news/${item.slug}`}
            title={getLocalizedTitle(item, locale)}
            image={item.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            badge={<Badge variant="brand">{getNewsCategoryLabel(item.category, locale)}</Badge>}
            meta={
              <>
                <Calendar className="size-3.5" />
                <span suppressHydrationWarning>{formatDate(item.publishedAt, locale)}</span>
              </>
            }
          />
        ))}
      </div>
    </Section>
  );
}
