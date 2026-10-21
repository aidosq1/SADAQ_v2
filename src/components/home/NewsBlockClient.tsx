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

function NewsDate({ date, locale }: { date: Date; locale: string }) {
  return (
    <>
      <Calendar className="size-3.5" />
      <span suppressHydrationWarning>{formatDate(date, locale)}</span>
    </>
  );
}

// Новости главной: последняя — крупно с текстом на фото, следующие — списком справа
export function NewsBlockClient({ news, locale, translations }: NewsBlockClientProps) {
  if (news.length === 0) return null;

  const [featured, ...rest] = news;

  return (
    <Section className="pt-12 md:pt-16">
      <SectionHeader
        title={translations.sectionTitle}
        action={<ArrowLink href="/media/news">{translations.allNewsText}</ArrowLink>}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <MediaCard
          variant="overlay"
          href={`/media/news/${featured.slug}`}
          title={getLocalizedTitle(featured, locale)}
          image={featured.image}
          aspect="aspect-[4/3] lg:aspect-auto"
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="lg:col-span-7 lg:min-h-[440px]"
          badge={<Badge variant="brand">{getNewsCategoryLabel(featured.category, locale)}</Badge>}
          meta={<NewsDate date={featured.publishedAt} locale={locale} />}
        />

        {rest.length > 0 && (
          <ul className="flex flex-col divide-y lg:col-span-5">
            {rest.map((item) => (
              <li key={item.id} className="py-5 first:pt-0 last:pb-0">
                <MediaCard
                  variant="row"
                  href={`/media/news/${item.slug}`}
                  title={getLocalizedTitle(item, locale)}
                  image={item.image}
                  badge={
                    <span className="type-eyebrow text-gold-strong">
                      {getNewsCategoryLabel(item.category, locale)}
                    </span>
                  }
                  meta={<NewsDate date={item.publishedAt} locale={locale} />}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
